use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub async fn open_hunt_window(app: AppHandle) -> Result<(), String> {
    // Close existing hunt window if any
    if let Some(w) = app.get_webview_window("hunt") {
        let _ = w.close();
    }

    // Open larger for prep phase (will resize to compact for focus)
    let window =
        WebviewWindowBuilder::new(&app, "hunt", WebviewUrl::App("hunt.html".into()))
            .title("狩猎中")
            .inner_size(600.0, 520.0)
            .resizable(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .build()
            .map_err(|e| e.to_string())?;

    // Intercept close: emit event instead of closing
    let app_clone = app.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            match app_clone.emit("hunt_window_close_requested", &()) {
                Ok(_) => {
                    api.prevent_close();
                }
                Err(e) => {
                    eprintln!("[window] failed to emit close event, allowing close: {}", e);
                    // Don't prevent close — let the window close as fallback
                }
            }
        }
    });

    // Hide main window
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.hide();
    }

    Ok(())
}

#[tauri::command]
pub async fn close_hunt_window(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("hunt") {
        // Remove close prevention by destroying
        w.destroy().map_err(|e| e.to_string())?;
    }
    // Show main window
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.show();
        let _ = main_win.set_focus();
    }
    Ok(())
}

#[tauri::command]
pub async fn resize_hunt_window(app: AppHandle, width: f64, height: f64) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("hunt") {
        w.set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
