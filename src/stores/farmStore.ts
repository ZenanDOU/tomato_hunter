import { create } from "zustand";
import { getDb } from "../lib/db";

interface FarmState {
  tomatoCount: number;
  essenceBalance: number;
  fertilizerRemainingMinutes: number;
  productionRate: number; // per minute
  isWatered: boolean;
  wateringCooldownEnd: number;
}

interface FarmStore extends FarmState {
  fetchFarm: () => Promise<void>;
  addTomato: (count?: number) => Promise<void>;
  spendEssence: (amount: number) => Promise<boolean>;
  addEssence: (amount: number) => Promise<void>;
  activateFertilizer: (minutes: number) => Promise<void>;
  tickProduction: (focusMinutes: number) => Promise<number>;
  // Watering
  water: () => Promise<void>;
  canWater: () => boolean;
  getWateringCooldownRemaining: () => number;
  consumeWatering: () => Promise<void>;
  // Computed multiplier
  getProductionMultiplier: () => number;
}

const WATERING_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

function calcBaseRate(tomatoCount: number): number {
  return Math.floor(tomatoCount / 10) + 1;
}

function calcProductionRate(tomatoCount: number, hasFertilizer: boolean, isWatered: boolean): number {
  const base = calcBaseRate(tomatoCount);
  // Additive: base × (1 + watering_bonus + fertilizer_bonus)
  // watering = +0.5, fertilizer = +1.0
  let multiplier = 1;
  if (isWatered) multiplier += 0.5;
  if (hasFertilizer) multiplier += 1.0;
  return Math.floor(base * multiplier);
}

