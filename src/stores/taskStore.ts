import { create } from "zustand";
import type { Task, TaskFormData, TaskStatus } from "../types";
import { getDb } from "../lib/db";

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
    monsterVariant?: string
  ) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  damageTask: (id: number) => Promise<void>;
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
    const db = await getDb();
    const tasks = await db.select<Task[]>(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    set({ tasks, loading: false });
  },

  createTask: async (data) => {
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
  },

  updateTaskStatus: async (id, status) => {
    const db = await getDb();
    const completedAt = status === "killed" ? new Date().toISOString() : null;
    await db.execute(
      "UPDATE tasks SET status = $1, completed_at = $2 WHERE id = $3",
      [status, completedAt, id]
    );
    await get().fetchTasks();
  },

  identifyTask: async (id, monsterName, monsterDesc, monsterVariant) => {
    const db = await getDb();
    if (monsterVariant) {
      await db.execute(
        `UPDATE tasks SET monster_name = $1, monster_description = $2, monster_variant = $3, status = 'ready' WHERE id = $4`,
        [monsterName, monsterDesc, monsterVariant, id]
      );
    } else {
      await db.execute(
        `UPDATE tasks SET monster_name = $1, monster_description = $2, status = 'ready' WHERE id = $3`,
        [monsterName, monsterDesc, id]
      );
    }
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    const db = await getDb();
    await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
    await get().fetchTasks();
  },

  splitTask: async (parentId, parts) => {
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
  },

  damageTask: async (id) => {
    const db = await getDb();
    await db.execute(
      `UPDATE tasks SET current_hp = MAX(0, current_hp - 1), actual_pomodoros = actual_pomodoros + 1 WHERE id = $1`,
      [id]
    );
    const rows = await db.select<Task[]>(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );
    if (rows[0]) {
      if (rows[0].current_hp <= 0) {
        await db.execute(
          `UPDATE tasks SET status = 'killed', completed_at = $1 WHERE id = $2`,
          [new Date().toISOString(), id]
        );
        // Auto-complete parent if all siblings are killed
        if (rows[0].parent_task_id) {
          const siblings = await db.select<{ status: string }[]>(
            "SELECT status FROM tasks WHERE parent_task_id = $1",
            [rows[0].parent_task_id]
          );
          if (siblings.length > 0 && siblings.every((s) => s.status === "killed")) {
            await db.execute(
              `UPDATE tasks SET status = 'killed', completed_at = $1 WHERE id = $2`,
              [new Date().toISOString(), rows[0].parent_task_id]
            );
          }
        }
      } else if (rows[0].status === "ready") {
        await db.execute(
          `UPDATE tasks SET status = 'hunting' WHERE id = $1`,
          [id]
        );
      }
    }
    await get().fetchTasks();
  },
}));
