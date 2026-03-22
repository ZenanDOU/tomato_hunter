use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;

const DAGGER_FOCUS_SECONDS: u64 = 900; // 15 min

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerPhase {
    Idle,
    Prep,
    Focus,
    Review,
    Break,
    LongBreak,
    AwaitingChoice, // Dagger mode: waiting for user to choose action or rest
    DaggerRest,     // Dagger mode: user chose rest (15 min)
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerMode {
    Sword,
    Dagger,
    Hammer,
}

impl Default for TimerMode {
    fn default() -> Self {
        TimerMode::Sword
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerConfig {
    pub mode: TimerMode,
    pub prep_seconds: u64,
    pub focus_seconds: u64,
    pub review_seconds: u64,
    pub break_seconds: u64,
    pub long_break_seconds: u64,
    pub rounds_before_long_break: u32,
}

impl Default for TimerConfig {
    fn default() -> Self {
        Self::sword()
    }
}

impl TimerConfig {
    pub fn sword() -> Self {
        Self {
            mode: TimerMode::Sword,
            prep_seconds: 120,    // 2 min
            focus_seconds: 1200,  // 20 min
            review_seconds: 180,  // 3 min
            break_seconds: 300,   // 5 min
            long_break_seconds: 900, // 15 min
            rounds_before_long_break: 4,
        }
    }

    pub fn dagger() -> Self {
        Self {
            mode: TimerMode::Dagger,
            prep_seconds: 0,
            focus_seconds: DAGGER_FOCUS_SECONDS,
            review_seconds: 0,
            break_seconds: 0,
            long_break_seconds: 0,
            rounds_before_long_break: 0,
        }
    }

    pub fn hammer() -> Self {
        Self {
            mode: TimerMode::Hammer,
            prep_seconds: 180,    // 3 min
            focus_seconds: 2640,  // 44 min
            review_seconds: 180,  // 3 min
            break_seconds: 0,
            long_break_seconds: 0,
            rounds_before_long_break: 0,
        }
    }

    pub fn from_mode(mode: TimerMode) -> Self {
        match mode {
            TimerMode::Sword => Self::sword(),
            TimerMode::Dagger => Self::dagger(),
            TimerMode::Hammer => Self::hammer(),
        }
    }

    /// Keep backward compat: create sword config from weapon effect params
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
            mode: TimerMode::Sword,
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
            TimerPhase::AwaitingChoice => 0, // no timer, waits for user
            TimerPhase::DaggerRest => DAGGER_FOCUS_SECONDS,
        }
    }

    pub fn break_phase_for_round(&self, round: u32) -> TimerPhase {
        if self.rounds_before_long_break > 0
            && round > 0
            && round % self.rounds_before_long_break == 0
        {
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
    pub timer_mode: TimerMode,
    pub dagger_action_count: u32,
    /// For hammer: total focus seconds elapsed (across pauses)
    pub hammer_focus_elapsed: u64,
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
    // Dagger mode
    pub dagger_action_count: u32,
    // Hammer mode: track total focus elapsed for half-reward check
    pub hammer_focus_elapsed: u64,
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
            dagger_action_count: 0,
            hammer_focus_elapsed: 0,
        }
    }

    pub fn start(&mut self, config: TimerConfig, task_id: i64, task_name: String) {
        let mode = config.mode;
        self.config = config;
        self.elapsed_before_pause = 0;
        self.is_paused = false;
        self.pause_started_at = None;
        self.task_id = Some(task_id);
        self.task_name = task_name;
        self.pomodoro_id = None;
        self.dagger_action_count = 0;
        self.hammer_focus_elapsed = 0;

        // Set starting phase based on mode
        match mode {
            TimerMode::Sword | TimerMode::Hammer => {
                self.phase = TimerPhase::Prep;
                self.phase_start = Some(Instant::now());
            }
            TimerMode::Dagger => {
                // Dagger starts with AwaitingChoice (user picks action or rest)
                self.phase = TimerPhase::AwaitingChoice;
                self.phase_start = None;
            }
        }
    }

    pub fn pause(&mut self) -> bool {
        if self.is_paused || self.phase == TimerPhase::Idle || self.phase == TimerPhase::AwaitingChoice {
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
        if total == 0 {
            return 0;
        }
        let elapsed = self.elapsed_in_phase();
        total.saturating_sub(elapsed)
    }

    pub fn is_phase_complete(&self) -> bool {
        let total = self.config.duration_for_phase(self.phase);
        if total == 0 {
            return false; // phases with 0 duration don't auto-complete
        }
        self.phase != TimerPhase::Idle
            && self.phase != TimerPhase::AwaitingChoice
            && self.remaining_in_phase() == 0
    }

    pub fn pause_elapsed(&self) -> u64 {
        self.pause_started_at
            .map(|s| s.elapsed().as_secs())
            .unwrap_or(0)
    }

    pub fn is_pause_expired(&self) -> bool {
        self.is_paused && self.pause_elapsed() >= self.max_pause_seconds
    }

    /// Get total focus time elapsed (for hammer half-reward check)
    pub fn total_focus_elapsed(&self) -> u64 {
        if self.phase == TimerPhase::Focus {
            self.hammer_focus_elapsed + self.elapsed_in_phase()
        } else {
            self.hammer_focus_elapsed
        }
    }

    /// Dagger mode: user chooses action or rest
    pub fn dagger_choose(&mut self, action: bool) {
        if self.phase != TimerPhase::AwaitingChoice {
            return;
        }
        // Reset focus_seconds to prevent consumable effects leaking across rounds
        self.config.focus_seconds = DAGGER_FOCUS_SECONDS;
        if action {
            self.dagger_action_count += 1;
            self.phase = TimerPhase::Focus;
        } else {
            self.phase = TimerPhase::DaggerRest;
        }
        self.phase_start = Some(Instant::now());
        self.elapsed_before_pause = 0;
    }

    pub fn advance_phase(&mut self) -> TimerPhase {
        // Track hammer focus elapsed before leaving focus phase
        if self.phase == TimerPhase::Focus && self.config.mode == TimerMode::Hammer {
            self.hammer_focus_elapsed += self.elapsed_in_phase();
        }

        // Transfer remaining prep time to focus duration
        let prep_remaining = if self.phase == TimerPhase::Prep {
            self.remaining_in_phase().min(self.config.prep_seconds)
        } else {
            0
        };

        let next = match self.config.mode {
            TimerMode::Sword => self.advance_sword(),
            TimerMode::Dagger => self.advance_dagger(),
            TimerMode::Hammer => self.advance_hammer(),
        };

        // Add unused prep time to focus phase
        if next == TimerPhase::Focus && prep_remaining > 0 {
            self.config.focus_seconds += prep_remaining;
        }

        self.phase = next;
        if next == TimerPhase::AwaitingChoice {
            self.phase_start = None; // no timer for choice
        } else {
            self.phase_start = Some(Instant::now());
        }
        self.elapsed_before_pause = 0;
        self.is_paused = false;
        self.pause_started_at = None;
        next
    }

    fn advance_sword(&mut self) -> TimerPhase {
        match self.phase {
            TimerPhase::Idle => TimerPhase::Prep,
            TimerPhase::Prep => TimerPhase::Focus,
            TimerPhase::Focus => TimerPhase::Review,
            TimerPhase::Review => {
                self.rounds_completed += 1;
                self.config.break_phase_for_round(self.rounds_completed)
            }
            TimerPhase::Break | TimerPhase::LongBreak => TimerPhase::Idle,
            _ => TimerPhase::Idle,
        }
    }

    fn advance_dagger(&mut self) -> TimerPhase {
        match self.phase {
            TimerPhase::AwaitingChoice => TimerPhase::AwaitingChoice, // shouldn't happen
            TimerPhase::Focus | TimerPhase::DaggerRest => TimerPhase::AwaitingChoice,
            _ => TimerPhase::AwaitingChoice,
        }
    }

    fn advance_hammer(&mut self) -> TimerPhase {
        match self.phase {
            TimerPhase::Idle => TimerPhase::Prep,
            TimerPhase::Prep => TimerPhase::Focus,
            TimerPhase::Focus => TimerPhase::Review,
            TimerPhase::Review => {
                self.rounds_completed += 1;
                TimerPhase::Idle // hammer: return to village, no break
            }
            _ => TimerPhase::Idle,
        }
    }

    // ----- Consumable timer modifiers -----

    pub fn extend_focus(&mut self, extra_seconds: u64) {
        if self.phase == TimerPhase::Focus || self.phase == TimerPhase::Review {
            self.config.focus_seconds += extra_seconds;
            // If in review, rewind to focus with the extra time
            if self.phase == TimerPhase::Review {
                self.phase = TimerPhase::Focus;
                // Set elapsed so remaining = extra_seconds
                let new_total = self.config.focus_seconds;
                self.elapsed_before_pause = new_total.saturating_sub(extra_seconds);
                self.phase_start = Some(Instant::now());
            }
        }
    }

    pub fn extend_break(&mut self, extra_seconds: u64) {
        if self.phase == TimerPhase::Break || self.phase == TimerPhase::LongBreak {
            match self.phase {
                TimerPhase::Break => self.config.break_seconds += extra_seconds,
                TimerPhase::LongBreak => self.config.long_break_seconds += extra_seconds,
                _ => {}
            }
        }
    }

    pub fn shorten_focus(&mut self, reduce_seconds: u64) {
        if self.phase == TimerPhase::Focus {
            let elapsed = self.elapsed_in_phase();
            let remaining = self.config.focus_seconds.saturating_sub(elapsed);
            // Ensure at least 60 seconds remain
            let max_reduce = remaining.saturating_sub(60);
            let actual_reduce = reduce_seconds.min(max_reduce);
            self.config.focus_seconds = self.config.focus_seconds.saturating_sub(actual_reduce);
        }
    }

    pub fn skip_prep(&mut self) {
        if self.phase == TimerPhase::Prep {
            // Transfer remaining prep time to focus
            let prep_remaining = self.remaining_in_phase().min(self.config.prep_seconds);
            self.config.focus_seconds += prep_remaining;
            self.phase = TimerPhase::Focus;
            self.phase_start = Some(Instant::now());
            self.elapsed_before_pause = 0;
        }
    }

    pub fn skip_review(&mut self) {
        if self.phase == TimerPhase::Review {
            // Advance past review
            let next = match self.config.mode {
                TimerMode::Sword => {
                    self.rounds_completed += 1;
                    self.config.break_phase_for_round(self.rounds_completed)
                }
                TimerMode::Hammer => {
                    self.rounds_completed += 1;
                    TimerPhase::Idle
                }
                _ => TimerPhase::Idle,
            };
            self.phase = next;
            self.phase_start = Some(Instant::now());
            self.elapsed_before_pause = 0;
        }
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
            TimerPhase::Focus => phase_remaining + self.config.review_seconds,
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
            timer_mode: self.config.mode,
            dagger_action_count: self.dagger_action_count,
            hammer_focus_elapsed: self.total_focus_elapsed(),
        }
    }
}

pub type SharedTimer = Arc<Mutex<TimerEngine>>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sword_default_phase_durations() {
        let config = TimerConfig::sword();
        assert_eq!(config.prep_seconds, 120);
        assert_eq!(config.review_seconds, 180);
        assert_eq!(config.focus_seconds, 1200);
    }

    #[test]
    fn test_dagger_config() {
        let config = TimerConfig::dagger();
        assert_eq!(config.focus_seconds, 900);
        assert_eq!(config.prep_seconds, 0);
        assert_eq!(config.review_seconds, 0);
    }

    #[test]
    fn test_hammer_config() {
        let config = TimerConfig::hammer();
        assert_eq!(config.prep_seconds, 180);
        assert_eq!(config.focus_seconds, 2640);
        assert_eq!(config.review_seconds, 180);
    }

    #[test]
    fn test_sword_phase_transitions() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::sword(), 1, "Test".to_string());
        assert_eq!(engine.phase, TimerPhase::Prep);
        engine.phase = TimerPhase::Focus;
        let next = engine.advance_phase();
        assert_eq!(next, TimerPhase::Review);
    }

    #[test]
    fn test_dagger_starts_with_awaiting_choice() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::dagger(), 1, "Test".to_string());
        assert_eq!(engine.phase, TimerPhase::AwaitingChoice);
    }

    #[test]
    fn test_dagger_choose_action() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::dagger(), 1, "Test".to_string());
        engine.dagger_choose(true);
        assert_eq!(engine.phase, TimerPhase::Focus);
        assert_eq!(engine.dagger_action_count, 1);
        assert_eq!(engine.config.focus_seconds, DAGGER_FOCUS_SECONDS);
    }

    #[test]
    fn test_dagger_choose_rest() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::dagger(), 1, "Test".to_string());
        engine.dagger_choose(false);
        assert_eq!(engine.phase, TimerPhase::DaggerRest);
        assert_eq!(engine.dagger_action_count, 0);
        assert_eq!(engine.config.focus_seconds, DAGGER_FOCUS_SECONDS);
    }

    #[test]
    fn test_dagger_focus_advances_to_choice() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::dagger(), 1, "Test".to_string());
        engine.dagger_choose(true);
        let next = engine.advance_phase();
        assert_eq!(next, TimerPhase::AwaitingChoice);
    }

    #[test]
    fn test_hammer_no_chaining() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::hammer(), 1, "Test".to_string());
        engine.phase = TimerPhase::Review;
        let next = engine.advance_phase();
        assert_eq!(next, TimerPhase::Idle);
    }

    #[test]
    fn test_long_break_after_rounds() {
        let config = TimerConfig::sword();
        assert_eq!(config.break_phase_for_round(3), TimerPhase::Break);
        assert_eq!(config.break_phase_for_round(4), TimerPhase::LongBreak);
    }

    #[test]
    fn test_pause_and_resume() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::sword(), 1, "Test".to_string());
        assert!(engine.pause());
        assert!(engine.is_paused);
        assert!(!engine.pause());
        engine.resume();
        assert!(!engine.is_paused);
    }

    #[test]
    fn test_retreat_resets_state() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::sword(), 1, "Test".to_string());
        engine.retreat();
        assert_eq!(engine.phase, TimerPhase::Idle);
        assert_eq!(engine.task_id, None);
    }

    #[test]
    fn test_dagger_choose_resets_focus_after_shorten() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::dagger(), 1, "Test".to_string());
        engine.dagger_choose(true); // Focus phase
        // Simulate using shorten_focus consumable
        engine.config.focus_seconds = 600; // shortened from 900 to 600
        // Advance to AwaitingChoice
        engine.advance_phase();
        assert_eq!(engine.phase, TimerPhase::AwaitingChoice);
        // Choose next action — focus_seconds should reset
        engine.dagger_choose(true);
        assert_eq!(engine.config.focus_seconds, DAGGER_FOCUS_SECONDS);
        assert_eq!(engine.phase, TimerPhase::Focus);
    }

    #[test]
    fn test_dagger_rest_duration_independent_of_focus() {
        let mut engine = TimerEngine::new();
        engine.start(TimerConfig::dagger(), 1, "Test".to_string());
        // Mutate focus_seconds to simulate consumable effect
        engine.config.focus_seconds = 300;
        // DaggerRest should still use the constant
        assert_eq!(
            engine.config.duration_for_phase(TimerPhase::DaggerRest),
            DAGGER_FOCUS_SECONDS
        );
    }
}
