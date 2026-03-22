import { create } from "zustand";
import type { DailyPlan, PlannedTaskEntry } from "../types";
import { getDb, withTransaction } from "../lib/db";
import { useTaskStore } from "./taskStore";

interface PlanStore {
  plan: DailyPlan | null;
  loading: boolean;
  fetchTodayPlan: () => Promise<void>;
  setBudget: (budget: number) => Promise<void>;
  addTaskToPlan: (taskId: number, pomodoros: number) => Promise<void>;
  removeTaskFromPlan: (entryId: number) => Promise<void>;
  incrementCompleted: (taskId: number) => Promise<void>;
  moveEntry: (entryId: number, direction: "up" | "down") => Promise<void>;
  // Computed getters for sectioned display
  getHuntingEntries: () => PlannedTaskEntry[];
  getReadyEntries: () => PlannedTaskEntry[];
  getKilledEntries: () => PlannedTaskEntry[];
  getTotalPlanned: () => number;
  getTotalCompleted: () => number;
  getRemainingEnergy: () => number;
  getRemainingTaskDemand: () => number;
  getOverloadLevel: () => "none" | "mild" | "severe";
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plan: null,
  loading: false,

  fetchTodayPlan: async () => {
    set({ loading: true });
    try {
      const db = await getDb();
      const date = todayStr();

      await db.execute(
        "INSERT OR IGNORE INTO daily_plans (date, total_budget) VALUES ($1, 8)",
        [date]
      );

      const plans = await db.select<{ date: string; total_budget: number; removed_completed: number }[]>(
        "SELECT date, total_budget, removed_completed FROM daily_plans WHERE date = $1",
        [date]
      );

      const entries = await db.select<PlannedTaskEntry[]>(
        `SELECT id, task_id, planned_pomodoros_today, completed_pomodoros_today, sort_order
       FROM planned_task_entries
       WHERE plan_date = $1
       ORDER BY sort_order`,
        [date]
      );

      set({
        plan: {
          date: plans[0].date,
          total_budget: plans[0].total_budget,
          removed_completed: plans[0].removed_completed,
          entries,
        },
        loading: false,
      });
    } catch (error) {
      console.error("[PlanStore] fetchTodayPlan failed:", error);
      set({ loading: false });
      throw error;
    }
  },

  setBudget: async (budget) => {
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE daily_plans SET total_budget = $1 WHERE date = $2",
        [budget, todayStr()]
      );
      await get().fetchTodayPlan();
    } catch (error) {
      console.error("[PlanStore] setBudget failed:", error);
      throw error;
    }
  },

  addTaskToPlan: async (taskId, pomodoros) => {
    try {
      const db = await getDb();
      const date = todayStr();
      const entries = await db.select<{ sort_order: number }[]>(
        "SELECT sort_order FROM planned_task_entries WHERE plan_date = $1 ORDER BY sort_order DESC LIMIT 1",
        [date]
      );
      const nextOrder = entries.length > 0 ? entries[0].sort_order + 1 : 0;
      await db.execute(
        `INSERT INTO planned_task_entries (plan_date, task_id, planned_pomodoros_today, sort_order)
       VALUES ($1, $2, $3, $4)`,
        [date, taskId, pomodoros, nextOrder]
      );
      await get().fetchTodayPlan();
    } catch (error) {
      console.error("[PlanStore] addTaskToPlan failed:", error);
      throw error;
    }
  },

  removeTaskFromPlan: async (entryId) => {
    try {
      await withTransaction(async (db) => {
        const rows = await db.select<{ completed_pomodoros_today: number }[]>(
          "SELECT completed_pomodoros_today FROM planned_task_entries WHERE id = $1",
          [entryId]
        );
        const completed = rows.length > 0 ? rows[0].completed_pomodoros_today : 0;
        if (completed > 0) {
          await db.execute(
            "UPDATE daily_plans SET removed_completed = removed_completed + $1 WHERE date = $2",
            [completed, todayStr()]
          );
        }
        await db.execute("DELETE FROM planned_task_entries WHERE id = $1", [
          entryId,
        ]);
      });
      await get().fetchTodayPlan();
    } catch (error) {
      console.error("[PlanStore] removeTaskFromPlan failed:", error);
      throw error;
    }
  },

  incrementCompleted: async (taskId) => {
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE planned_task_entries SET completed_pomodoros_today = completed_pomodoros_today + 1
       WHERE plan_date = $1 AND task_id = $2`,
        [todayStr(), taskId]
      );
      await get().fetchTodayPlan();
    } catch (error) {
      console.error("[PlanStore] incrementCompleted failed:", error);
      throw error;
    }
  },

  moveEntry: async (entryId, direction) => {
    const plan = get().plan;
    if (!plan) return;
    const idx = plan.entries.findIndex((e) => e.id === entryId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= plan.entries.length) return;

    try {
      const db = await getDb();
      const a = plan.entries[idx];
      const b = plan.entries[swapIdx];
      await db.execute(
        "UPDATE planned_task_entries SET sort_order = $1 WHERE id = $2",
        [b.sort_order, a.id]
      );
      await db.execute(
        "UPDATE planned_task_entries SET sort_order = $1 WHERE id = $2",
        [a.sort_order, b.id]
      );
      await get().fetchTodayPlan();
    } catch (error) {
      console.error("[PlanStore] moveEntry failed:", error);
      throw error;
    }
  },

  getHuntingEntries: () => {
    const plan = get().plan;
    if (!plan) return [];
    const tasks = useTaskStore.getState().tasks;
    return plan.entries.filter((e) => {
      const task = tasks.find((t) => t.id === e.task_id);
      return task?.status === "hunting";
    });
  },

  getReadyEntries: () => {
    const plan = get().plan;
    if (!plan) return [];
    const tasks = useTaskStore.getState().tasks;
    return plan.entries.filter((e) => {
      const task = tasks.find((t) => t.id === e.task_id);
      return task?.status === "ready";
    });
  },

  getKilledEntries: () => {
    const plan = get().plan;
    if (!plan) return [];
    const tasks = useTaskStore.getState().tasks;
    return plan.entries.filter((e) => {
      const task = tasks.find((t) => t.id === e.task_id);
      return task?.status === "killed";
    });
  },

  getTotalPlanned: () => {
    const plan = get().plan;
    if (!plan) return 0;
    return plan.entries.reduce((sum, e) => sum + e.planned_pomodoros_today, 0);
  },

  getTotalCompleted: () => {
    const plan = get().plan;
    if (!plan) return 0;
    return plan.removed_completed + plan.entries.reduce((sum, e) => sum + e.completed_pomodoros_today, 0);
  },

  getRemainingEnergy: () => {
    const plan = get().plan;
    if (!plan) return 0;
    return Math.max(0, plan.total_budget - get().getTotalCompleted());
  },

  getRemainingTaskDemand: () => {
    const plan = get().plan;
    if (!plan) return 0;
    const tasks = useTaskStore.getState().tasks;
    return plan.entries
      .filter((e) => {
        const task = tasks.find((t) => t.id === e.task_id);
        return task?.status === "ready" || task?.status === "hunting";
      })
      .reduce((sum, e) => sum + Math.max(0, e.planned_pomodoros_today - e.completed_pomodoros_today), 0);
  },

  getOverloadLevel: () => {
    const t3 = get().getRemainingEnergy();
    const t4 = get().getRemainingTaskDemand();
    const diff = t4 - t3;
    if (diff <= 0) return "none";
    if (diff <= 2) return "mild";
    return "severe";
  },
}));
