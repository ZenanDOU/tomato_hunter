import Database from "@tauri-apps/plugin-sql";
import { selectSpecies } from "./bestiary";
import type { TaskCategory, TaskDifficulty } from "../types";

let db: Database | null = null;
let backfillDone = false;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:tomato_hunter.db");
  }
  if (!backfillDone) {
    backfillDone = true;
    await backfillSpeciesIds(db);
  }
  return db;
}

export async function withTransaction<T>(
  fn: (db: Database) => Promise<T>
): Promise<T> {
  const database = await getDb();
  await database.execute("BEGIN");
  try {
    const result = await fn(database);
    await database.execute("COMMIT");
    return result;
  } catch (error) {
    try {
      await database.execute("ROLLBACK");
    } catch (rollbackErr) {
      console.error("[DB] ROLLBACK failed:", rollbackErr);
    }
    throw error;
  }
}

async function backfillSpeciesIds(database: Database): Promise<void> {
  try {
    const rows = await database.select<
      { id: number; category: TaskCategory; name: string; difficulty: TaskDifficulty }[]
    >(
      `SELECT id, category, name, difficulty FROM tasks
       WHERE species_id IS NULL AND monster_variant != '' AND monster_variant IS NOT NULL`
    );
    if (rows.length === 0) return;

    for (const row of rows) {
      const species = selectSpecies(row.category, row.name, row.difficulty);
      if (species) {
        await database.execute(
          "UPDATE tasks SET species_id = $1 WHERE id = $2",
          [species.id, row.id]
        );
      }
    }
    console.log(`[DB] Backfilled species_id for ${rows.length} tasks`);
    // Trigger milestone detection after backfill to catch species-dependent milestones
    try {
      const { useProfileStore } = await import("../stores/profileStore");
      await useProfileStore.getState().detectNewMilestones();
    } catch (e) {
      console.warn("[DB] Post-backfill milestone detection failed:", e);
    }
  } catch (error) {
    console.error("[DB] species_id backfill failed:", error);
  }
}
