import { create } from "zustand";
import type { Task, TaskFormData, TaskStatus } from "../types";
import { getDb, withTransaction } from "../lib/db";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
  identifyTask: (
    id: number,
    monsterName: string,
    monsterDesc: string,
    monsterVariant?: string,
    speciesId?: string
  ) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  releaseTask: (id: number) => Promise<void>;
  batchReleaseTasks: (ids: number[]) => Promise<void>;
  damageTask: (id: number) => Promise<{ reachedZero: boolean }>;
  killTask: (id: number) => Promise<void>;
  pursuitTask: (id: number, newTotalHp: number) => Promise<void>;
  splitTask: (
    parentId: number,
    parts: { name: string; description: string; pomodoros: number; bodyPart: string }[]
  ) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const db = await getDb();
      const tasks = await db.select<Task[]>(
        "SELECT * FROM tasks ORDER BY created_at DESC"
      );
      set({ tasks, loading: false });
    } catch (error) {
      console.error("[TaskStore] fetchTasks failed:", error);
      set({ loading: false });
      throw error;
    }
  },

  createTask: async (data) => {
    try {
      const db = await getDb();
      const hp = data.estimated_pomodoros;
      const result = await db.execute(
        `INSERT INTO tasks (name, description, category, difficulty, estimated_pomodoros, total_hp, current_hp, repeat_config)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.name,
          data.description,
          data.category,
          data.difficulty,
          data.estimated_pomodoros,
          hp,
          hp,
          data.repeat_config,
        ]
      );
      const tasks = await db.select<Task[]>(
        "SELECT * FROM tasks WHERE id = $1",
        [result.lastInsertId]
      );
      await get().fetchTasks();
      return tasks[0];
    } catch (error) {
      console.error("[TaskStore] createTask failed:", error);
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const db = await getDb();
      const completedAt = status === "killed" ? new Date().toISOString() : null;
      await db.execute(
        "UPDATE tasks SET status = $1, completed_at = $2 WHERE id = $3",
        [status, completedAt, id]
      );
      await get().fetchTasks();
    } catch (error) {
      console.error("[TaskStore] updateTaskStatus failed:", error);
      throw error;
    }
  },

  identifyTask: async (id, monsterName, monsterDesc, monsterVariant, speciesId) => {
    try {
      const db = await getDb();
      if (monsterVariant) {
        try {
          await db.execute(
            `UPDATE tasks SET monster_name = $1, monster_description = $2, monster_variant = $3, species_id = $4, status = 'ready' WHERE id = $5`,
            [monsterName, monsterDesc, monsterVariant, speciesId || null, id]
          );
        } catch {
          // Fallback: species_id column may not exist yet
          console.warn("[TaskStore] identifyTask falling back without species_id");
          await db.execute(
            `UPDATE tasks SET monster_name = $1, monster_description = $2, monster_variant = $3, status = 'ready' WHERE id = $4`,
            [monsterName, monsterDesc, monsterVariant, id]
          );
        }
      } else {
        await db.execute(
          `UPDATE tasks SET monster_name = $1, monster_description = $2, status = 'ready' WHERE id = $3`,
          [monsterName, monsterDesc, id]
        );
      }
      await get().fetchTasks();
    } catch (error) {
      console.error("[TaskStore] identifyTask failed:", error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const db = await getDb();
      await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
      await get().fetchTasks();
    } catch (error) {
      console.error("[TaskStore] deleteTask failed:", error);
      throw error;
    }
  },

  releaseTask: async (id) => {
    try {
      await withTransaction(async (db) => {
        const now = new Date().toISOString();
        const children = await db.select<{ id: number }[]>(
          "SELECT id FROM tasks WHERE parent_task_id = $1",
          [id]
        );
        await db.execute(
          "UPDATE tasks SET status = 'released', completed_at = $1 WHERE id = $2",
          [now, id]
        );
        if (children.length > 0) {
          await db.execute(
            "UPDATE tasks SET status = 'released', completed_at = $1 WHERE parent_task_id = $2",
            [now, id]
          );
        }
        await db.execute(
          "DELETE FROM planned_task_entries WHERE task_id = $1",
          [id]
        );
        for (const child of children) {
          await db.execute(
            "DELETE FROM planned_task_entries WHERE task_id = $1",
            [child.id]
          );
        }
      });
    } catch (error) {
      console.error("[TaskStore] releaseTask failed:", error);
      throw error;
    }
  },

  batchReleaseTasks: async (ids) => {
    try {
      await withTransaction(async (db) => {
        const now = new Date().toISOString();
        for (const id of ids) {
          const children = await db.select<{ id: number }[]>(
            "SELECT id FROM tasks WHERE parent_task_id = $1",
            [id]
          );
          await db.execute(
            "UPDATE tasks SET status = 'released', completed_at = $1 WHERE id = $2",
            [now, id]
          );
          if (children.length > 0) {
            await db.execute(
              "UPDATE tasks SET status = 'released', completed_at = $1 WHERE parent_task_id = $2",
              [now, id]
            );
          }
          await db.execute(
            "DELETE FROM planned_task_entries WHERE task_id = $1",
            [id]
          );
          for (const child of children) {
            await db.execute(
              "DELETE FROM planned_task_entries WHERE task_id = $1",
              [child.id]
            );
          }
        }
      });
    } catch (error) {
      console.error("[TaskStore] batchReleaseTasks failed:", error);
      throw error;
    }
  },

  killTask: async (id) => {
    try {
      await withTransaction(async (db) => {
        const now = new Date().toISOString();
        await db.execute(
          `UPDATE tasks SET status = 'killed', completed_at = $1 WHERE id = $2`,
          [now, id]
        );
        // Auto-complete parent if all siblings are killed
        const rows = await db.select<Task[]>(
          "SELECT * FROM tasks WHERE id = $1",
          [id]
        );
        if (rows[0]?.parent_task_id) {
          const siblings = await db.select<{ status: string }[]>(
            "SELECT status FROM tasks WHERE parent_task_id = $1",
            [rows[0].parent_task_id]
          );
          if (siblings.length > 0 && siblings.every((s) => s.status === "killed")) {
            await db.execute(
              `UPDATE tasks SET status = 'killed', completed_at = $1 WHERE id = $2`,
              [now, rows[0].parent_task_id]
            );
          }
        }
      });
    } catch (error) {
      console.error("[TaskStore] killTask failed:", error);
      throw error;
    }
  },

  pursuitTask: async (id, newTotalHp) => {
    try {
      const db = await getDb();
      const rows = await db.select<Task[]>(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
      );
      if (!rows[0]) return;
      const newCurrentHp = newTotalHp - rows[0].actual_pomodoros;
      if (newCurrentHp <= 0) return;
      await db.execute(
        `UPDATE tasks SET total_hp = $1, current_hp = $2 WHERE id = $3`,
        [newTotalHp, newCurrentHp, id]
      );
      await get().fetchTasks();
    } catch (error) {
      console.error("[TaskStore] pursuitTask failed:", error);
      throw error;
    }
  },

  splitTask: async (parentId, parts) => {
    try {
      const db = await getDb();
      const parent = (await db.select<Task[]>(
        "SELECT * FROM tasks WHERE id = $1",
        [parentId]
      ))[0];
      if (!parent) return;

      for (const part of parts) {
        await db.execute(
          `INSERT INTO tasks (name, description, category, difficulty, estimated_pomodoros, total_hp, current_hp, repeat_config, monster_name, monster_description, monster_variant, status, parent_task_id, body_part)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'none', $8, $9, $10, 'ready', $11, $12)`,
          [
            part.name,
            part.description,
            parent.category,
            parent.difficulty,
            part.pomodoros,
            part.pomodoros,
            part.pomodoros,
            parent.monster_name,
            parent.monster_description,
            parent.monster_variant,
            parentId,
            part.bodyPart,
          ]
        );
      }
      // Mark parent as container (status = 'ready' but current_hp = 0 so it's not directly huntable)
      await db.execute(
        `UPDATE tasks SET status = 'ready', current_hp = 0 WHERE id = $1`,
        [parentId]
      );
      await get().fetchTasks();
    } catch (error) {
      console.error("[TaskStore] splitTask failed:", error);
      throw error;
    }
  },

  damageTask: async (id) => {
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE tasks SET current_hp = MAX(0, current_hp - 1), actual_pomodoros = actual_pomodoros + 1 WHERE id = $1`,
        [id]
      );
      const rows = await db.select<Task[]>(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
      );
      let reachedZero = false;
      if (rows[0]) {
        reachedZero = rows[0].current_hp <= 0;
        if (rows[0].current_hp > 0 && rows[0].status === "ready") {
          await db.execute(
            `UPDATE tasks SET status = 'hunting' WHERE id = $1`,
            [id]
          );
        }
      }
      await get().fetchTasks();
      return { reachedZero };
    } catch (error) {
      console.error("[TaskStore] damageTask failed:", error);
      throw error;
    }
  },
}));
