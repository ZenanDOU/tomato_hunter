import { create } from "zustand";
import type { TimerState, TimerMode } from "../types";
import * as cmd from "../lib/commands";

interface TimerStore {
  timer: TimerState;
  isProcessing: boolean;
  setTimer: (state: TimerState) => void;
  startHunt: (
    taskId: number,
    taskName: string,
    pomodoroId?: number,
    timerMode?: TimerMode
  ) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  retreat: () => Promise<TimerState>;
  advancePhase: () => Promise<void>;
  daggerChoose: (action: boolean) => Promise<void>;
  extendFocus: (minutes: number) => Promise<void>;
  extendBreak: (minutes: number) => Promise<void>;
  shortenFocus: (minutes: number) => Promise<void>;
  skipPrep: () => Promise<void>;
  skipReview: () => Promise<void>;
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
  timer_mode: "sword",
  dagger_action_count: 0,
  hammer_focus_elapsed: 0,
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: initialTimer,
  isProcessing: false,
  setTimer: (timer) => set({ timer }),
  startHunt: async (taskId, taskName, pomodoroId, timerMode) => {
    if (get().isProcessing) return;
    set({ isProcessing: true });
    try {
      const timer = await cmd.startTimer({
        taskId,
        taskName,
        pomodoroId,
        timerMode: timerMode || "sword",
      });
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] startHunt failed:", error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },
  pause: async () => {
    if (get().isProcessing) return;
    set({ isProcessing: true });
    try {
      const timer = await cmd.pauseTimer(true);
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] pause failed:", error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },
  resume: async () => {
    if (get().isProcessing) return;
    set({ isProcessing: true });
    try {
      const timer = await cmd.resumeTimer();
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] resume failed:", error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },
  retreat: async () => {
    if (get().isProcessing) return get().timer;
    set({ isProcessing: true });
    try {
      const timer = await cmd.retreatTimer();
      set({ timer });
      return timer;
    } catch (error) {
      console.error("[TimerStore] retreat failed:", error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },
  advancePhase: async () => {
    if (get().isProcessing) return;
    set({ isProcessing: true });
    try {
      const timer = await cmd.advanceTimerPhase();
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] advancePhase failed:", error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },
  daggerChoose: async (action: boolean) => {
    if (get().isProcessing) return;
    set({ isProcessing: true });
    try {
      const timer = await cmd.daggerChoose(action);
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] daggerChoose failed:", error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },
  extendFocus: async (minutes: number) => {
    try {
      const timer = await cmd.extendFocus(minutes);
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] extendFocus failed:", error);
      throw error;
    }
  },
  extendBreak: async (minutes: number) => {
    try {
      const timer = await cmd.extendBreak(minutes);
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] extendBreak failed:", error);
      throw error;
    }
  },
  shortenFocus: async (minutes: number) => {
    try {
      const timer = await cmd.shortenFocus(minutes);
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] shortenFocus failed:", error);
      throw error;
    }
  },
  skipPrep: async () => {
    try {
      const timer = await cmd.skipPrep();
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] skipPrep failed:", error);
      throw error;
    }
  },
  skipReview: async () => {
    try {
      const timer = await cmd.skipReview();
      set({ timer });
    } catch (error) {
      console.error("[TimerStore] skipReview failed:", error);
      throw error;
    }
  },
}));
