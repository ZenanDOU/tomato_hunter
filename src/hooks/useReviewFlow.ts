import { useRef, useState } from "react";
import { getDb } from "../lib/db";
import { generateLoot, applyLoot } from "../lib/loot";
import { audioManager } from "../lib/audio";
import { useInventoryStore } from "../stores/inventoryStore";
import { useFarmStore } from "../stores/farmStore";
import { useTimerStore } from "../stores/timerStore";
import { usePlanStore } from "../stores/planStore";
import { useTaskStore } from "../stores/taskStore";
import { useSettingsStore } from "../stores/settingsStore";
import { closeHuntWindow } from "../lib/commands";
import { emit } from "@tauri-apps/api/event";
import type { TimerState, TaskCategory, ReflectionType } from "../types";

/**
 * Extracts the review-complete / loot flow from HuntApp.
 *
 * Returns:
 * - `handleReviewComplete` — the callback wired to ReviewPhase's onComplete
 * - `drops` — the loot generated after the latest review
 */
export function useReviewFlow(
  timer: TimerState,
  setFlowPhase: (phase: "hunting" | "settlement" | "rest") => void
): {
  handleReviewComplete: (
    note: string,
    reflType: ReflectionType | null,
    reflText: string
  ) => Promise<void>;
  drops: { materialId: number; quantity: number }[];
  hpReachedZero: boolean;
  unlockedRecipes: string[];
  showFirstKillReward: boolean;
} {
  const reviewInProgress = useRef(false);
  const [drops, setDrops] = useState<
    { materialId: number; quantity: number }[]
  >([]);
  const [hpReachedZero, setHpReachedZero] = useState(false);
  const [unlockedRecipes, setUnlockedRecipes] = useState<string[]>([]);
  const [showFirstKillReward, setShowFirstKillReward] = useState(false);

  const handleReviewComplete = async (
    note: string,
    reflType: ReflectionType | null,
    reflText: string
  ) => {
    if (reviewInProgress.current) return;
    if (!timer.task_id || !timer.pomodoro_id) return;
    reviewInProgress.current = true;

    try {
      const db = await getDb();

      const loadoutRows = await db.select<
        { weapon_id: number | null; armor_id: number | null; items: string }[]
      >("SELECT * FROM loadout WHERE id = 1");
      const loadoutJson = JSON.stringify(loadoutRows[0] || {});

      await db.execute(
        `UPDATE pomodoros SET ended_at = $1, result = 'completed', completion_note = $2,
         reflection_type = $3, reflection_text = $4, loadout_snapshot = $5
         WHERE id = $6`,
        [
          new Date().toISOString(),
          note,
          reflType,
          reflText,
          loadoutJson,
          timer.pomodoro_id,
        ]
      );

      // Damage task + HP check — wrapped defensively so even on error we detect HP zero
      let reachedZero = false;
      try {
        audioManager.playSfx("attack-hit");
        const result = await useTaskStore.getState().damageTask(timer.task_id);
        reachedZero = result.reachedZero;
      } catch (dmgErr) {
        console.error("damageTask failed, checking HP directly:", dmgErr);
        try {
          const hpCheck = await db.select<{ current_hp: number }[]>(
            "SELECT current_hp FROM tasks WHERE id = $1",
            [timer.task_id]
          );
          reachedZero = (hpCheck[0]?.current_hp ?? 1) <= 0;
        } catch { /* HP check also failed, assume not zero */ }
      }
      setHpReachedZero(reachedZero);
      if (reachedZero) {
        audioManager.playSfx("monster-down");
      }

      await usePlanStore.getState().incrementCompleted(timer.task_id).catch(() => {});

      // Generate loot — determine tomato count based on weapon mode
      const taskRows = await db.select<{ category: TaskCategory }[]>(
        "SELECT category FROM tasks WHERE id = $1",
        [timer.task_id]
      );
      const category = taskRows[0]?.category || "other";

      let tomatoCount = 1;
      let bonusMultiplier = 1;

      if (timer.timer_mode === "hammer") {
        tomatoCount = 2; // full completion
      }

      // Check for double loot consumable (equipment ID 13)
      const inv = useInventoryStore.getState();
      const hasDoubleLoot = inv.ownedEquipment.some(
        (e) => e.equipment.id === 13 && e.quantity > 0
      );
      if (hasDoubleLoot) {
        await inv.useConsumable(13);
        bonusMultiplier = 2;
      }

      const lootDrops = generateLoot(
        category,
        timer.rounds_completed,
        bonusMultiplier,
        tomatoCount
      );
      const newUnlocks = await applyLoot(timer.pomodoro_id, lootDrops);
      if (newUnlocks.length > 0) {
        setUnlockedRecipes(newUnlocks);
        audioManager.playSfx("notification");
      }

      // Add tomatoes to farm
      await useFarmStore.getState().addTomato(tomatoCount);
      audioManager.playSfx("farm-harvest");

      setDrops(lootDrops);
      audioManager.playSfx("loot-drop");

      // First pomodoro reward: grant 2x smoke bombs
      const settings = useSettingsStore.getState();
      if (!settings.firstKillRewardGranted) {
        await inv.grantItems([{ equipmentId: 7, quantity: 2 }]);
        await settings.setFirstKillRewardGranted(true);
        setShowFirstKillReward(true);
      }

      // Hammer mode: go straight to idle (no break) — unless HP reached zero
      if (timer.timer_mode === "hammer" && !reachedZero) {
        audioManager.exitFocusAudio();
        await useTimerStore.getState().advancePhase();
        await emit("hunt_completed");
        await closeHuntWindow();
        return;
      }

      // Show settlement — timer phase will advance when user leaves settlement
      setFlowPhase("settlement");
    } catch (err) {
      console.error("Review complete error:", err);
      // Even on error, check HP and transition to settlement
      if (timer.task_id) {
        try {
          const db2 = await getDb();
          const hpCheck = await db2.select<{ current_hp: number }[]>(
            "SELECT current_hp FROM tasks WHERE id = $1",
            [timer.task_id]
          );
          if ((hpCheck[0]?.current_hp ?? 1) <= 0) {
            setHpReachedZero(true);
          }
        } catch { /* best effort */ }
      }
      setFlowPhase("settlement");
    } finally {
      reviewInProgress.current = false;
    }
  };

  return { handleReviewComplete, drops, hpReachedZero, unlockedRecipes, showFirstKillReward };
}
