import type { TaskCategory } from "../types";
import { getDb } from "./db";

// Material IDs from seed:
// 1=墨水碎片(creative), 2=齿轮零件(work), 3=知识结晶(study), 4=生活纤维(life), 5=通用碎片(other)
// 6=灵感精华(creative,rare), 7=精密齿轮(work,rare), 8=智慧宝石(study,rare), 9=生命露珠(life,rare), 10=虹彩碎片(other,rare)
// 11=获救番茄(special) — 每次完成番茄钟固定掉落 1 个

const CATEGORY_MATERIAL: Record<
  TaskCategory,
  { common: number; rare: number }
> = {
  creative: { common: 1, rare: 6 },
  work: { common: 2, rare: 7 },
  study: { common: 3, rare: 8 },
  life: { common: 4, rare: 9 },
  other: { common: 5, rare: 10 },
};

export function generateLoot(
  category: TaskCategory,
  consecutiveCount: number,
  bonusMultiplier: number = 1
): { materialId: number; quantity: number }[] {
  const drops: { materialId: number; quantity: number }[] = [];
  const pool = CATEGORY_MATERIAL[category];

  // Guaranteed rescued tomato drop
  drops.push({ materialId: 11, quantity: 1 });

  // Guaranteed common drop
  const commonQty = Math.ceil(
    (1 + Math.floor(consecutiveCount / 3)) * bonusMultiplier
  );
  drops.push({ materialId: pool.common, quantity: commonQty });

  // Universal common drop
  drops.push({
    materialId: 5,
    quantity: Math.ceil(1 * bonusMultiplier),
  });

  // Rare drop: 20% base + 5% per consecutive
  const rareChance = Math.min(0.5, 0.2 + consecutiveCount * 0.05);
  if (Math.random() < rareChance) {
    drops.push({
      materialId: pool.rare,
      quantity: Math.ceil(1 * bonusMultiplier),
    });
  }

  return drops;
}

export async function applyLoot(
  pomodoroId: number,
  drops: { materialId: number; quantity: number }[]
): Promise<void> {
  const db = await getDb();
  for (const drop of drops) {
    await db.execute(
      "INSERT INTO loot_drops (pomodoro_id, material_id, quantity) VALUES ($1, $2, $3)",
      [pomodoroId, drop.materialId, drop.quantity]
    );
    await db.execute(
      `INSERT INTO player_materials (material_id, quantity) VALUES ($1, $2)
       ON CONFLICT(material_id) DO UPDATE SET quantity = quantity + $2`,
      [drop.materialId, drop.quantity]
    );
  }
}
