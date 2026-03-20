import { invoke } from "@tauri-apps/api/core";
import type { TimerState } from "../types";

// Timer commands
export const startTimer = (params: {
  taskId: number;
  taskName: string;
  pomodoroId?: number;
  focusMinutes?: number;
  breakMinutes?: number;
  longBreakMinutes?: number;
  roundsBeforeLongBreak?: number;
}) => invoke<TimerState>("start_timer", params);

export const pauseTimer = (hasConsumable: boolean) =>
  invoke<TimerState>("pause_timer", { hasConsumable });

export const resumeTimer = () => invoke<TimerState>("resume_timer");
export const retreatTimer = () => invoke<TimerState>("retreat_timer");
export const advanceTimerPhase = () =>
  invoke<TimerState>("advance_timer_phase");
export const getTimerState = () => invoke<TimerState>("get_timer_state");

// Window commands
export const openHuntWindow = () => invoke("open_hunt_window");
export const closeHuntWindow = () => invoke("close_hunt_window");
export const resizeHuntWindow = async (width: number, height: number) => {
  try {
    // Use Tauri window API directly for more reliable resizing
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    await win.setSize(new (await import("@tauri-apps/api/dpi")).LogicalSize(width, height));
  } catch {
    // Fallback to custom command
    await invoke("resize_hunt_window", { width, height });
  }
};
