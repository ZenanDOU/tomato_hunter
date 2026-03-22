mod commands;
mod db;
mod monster_gen;
mod timer;

use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager};
use timer::TimerEngine;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let timer = Arc::new(Mutex::new(TimerEngine::new()));

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:tomato_hunter.db", db::migrations())
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .manage(timer.clone())
        .invoke_handler(tauri::generate_handler![
            commands::timer_cmd::start_timer,
            commands::timer_cmd::pause_timer,
            commands::timer_cmd::resume_timer,
            commands::timer_cmd::retreat_timer,
            commands::timer_cmd::advance_timer_phase,
            commands::timer_cmd::get_timer_state,
            commands::timer_cmd::dagger_choose,
            commands::timer_cmd::extend_focus,
            commands::timer_cmd::extend_break,
            commands::timer_cmd::shorten_focus,
            commands::timer_cmd::skip_prep,
            commands::timer_cmd::skip_review,
            commands::window_cmd::open_hunt_window,
            commands::window_cmd::close_hunt_window,
            commands::window_cmd::resize_hunt_window,
            commands::monster_cmd::generate_monster,
        ])
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Start timer tick loop
            commands::timer_cmd::start_tick_loop(app.handle().clone(), timer.clone());

            // Setup system tray
            use tauri::menu::{MenuBuilder, MenuItemBuilder};
            use tauri::tray::TrayIconBuilder;

            let show = MenuItemBuilder::with_id("show", "显示村庄").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "退出").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

            TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app: &AppHandle, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
