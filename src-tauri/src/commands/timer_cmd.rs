use crate::timer::{SharedTimer, TimerConfig, TimerPhase, TimerSnapshot};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
pub fn start_timer(
    timer: State<'_, SharedTimer>,
    task_id: i64,
    task_name: String,
    pomodoro_id: Option<i64>,
    focus_minutes: Option<u64>,
    break_minutes: Option<u64>,
    long_break_minutes: Option<u64>,
    rounds_before_long_break: Option<u32>,
) -> Result<TimerSnapshot, String> {
    let config = TimerConfig::from_weapon_effect(
        focus_minutes.unwrap_or(25),
        break_minutes.unwrap_or(5),
        long_break_minutes.unwrap_or(15),
        rounds_before_long_break.unwrap_or(4),
    );
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.start(config, task_id, task_name);
    if let Some(pid) = pomodoro_id {
        engine.pomodoro_id = Some(pid);
    }
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn pause_timer(
    timer: State<'_, SharedTimer>,
    has_consumable: bool,
) -> Result<TimerSnapshot, String> {
    if !has_consumable {
        return Err("没有暂停道具（烟雾弹），无法暂停".to_string());
    }
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.pause();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn resume_timer(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.resume();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn retreat_timer(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.retreat();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn advance_timer_phase(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.advance_phase();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn get_timer_state(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let engine = timer.lock().map_err(|e| e.to_string())?;
    Ok(engine.snapshot())
}

/// Background thread that emits timer_tick events every second,
/// auto-advances phases, and handles pause timeout.
pub fn start_tick_loop(app: AppHandle, timer: SharedTimer) {
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(1));

        let mut should_retreat = false;
        let mut should_advance: Option<TimerPhase> = None;

        // Check state
        {
            let engine = timer.lock().unwrap();
            if engine.phase == TimerPhase::Idle {
                continue;
            }

            // Check pause timeout
            if engine.is_pause_expired() {
                should_retreat = true;
            }
            // Check phase completion (auto-advance prep→focus and focus→review only)
            else if engine.is_phase_complete() {
                let phase = engine.phase;
                if phase == TimerPhase::Prep || phase == TimerPhase::Focus {
                    should_advance = Some(phase);
                }
            }
        }

        // Handle pause timeout retreat
        if should_retreat {
            let mut engine = timer.lock().unwrap();
            engine.retreat();
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);
            let _ = app.emit("pause_timeout_retreat", &());
            continue;
        }

        // Handle auto-advance
        if let Some(completed_phase) = should_advance {
            let mut engine = timer.lock().unwrap();
            let new_phase = engine.advance_phase();
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);
            let _ = app.emit("phase_changed", &new_phase);

            // Send notifications at key transitions
            if completed_phase == TimerPhase::Focus {
                // Focus → Review: notify
                let _ = app
                    .notification()
                    .builder()
                    .title("专注阶段结束")
                    .body("进入回顾阶段，记录你的成果")
                    .show();
            }
            continue;
        }

        // Normal tick
        {
            let engine = timer.lock().unwrap();
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);

            // Pause timeout warning at 2:30 of 3:00
            if engine.is_paused {
                let pause_elapsed = engine.pause_elapsed();
                if pause_elapsed == 150 {
                    // 2:30
                    let _ = app
                        .notification()
                        .builder()
                        .title("暂停即将超时")
                        .body("30秒后自动撤退")
                        .show();
                }
            }
        }
    });
}
