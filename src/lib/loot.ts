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
  bonusMultiplier: number = 1,
  tomatoCount: number = 1
): { materialId: number; quantity: number }[] {
  const drops: { materialId: number; quantity: number }[] = [];
  const pool = CATEGORY_MATERIAL[category];

  // Rescued tomato drop (variable: sword=1, hammer=1-2, dagger=ceil(actions/2))
  if (tomatoCount > 0) {
    drops.push({ materialId: 11, quantity: tomatoCount });
  }

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

// Rare material IDs (6-10)
const RARE_MATERIAL_IDS = new Set([6, 7, 8, 9, 10]);

async function checkAndUnlockRecipes(
  drops: { materialId: number; quantity: number }[]
): Promise<string[]> {
  const db = await getDb();
  const unlockedNames: string[] = [];

  for (const drop of drops) {
    if (!RARE_MATERIAL_IDS.has(drop.materialId)) continue;

    // Check if player had 0 of this material before this drop
    const rows = await db.select<{ quantity: number }[]>(
      "SELECT quantity FROM player_materials WHERE material_id = $1",
      [drop.materialId]
    );
    const prevQty = rows[0]?.quantity ?? 0;
    if (prevQty > 0) continue;

    // Unlock equipment whose recipe includes this material
    const equipRows = await db.select<{ id: number; name: string }[]>(
      `SELECT id, name FROM equipment
       WHERE unlocked = 0 AND recipe LIKE $1`,
      [`%"${drop.materialId}"%`]
    );

    for (const equip of equipRows) {
      await db.execute(
        "UPDATE equipment SET unlocked = 1 WHERE id = $1",
        [equip.id]
      );
      unlockedNames.push(equip.name);
    }
  }

  return unlockedNames;
}

export async function applyLoot(
  pomodoroId: number,
  drops: { materialId: number; quantity: number }[]
): Promise<string[]> {
  const db = await getDb();

  // Check for recipe unlocks BEFORE updating quantities
  const unlockedNames = await checkAndUnlockRecipes(drops);

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

  return unlockedNames;
}