export const useFarmStore = create<FarmStore>((set, get) => ({
  tomatoCount: 0,
  essenceBalance: 0,
  fertilizerRemainingMinutes: 0,
  productionRate: 1,
  isWatered: false,
  wateringCooldownEnd: 0,

  fetchFarm: async () => {
    try {
      const db = await getDb();
      const rows = await db.select<{
        tomato_count: number;
        essence_balance: number;
        fertilizer_remaining_minutes: number;
        is_watered: number;
        watering_cooldown_end: string | null;
      }[]>("SELECT * FROM tomato_farm WHERE id = 1");
      if (rows.length > 0) {
        const r = rows[0];
        const cooldownEnd = r.watering_cooldown_end ? new Date(r.watering_cooldown_end).getTime() : 0;
        const cooldownExpired = cooldownEnd > 0 && Date.now() >= cooldownEnd;
        const isWatered = r.is_watered === 1 && !cooldownExpired;
        // Auto-clear expired watering
        if (r.is_watered === 1 && cooldownExpired) {
          await db.execute(
            "UPDATE tomato_farm SET is_watered = 0 WHERE id = 1",
          );
        }
        set({
          tomatoCount: r.tomato_count,
          essenceBalance: r.essence_balance,
          fertilizerRemainingMinutes: r.fertilizer_remaining_minutes,
          isWatered,
          wateringCooldownEnd: cooldownEnd,
          productionRate: calcProductionRate(r.tomato_count, r.fertilizer_remaining_minutes > 0, isWatered),
        });
      }
    } catch (error) {
      console.error("[FarmStore] fetchFarm failed:", error);
      throw error;
    }
  },

  addTomato: async (count = 1) => {
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE tomato_farm SET tomato_count = tomato_count + $1 WHERE id = 1",
        [count]
      );
      const state = get();
      const newCount = state.tomatoCount + count;
      set({
        tomatoCount: newCount,
        productionRate: calcProductionRate(newCount, state.fertilizerRemainingMinutes > 0, state.isWatered),
      });
    } catch (error) {
      console.error("[FarmStore] addTomato failed:", error);
      throw error;
    }
  },

  spendEssence: async (amount: number) => {
    const state = get();
    if (state.essenceBalance < amount) return false;
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE tomato_farm SET essence_balance = essence_balance - $1 WHERE id = 1",
        [amount]
      );
      set({ essenceBalance: state.essenceBalance - amount });
      return true;
    } catch (error) {
      console.error("[FarmStore] spendEssence failed:", error);
      throw error;
    }
  },

  addEssence: async (amount: number) => {
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE tomato_farm SET essence_balance = essence_balance + $1 WHERE id = 1",
        [amount]
      );
      set({ essenceBalance: get().essenceBalance + amount });
    } catch (error) {
      console.error("[FarmStore] addEssence failed:", error);
      throw error;
    }
  },

  activateFertilizer: async (minutes: number) => {
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE tomato_farm SET fertilizer_remaining_minutes = fertilizer_remaining_minutes + $1 WHERE id = 1",
        [minutes]
      );
      const state = get();
      const newRemaining = state.fertilizerRemainingMinutes + minutes;
      set({
        fertilizerRemainingMinutes: newRemaining,
        productionRate: calcProductionRate(state.tomatoCount, newRemaining > 0, state.isWatered),
      });
    } catch (error) {
      console.error("[FarmStore] activateFertilizer failed:", error);
      throw error;
    }
  },

  tickProduction: async (focusMinutes: number) => {
    try {
      const state = get();
      const produced = state.productionRate * focusMinutes;

      const db = await getDb();

      let newFertilizer = state.fertilizerRemainingMinutes;
      if (newFertilizer > 0) {
        newFertilizer = Math.max(0, newFertilizer - focusMinutes);
        await db.execute(
          "UPDATE tomato_farm SET essence_balance = essence_balance + $1, fertilizer_remaining_minutes = $2 WHERE id = 1",
          [produced, newFertilizer]
        );
      } else {
        await db.execute(
          "UPDATE tomato_farm SET essence_balance = essence_balance + $1 WHERE id = 1",
          [produced]
        );
      }

      // Consume watering after production (persist to DB)
      if (state.isWatered) {
        await db.execute("UPDATE tomato_farm SET is_watered = 0 WHERE id = 1");
      }
      set({
        essenceBalance: state.essenceBalance + produced,
        fertilizerRemainingMinutes: newFertilizer,
        isWatered: false,
        productionRate: calcProductionRate(state.tomatoCount, newFertilizer > 0, false),
      });

      return produced;
    } catch (error) {
      console.error("[FarmStore] tickProduction failed:", error);
      throw error;
    }
  },

  // --- Watering ---

  water: async () => {
    const state = get();
    if (!state.canWater()) return;
    const cooldownEnd = Date.now() + WATERING_COOLDOWN_MS;
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE tomato_farm SET is_watered = 1, watering_cooldown_end = $1 WHERE id = 1",
        [new Date(cooldownEnd).toISOString()]
      );
    } catch (error) {
      console.error("[FarmStore] water persist failed:", error);
    }
    set({
      isWatered: true,
      wateringCooldownEnd: cooldownEnd,
      productionRate: calcProductionRate(state.tomatoCount, state.fertilizerRemainingMinutes > 0, true),
    });
  },

  canWater: () => {
    return Date.now() >= get().wateringCooldownEnd;
  },

  getWateringCooldownRemaining: () => {
    const remaining = get().wateringCooldownEnd - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  consumeWatering: async () => {
    const state = get();
    try {
      const db = await getDb();
      await db.execute(
        "UPDATE tomato_farm SET is_watered = 0 WHERE id = 1",
      );
    } catch (error) {
      console.error("[FarmStore] consumeWatering persist failed:", error);
    }
    set({
      isWatered: false,
      productionRate: calcProductionRate(state.tomatoCount, state.fertilizerRemainingMinutes > 0, false),
    });
  },

  getProductionMultiplier: () => {
    const state = get();
    let m = 1;
    if (state.isWatered) m += 0.5;
    if (state.fertilizerRemainingMinutes > 0) m += 1.0;
    return m;
  },
}));
