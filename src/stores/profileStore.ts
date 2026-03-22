import { create } from "zustand";
import type { HunterStats, MilestoneRecord, SpeciesDiscovery, TaskCategory, TaskDifficulty } from "../types";
import { getDb } from "../lib/db";
import { MILESTONES } from "../lib/milestones";
import { selectSpecies } from "../lib/bestiary";

interface ProfileStore {
  stats: HunterStats;
  milestones: MilestoneRecord[];
  discoveredSpecies: SpeciesDiscovery[];
  loading: boolean;

  fetchStats: () => Promise<HunterStats>;
  fetchMilestones: () => Promise<void>;
  fetchDiscoveredSpecies: () => Promise<void>;
  fetchAll: () => Promise<void>;
  detectNewMilestones: () => Promise<MilestoneRecord[]>;
  markMilestoneNotified: (id: string) => Promise<void>;
  isSpeciesNew: (speciesId: string) => Promise<boolean>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  stats: {
    totalPomodoros: 0,
    totalKills: 0,
    speciesDiscovered: 0,
    activeDays: 0,
    longestStreak: 0,
  },
  milestones: [],
  discoveredSpecies: [],
  loading: false,

  fetchStats: async () => {
    const db = await getDb();

    const [pomCount] = await db.select<[{ cnt: number }]>(
      "SELECT COUNT(*) as cnt FROM pomodoros WHERE result = 'completed'"
    );
    // Kill count: only count parent/standalone tasks to avoid double-counting splits
    const [killCount] = await db.select<[{ cnt: number }]>(
      "SELECT COUNT(*) as cnt FROM tasks WHERE status = 'killed' AND parent_task_id IS NULL"
    );

    // Species count: include subtasks (they inherit species from parent)
    let speciesDiscovered = 0;
    try {
      const [speciesCount] = await db.select<[{ cnt: number }]>(
        "SELECT COUNT(DISTINCT species_id) as cnt FROM tasks WHERE status = 'killed' AND species_id IS NOT NULL"
      );
      speciesDiscovered = speciesCount.cnt;
    } catch {
      // species_id column may not exist
    }
    if (speciesDiscovered === 0) {
      try {
        const killedTasks = await db.select<
          { category: TaskCategory; name: string; difficulty: TaskDifficulty }[]
        >(
          "SELECT category, name, difficulty FROM tasks WHERE status = 'killed' AND monster_variant != ''"
        );
        const speciesIds = new Set<string>();
        for (const t of killedTasks) {
          const species = selectSpecies(t.category, t.name, t.difficulty);
          speciesIds.add(species.id);
        }
        speciesDiscovered = speciesIds.size;
      } catch {
        // Ignore
      }
    }

    // Active days: distinct dates with completed pomodoros
    const activeDayRows = await db.select<{ d: string }[]>(
      "SELECT DISTINCT date(started_at) as d FROM pomodoros WHERE result = 'completed' ORDER BY d"
    );
    const activeDays = activeDayRows.length;

    // Longest streak: consecutive days with kills (any task, parent or subtask)
    const killDayRows = await db.select<{ d: string }[]>(
      "SELECT DISTINCT date(completed_at) as d FROM tasks WHERE status = 'killed' AND completed_at IS NOT NULL ORDER BY d"
    );
    let longestStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < killDayRows.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(killDayRows[i - 1].d);
        const curr = new Date(killDayRows[i].d);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    const stats: HunterStats = {
      totalPomodoros: pomCount.cnt,
      totalKills: killCount.cnt,
      speciesDiscovered,
      activeDays,
      longestStreak,
    };
    set({ stats });
    return stats;
  },

  fetchMilestones: async () => {
    const db = await getDb();
    const rows = await db.select<MilestoneRecord[]>(
      "SELECT id, achieved_at, notified FROM milestones"
    );
    set({ milestones: rows });
  },

