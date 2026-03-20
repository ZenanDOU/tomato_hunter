import { create } from "zustand";
import type { DailyPlan, PlannedTaskEntry } from "../types";
import { getDb } from "../lib/db";

interface PlanStore {
  plan: DailyPlan | null;
  loading: boolean;
  fetchTodayPlan: () => Promise<void>;
  setBudget: (budget: number) => Promise<void>;
  addTaskToPlan: (taskId: number, pomodoros: number) => Promise<void>;
  removeTaskFromPlan: (entryId: number) => Promise<void>;
  incrementCompleted: (taskId: number) => Promise<void>;
  moveEntry: (entryId: number, direction: "up" | "down") => Promise<void>;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plan: null,
  loading: false,

  fetchTodayPlan: async () => {
    set({ loading: true });
    const db = await getDb();
    const date = todayStr();

    await db.execute(
      "INSERT OR IGNORE INTO daily_plans (date, total_budget) VALUES ($1, 8)",
      [date]
    );

    const plans = await db.select<{ date: string; total_budget: number }[]>(
      "SELECT * FROM daily_plans WHERE date = $1",
      [date]
    );

    const entries = await db.select<PlannedTaskEntry[]>(
      `SELECT e.id, e.task_id, e.planned_pomodoros_today, e.completed_pomodoros_today, e.sort_order,
              t.name, t.monster_name, t.category, t.status, t.current_hp, t.total_hp
       FROM planned_task_entries e
       JOIN tasks t ON t.id = e.task_id
       WHERE e.plan_date = $1
       ORDER BY e.sort_order`,
      [date]
    );

    set({
      plan: {
        date: plans[0].date,
        total_budget: plans[0].total_budget,
        entries,
      },
      loading: false,
    });
  },

  setBudget: async (budget) => {
    const db = await getDb();
    await db.execute(
      "UPDATE daily_plans SET total_budget = $1 WHERE date = $2",
      [budget, todayStr()]
    );
    await get().fetchTodayPlan();
  },

  addTaskToPlan: async (taskId, pomodoros) => {
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
  },

  removeTaskFromPlan: async (entryId) => {
    const db = await getDb();
    await db.execute("DELETE FROM planned_task_entries WHERE id = $1", [
      entryId,
    ]);
    await get().fetchTodayPlan();
  },

  incrementCompleted: async (taskId) => {
    const db = await getDb();
    await db.execute(
      `UPDATE planned_task_entries SET completed_pomodoros_today = completed_pomodoros_today + 1
       WHERE plan_date = $1 AND task_id = $2`,
      [todayStr(), taskId]
    );
    await get().fetchTodayPlan();
  },

  moveEntry: async (entryId, direction) => {
    const plan = get().plan;
    if (!plan) return;
    const idx = plan.entries.findIndex((e) => e.id === entryId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= plan.entries.length) return;

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
  },
}));
