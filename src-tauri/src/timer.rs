use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerPhase {
    Idle,
    Prep,
    Focus,
    Review,
    Break,
    LongBreak,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerConfig {
    pub prep_seconds: u64,
    pub focus_seconds: u64,
    pub review_seconds: u64,
    pub break_seconds: u64,
    pub long_break_seconds: u64,
    pub rounds_before_long_break: u32,
}

impl Default for TimerConfig {
    fn default() -> Self {
        Self::from_weapon_effect(25, 5, 15, 4)
    }
}

impl TimerConfig {
    pub fn from_focus_minutes(total_minutes: u64) -> Self {
        Self::from_weapon_effect(total_minutes, 5, 15, 4)
    }

    pub fn from_weapon_effect(
        focus_minutes: u64,
        break_minutes: u64,
        long_break_minutes: u64,
        rounds: u32,
    ) -> Self {
        let total_seconds = focus_minutes * 60;
        let prep_seconds: u64 = 120;
        let review_seconds: u64 = 180;
        let focus_seconds = total_seconds.saturating_sub(prep_seconds + review_seconds);
        Self {
            prep_seconds,
            focus_seconds,
            review_seconds,
            break_seconds: break_minutes * 60,
            long_break_seconds: long_break_minutes * 60,
            rounds_before_long_break: rounds,
        }
    }

    pub fn duration_for_phase(&self, phase: TimerPhase) -> u64 {
        match phase {
            TimerPhase::Idle => 0,
            TimerPhase::Prep => self.prep_seconds,
            TimerPhase::Focus => self.focus_seconds,
            TimerPhase::Review => self.review_seconds,
            TimerPhase::Break => self.break_seconds,
            TimerPhase::LongBreak => self.long_break_seconds,
        }
    }

    pub fn next_phase(&self, current: TimerPhase) -> TimerPhase {
        match current {
            TimerPhase::Idle => TimerPhase::Prep,
            TimerPhase::Prep => TimerPhase::Focus,
            TimerPhase::Focus => TimerPhase::Review,
            TimerPhase::Review => TimerPhase::Break,
            TimerPhase::Break => TimerPhase::Idle,
            TimerPhase::LongBreak => TimerPhase::Idle,
        }
    }

    pub fn break_phase_for_round(&self, round: u32) -> TimerPhase {
        if round > 0 && round % self.rounds_before_long_break == 0 {
            TimerPhase::LongBreak
        } else {
            TimerPhase::Break
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TimerSnapshot {
    pub phase: TimerPhase,
    pub remaining_seconds: u64,
    pub total_seconds: u64,
    pub pomodoro_remaining_seconds: u64,
    pub pomodoro_total_seconds: u64,
    pub task_id: Option<i64>,
    pub task_name: String,
    pub pomodoro_id: Option<i64>,
    pub rounds_completed: u32,
    pub is_paused: bool,
}

pub struct TimerEngine {
    pub config: TimerConfig,
    pub phase: TimerPhase,
    pub phase_start: Option<Instant>,
    pub elapsed_before_pause: u64,
    pub is_paused: bool,
    pub pause_started_at: Option<Instant>,
    pub max_pause_seconds: u64,
    pub task_id: Option<i64>,
    pub task_name: String,
    pub pomodoro_id: Option<i64>,
    pub rounds_completed: u32,
}

impl TimerEngine {
    pub fn new() -> Self {
        Self {
            config: TimerConfig::default(),
            phase: TimerPhase::Idle,
            phase_start: None,
            elapsed_before_pause: 0,
            is_paused: false,
            pause_started_at: None,
            max_pause_seconds: 180,
            task_id: None,
            task_name: String::new(),
            pomodoro_id: None,
            rounds_completed: 0,
        }
    }

    pub fn start(&mut self, config: TimerConfig, task_id: i64, task_name: String) {
        self.config = config;
        self.phase = TimerPhase::Prep;
        self.phase_start = Some(Instant::now());
        self.elapsed_before_pause = 0;
        self.is_paused = false;
        self.pause_started_at = None;
        self.task_id = Some(task_id);
        self.task_name = task_name;
        self.pomodoro_id = None;
    }

    pub fn pause(&mut self) -> bool {
        if self.is_paused || self.phase == TimerPhase::Idle {
            return false;
        }
        if let Some(start) = self.phase_start {
            self.elapsed_before_pause += start.elapsed().as_secs();
        }
        self.is_paused = true;
        self.pause_started_at = Some(Instant::now());
        self.phase_start = None;
        true
    }

    pub fn resume(&mut self) {
        if self.is_paused {
            self.is_paused = false;
            self.pause_started_at = None;
            self.phase_start = Some(Instant::now());
        }
    }

    pub fn retreat(&mut self) {
        self.phase = TimerPhase::Idle;
        self.phase_start = None;
        self.is_paused = false;
        self.pause_started_at = None;
        self.elapsed_before_pause = 0;
        self.task_id = None;
        self.task_name.clear();
        self.pomodoro_id = None;
    }

    pub fn elapsed_in_phase(&self) -> u64 {
        let running = if let Some(start) = self.phase_start {
            start.elapsed().as_secs()
        } else {
            0
        };
        self.elapsed_before_pause + running
    }

    pub fn remaining_in_phase(&self) -> u64 {
        let total = self.config.duration_for_phase(self.phase);
        let elapsed = self.elapsed_in_phase();
        total.saturating_sub(elapsed)
    }

    pub fn is_phase_complete(&self) -> bool {
        self.phase != TimerPhase::Idle && self.remaining_in_phase() == 0
    }

    pub fn pause_elapsed(&self) -> u64 {
        self.pause_started_at
            .map(|s| s.elapsed().as_secs())
            .unwrap_or(0)
    }

    pub fn is_pause_expired(&self) -> bool {
        self.is_paused && self.pause_elapsed() >= self.max_pause_seconds
    }

    pub fn advance_phase(&mut self) -> TimerPhase {
        let next = if self.phase == TimerPhase::Review {
            self.rounds_completed += 1;
            self.config.break_phase_for_round(self.rounds_completed)
        } else {
            self.config.next_phase(self.phase)
        };
        self.phase = next;
        self.phase_start = Some(Instant::now());
        self.elapsed_before_pause = 0;
        self.is_paused = false;
        self.pause_started_at = None;
        next
    }

    /// Total pomodoro duration (prep + focus + review)
    pub fn pomodoro_total(&self) -> u64 {
        self.config.prep_seconds + self.config.focus_seconds + self.config.review_seconds
    }

    /// Remaining time across the entire pomodoro (continuous countdown)
    pub fn pomodoro_remaining(&self) -> u64 {
        let phase_remaining = self.remaining_in_phase();
        match self.phase {
            TimerPhase::Prep => {
                phase_remaining + self.config.focus_seconds + self.config.review_seconds
            }
            TimerPhase::Focus => {
                phase_remaining + self.config.review_seconds
            }
            TimerPhase::Review => phase_remaining,
            _ => 0,
        }
    }

    pub fn snapshot(&self) -> TimerSnapshot {
        let total = self.config.duration_for_phase(self.phase);
        TimerSnapshot {
            phase: self.phase,
            remaining_seconds: self.remaining_in_phase(),
            total_seconds: total,
            pomodoro_remaining_seconds: self.pomodoro_remaining(),
            pomodoro_total_seconds: self.pomodoro_total(),
            task_id: self.task_id,
            task_name: self.task_name.clone(),
            pomodoro_id: self.pomodoro_id,
            rounds_completed: self.rounds_completed,
            is_paused: self.is_paused,
        }
    }
}

pub type SharedTimer = Arc<Mutex<TimerEngine>>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_phase_durations() {
        let config = TimerConfig::default();
        assert_eq!(config.prep_seconds, 120);
        assert_eq!(config.review_seconds, 180);
        assert_eq!(config.focus_seconds, 1200); // 25*60 - 120 - 180
    }

    #[test]
    fn test_custom_weapon_phase_durations() {
        let config = TimerConfig::from_focus_minutes(50);
        assert_eq!(config.focus_seconds, 2700); // 50*60 - 120 - 180
    }

    #[test]
    fn test_phase_transitions() {
        let config = TimerConfig::default();
        assert_eq!(config.next_phase(TimerPhase::Prep), TimerPhase::Focus);
        assert_eq!(config.next_phase(TimerPhase::Focus), TimerPhase::Review);
        assert_eq!(config.next_phase(TimerPhase::Review), TimerPhase::Break);
    }

    #[test]
    fn test_long_break_after_rounds() {
        let config = TimerConfig::default();
        assert_eq!(config.break_phase_for_round(3), TimerPhase::Break);
        assert_eq!(config.break_phase_for_round(4), TimerPhase::LongBreak);
        assert_eq!(config.break_phase_for_round(8), TimerPhase::LongBreak);
    }

    #[test]
    fn test_engine_start_and_snapshot() {
        let mut engine = TimerEngine::new();
        let config = TimerConfig::default();
        engine.start(config, 1, "Test task".to_string());
        let snap = engine.snapshot();
        assert_eq!(snap.phase, TimerPhase::Prep);
        assert_eq!(snap.task_id, Some(1));
        assert_eq!(snap.task_name, "Test task");
        assert_eq!(snap.total_seconds, 120);
        assert!(!snap.is_paused);
    }

    #[test]
    fn test_pause_and_resume() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::default(), 1, "Test".to_string());
        assert!(engine.pause());
        assert!(engine.is_paused);
        // Pausing again returns false
        assert!(!engine.pause());
        engine.resume();
        assert!(!engine.is_paused);
    }

    #[test]
    fn test_retreat_resets_state() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::default(), 1, "Test".to_string());
        engine.retreat();
        assert_eq!(engine.phase, TimerPhase::Idle);
        assert_eq!(engine.task_id, None);
        assert!(engine.task_name.is_empty());
    }

    #[test]
    fn test_advance_phase_increments_rounds_after_review() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::default(), 1, "Test".to_string());
        engine.phase = TimerPhase::Review;
        engine.advance_phase();
        assert_eq!(engine.rounds_completed, 1);
        assert_eq!(engine.phase, TimerPhase::Break);
    }

    #[test]
    fn test_advance_to_long_break() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::default(), 1, "Test".to_string());
        engine.rounds_completed = 3;
        engine.phase = TimerPhase::Review;
        engine.advance_phase();
        assert_eq!(engine.rounds_completed, 4);
        assert_eq!(engine.phase, TimerPhase::LongBreak);
    }
}
