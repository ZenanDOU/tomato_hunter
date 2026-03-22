use crate::timer::{SharedTimer, TimerConfig, TimerMode, TimerPhase, TimerSnapshot};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
pub fn start_timer(
    timer: State<'_, SharedTimer>,
    task_id: i64,
    task_name: String,
    pomodoro_id: Option<i64>,
    timer_mode: Option<String>,
    // Legacy params (for backward compat)
    focus_minutes: Option<u64>,
    break_minutes: Option<u64>,
    long_break_minutes: Option<u64>,
    rounds_before_long_break: Option<u32>,
) -> Result<TimerSnapshot, String> {
    let config = if let Some(mode_str) = timer_mode {
        let mode = match mode_str.as_str() {
            "dagger" => TimerMode::Dagger,
            "hammer" => TimerMode::Hammer,
            _ => TimerMode::Sword,
        };
        TimerConfig::from_mode(mode)
    } else {
        TimerConfig::from_weapon_effect(
            focus_minutes.unwrap_or(25),
            break_minutes.unwrap_or(5),
            long_break_minutes.unwrap_or(15),
            rounds_before_long_break.unwrap_or(4),
        )
    };
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
    let snap = engine.snapshot();
    engine.retreat();
    Ok(snap) // return snapshot BEFORE retreat so caller can check hammer_focus_elapsed
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

// ----- Dagger mode command -----

#[tauri::command]
pub fn dagger_choose(
    timer: State<'_, SharedTimer>,
    action: bool,
) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.dagger_choose(action);
    Ok(engine.snapshot())
}

// ----- Consumable timer modifier commands -----

#[tauri::command]
pub fn extend_focus(
    timer: State<'_, SharedTimer>,
    extra_minutes: u64,
) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.extend_focus(extra_minutes * 60);
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn extend_break(
    timer: State<'_, SharedTimer>,
    extra_minutes: u64,
) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.extend_break(extra_minutes * 60);
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn shorten_focus(
    timer: State<'_, SharedTimer>,
    reduce_minutes: u64,
) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.shorten_focus(reduce_minutes * 60);
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn skip_prep(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.skip_prep();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn skip_review(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.skip_review();
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
            let engine = match timer.lock() {
                Ok(e) => e,
                Err(e) => {
                    eprintln!("[timer_tick] mutex poisoned during state check: {}", e);
                    continue;
                }
            };
            if engine.phase == TimerPhase::Idle || engine.phase == TimerPhase::AwaitingChoice {
                // Idle or waiting for dagger choice — just emit tick if awaiting
                if engine.phase == TimerPhase::AwaitingChoice {
                    let snapshot = engine.snapshot();
                    let _ = app.emit("timer_tick", &snapshot);
                }
                continue;
            }

            // Check pause timeout
            if engine.is_pause_expired() {
                should_retreat = true;
            }
            // Check phase completion
            else if engine.is_phase_complete() {
                let phase = engine.phase;
                match engine.config.mode {
                    TimerMode::Sword => {
                        if phase == TimerPhase::Prep || phase == TimerPhase::Focus
                            || phase == TimerPhase::Break || phase == TimerPhase::LongBreak
                        {
                            should_advance = Some(phase);
                        }
                    }
                    TimerMode::Dagger => {
                        // Focus or DaggerRest complete → advance to AwaitingChoice
                        if phase == TimerPhase::Focus || phase == TimerPhase::DaggerRest {
                            should_advance = Some(phase);
                        }
                    }
                    TimerMode::Hammer => {
                        if phase == TimerPhase::Prep || phase == TimerPhase::Focus {
                            should_advance = Some(phase);
                        }
                    }
                }
            }
        }

        // Handle pause timeout retreat
        if should_retreat {
            let mut engine = match timer.lock() {
                Ok(e) => e,
                Err(e) => {
                    eprintln!("[timer_tick] mutex poisoned during retreat: {}", e);
                    continue;
                }
            };
            engine.retreat();
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);
            let _ = app.emit("pause_timeout_retreat", &());
            continue;
        }

        // Handle auto-advance
        if let Some(completed_phase) = should_advance {
            let mut engine = match timer.lock() {
                Ok(e) => e,
                Err(e) => {
                    eprintln!("[timer_tick] mutex poisoned during advance: {}", e);
                    continue;
                }
            };
            let new_phase = engine.advance_phase();
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);
            let _ = app.emit("phase_changed", &new_phase);

            // Send notifications at key transitions
            if completed_phase == TimerPhase::Focus {
                match engine.config.mode {
                    TimerMode::Sword | TimerMode::Hammer => {
                        let _ = app
                            .notification()
                            .builder()
                            .title("专注阶段结束")
                            .body("进入回顾阶段，记录你的成果")
                            .show();
                    }
                    TimerMode::Dagger => {
                        let _ = app
                            .notification()
                            .builder()
                            .title("行动结束")
                            .body("选择继续行动还是休息")
                            .show();
                    }
                }
            }
            if completed_phase == TimerPhase::DaggerRest {
                let _ = app
                    .notification()
                    .builder()
                    .title("休息结束")
                    .body("选择继续行动还是休息")
                    .show();
            }
            if completed_phase == TimerPhase::Break || completed_phase == TimerPhase::LongBreak {
                let _ = app.emit("break_complete", &());
                let _ = app
                    .notification()
                    .builder()
                    .title("休息结束")
                    .body("准备开始下一个番茄吧！")
                    .show();
            }
            continue;
        }

        // Normal tick
        {
            let engine = match timer.lock() {
                Ok(e) => e,
                Err(e) => {
                    eprintln!("[timer_tick] mutex poisoned during normal tick: {}", e);
                    continue;
                }
            };
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);

            // Pause timeout warning at 2:30 of 3:00
            if engine.is_paused {
                let pause_elapsed = engine.pause_elapsed();
                if pause_elapsed == 150 {
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