  fetchDiscoveredSpecies: async () => {
    const db = await getDb();

    // Try species_id column first (includes subtasks — they inherit species from parent)
    try {
      const rows = await db.select<
        { species_id: string; first_kill: string; kill_count: number }[]
      >(
        `SELECT species_id,
                MIN(completed_at) as first_kill,
                COUNT(*) as kill_count
         FROM tasks
         WHERE status = 'killed' AND completed_at IS NOT NULL AND species_id IS NOT NULL
         GROUP BY species_id`
      );
      if (rows.length > 0) {
        set({
          discoveredSpecies: rows.map((r) => ({
            speciesId: r.species_id,
            firstKillDate: r.first_kill,
            killCount: r.kill_count,
          })),
        });
        return;
      }
    } catch {
      // species_id column may not exist yet
    }

    // Fallback: compute species from task data (category + name + difficulty)
    try {
      const tasks = await db.select<
        { category: TaskCategory; name: string; difficulty: TaskDifficulty; completed_at: string }[]
      >(
        `SELECT category, name, difficulty, completed_at
         FROM tasks
         WHERE status = 'killed' AND completed_at IS NOT NULL AND monster_variant != ''`
      );
      const speciesMap = new Map<string, { firstKill: string; count: number }>();
      for (const t of tasks) {
        const species = selectSpecies(t.category, t.name, t.difficulty);
        const existing = speciesMap.get(species.id);
        if (!existing) {
          speciesMap.set(species.id, { firstKill: t.completed_at, count: 1 });
        } else {
          existing.count++;
          if (t.completed_at < existing.firstKill) existing.firstKill = t.completed_at;
        }
      }
      set({
        discoveredSpecies: Array.from(speciesMap.entries()).map(([id, data]) => ({
          speciesId: id,
          firstKillDate: data.firstKill,
          killCount: data.count,
        })),
      });
    } catch (error) {
      console.error("[ProfileStore] fetchDiscoveredSpecies fallback failed:", error);
    }
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const results = await Promise.allSettled([
        get().fetchStats(),
        get().fetchMilestones(),
        get().fetchDiscoveredSpecies(),
      ]);
      for (const r of results) {
        if (r.status === "rejected") {
          console.error("[ProfileStore] fetchAll partial failure:", r.reason);
        }
      }
    } finally {
      set({ loading: false });
    }
  },

  detectNewMilestones: async () => {
    try {
      const db = await getDb();
      const stats = await get().fetchStats();
      const existingMilestones = await db.select<MilestoneRecord[]>(
        "SELECT id, achieved_at, notified FROM milestones"
      );
      const existingIds = new Set(existingMilestones.map((m) => m.id));

      // Gather extra stats — each with its own fallback
      let craftedCount = 0;
      try {
        const [craftedResult] = await db.select<[{ cnt: number }]>(
          "SELECT COUNT(*) as cnt FROM player_equipment pe JOIN equipment e ON pe.equipment_id = e.id WHERE e.is_consumable = 0 AND pe.quantity > 0"
        );
        craftedCount = craftedResult.cnt;
      } catch { /* table may not exist */ }

      let perfectDays = 0;
      try {
        const [perfectResult] = await db.select<[{ cnt: number }]>(
          `SELECT COUNT(*) as cnt FROM daily_plans dp
           WHERE (SELECT COUNT(*) FROM planned_task_entries pte WHERE pte.plan_date = dp.date) > 0
           AND NOT EXISTS (
             SELECT 1 FROM planned_task_entries pte
             WHERE pte.plan_date = dp.date AND pte.completed_pomodoros_today < pte.planned_pomodoros_today
           )`
        );
        perfectDays = perfectResult.cnt;
      } catch { /* table may not exist */ }

      const killDayRows = await db.select<{ d: string }[]>(
        "SELECT DISTINCT date(completed_at) as d FROM tasks WHERE status = 'killed' AND completed_at IS NOT NULL ORDER BY d"
      );
      let longestStreak = 0;
      let currentStreak = 0;
      for (let i = 0; i < killDayRows.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prev = new Date(killDayRows[i - 1].d);
          const curr = new Date(killDayRows[i].d);
          const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);
      }

      const checkStats = {
        ...stats,
        craftedCount,
        perfectDays,
        streakDays: longestStreak,
      };

      const newMilestones: MilestoneRecord[] = [];
      const now = new Date().toISOString();

      for (const def of MILESTONES) {
        if (existingIds.has(def.id)) continue;
        const result = def.check(checkStats);
        if (result.achieved) {
          await db.execute(
            "INSERT OR IGNORE INTO milestones (id, achieved_at, notified) VALUES ($1, $2, 0)",
            [def.id, now]
          );
          newMilestones.push({ id: def.id, achieved_at: now, notified: 0 });
        }
      }

      if (newMilestones.length > 0) {
        await get().fetchMilestones();
      }

      return newMilestones;
    } catch (error) {
      console.warn("[ProfileStore] detectNewMilestones failed:", error);
      return [];
    }
  },

  markMilestoneNotified: async (id: string) => {
    const db = await getDb();
    await db.execute("UPDATE milestones SET notified = 1 WHERE id = $1", [id]);
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, notified: 1 } : m
      ),
    }));
  },

  isSpeciesNew: async (speciesId: string) => {
    try {
      const db = await getDb();
      const rows = await db.select<{ cnt: number }[]>(
        "SELECT COUNT(*) as cnt FROM tasks WHERE species_id = $1 AND status = 'killed'",
        [speciesId]
      );
      return rows[0].cnt === 1;
    } catch {
      return false;
    }
  },
}));
