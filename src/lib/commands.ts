import { invoke } from "@tauri-apps/api/core";
import type { TimerState } from "../types";

// Timer commands
export const startTimer = (params: {
  taskId: number;
  taskName: string;
  pomodoroId?: number;
  timerMode?: string;
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

// Dagger mode
export const daggerChoose = (action: boolean) =>
  invoke<TimerState>("dagger_choose", { action });

// Consumable timer modifiers
export const extendFocus = (extraMinutes: number) =>
  invoke<TimerState>("extend_focus", { extraMinutes });
export const extendBreak = (extraMinutes: number) =>
  invoke<TimerState>("extend_break", { extraMinutes });
export const shortenFocus = (reduceMinutes: number) =>
  invoke<TimerState>("shorten_focus", { reduceMinutes });
export const skipPrep = () => invoke<TimerState>("skip_prep");
export const skipReview = () => invoke<TimerState>("skip_review");

// Window commands
export const openHuntWindow = () => invoke("open_hunt_window");
export const closeHuntWindow = () => invoke("close_hunt_window");
export const resizeHuntWindow = async (width: number, height: number) => {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    await win.setSize(new (await import("@tauri-apps/api/dpi")).LogicalSize(width, height));
  } catch {
    await invoke("resize_hunt_window", { width, height });
  }
};
