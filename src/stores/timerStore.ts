import { create } from "zustand";
import type { TimerState, WeaponEffect } from "../types";
import * as cmd from "../lib/commands";

interface TimerStore {
  timer: TimerState;
  setTimer: (state: TimerState) => void;
  startHunt: (
    taskId: number,
    taskName: string,
    pomodoroId?: number,
    weaponEffect?: WeaponEffect
  ) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  retreat: () => Promise<void>;
  advancePhase: () => Promise<void>;
}

const initialTimer: TimerState = {
  phase: "idle",
  remaining_seconds: 0,
  total_seconds: 0,
  pomodoro_remaining_seconds: 0,
  pomodoro_total_seconds: 0,
  task_id: null,
  task_name: "",
  pomodoro_id: null,
  rounds_completed: 0,
  is_paused: false,
};

export const useTimerStore = create<TimerStore>((set) => ({
  timer: initialTimer,
  setTimer: (timer) => set({ timer }),
  startHunt: async (taskId, taskName, pomodoroId, weaponEffect) => {
    const timer = await cmd.startTimer({
      taskId,
      taskName,
      pomodoroId,
      focusMinutes: weaponEffect?.focus_minutes,
      breakMinutes: weaponEffect?.break_minutes,
      longBreakMinutes: weaponEffect?.long_break_minutes,
      roundsBeforeLongBreak: weaponEffect?.rounds_before_long_break,
    });
    set({ timer });
  },
  pause: async () => {
    const timer = await cmd.pauseTimer(true);
    set({ timer });
  },
  resume: async () => {
    const timer = await cmd.resumeTimer();
    set({ timer });
  },
  retreat: async () => {
    const timer = await cmd.retreatTimer();
    set({ timer });
  },
  advancePhase: async () => {
    const timer = await cmd.advanceTimerPhase();
    set({ timer });
  },
}));
