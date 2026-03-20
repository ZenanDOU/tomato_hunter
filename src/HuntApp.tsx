import { useCallback, useRef, useState } from "react";
import { useTimerStore } from "./stores/timerStore";
import { useTaskStore } from "./stores/taskStore";
import { usePlanStore } from "./stores/planStore";
import { useInventoryStore } from "./stores/inventoryStore";
import { useTauriEvent } from "./hooks/useTauriEvent";
import { generateLoot, applyLoot } from "./lib/loot";
import { getDb } from "./lib/db";
import { closeHuntWindow, resizeHuntWindow } from "./lib/commands";
import type { TimerState, TaskCategory, ReflectionType } from "./types";
import { PrepPhase } from "./components/hunt/PrepPhase";
import { FocusPhase } from "./components/hunt/FocusPhase";
import { ReviewPhase } from "./components/hunt/ReviewPhase";
import { Settlement } from "./components/settlement/Settlement";
import { RestScreen } from "./components/settlement/RestScreen";

type FlowPhase = "hunting" | "settlement" | "rest";

export function HuntApp() {
  const { timer, setTimer, advancePhase } = useTimerStore();
  const { damageTask } = useTaskStore();
  const { incrementCompleted } = usePlanStore();
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("hunting");
  const [drops, setDrops] = useState<
    { materialId: number; quantity: number }[]
  >([]);
  const [strategyNote, setStrategyNote] = useState("");
  const reviewInProgress = useRef(false);

  const handleTick = useCallback(
    (payload: TimerState) => setTimer(payload),
    [setTimer]
  );
  useTauriEvent("timer_tick", handleTick);

  // Handle window close request (pause or retreat)
  const handleWindowClose = useCallback(async () => {
    const inv = useInventoryStore.getState();
    const hasSmokeBomb = inv.ownedEquipment.some(
      (e) => e.equipment.id === 6 && e.quantity > 0
    );
    if (hasSmokeBomb) {
      await inv.useConsumable(6);
      await useTimerStore.getState().pause();
    } else {
      await useTimerStore.getState().retreat();
      await closeHuntWindow();
    }
  }, []);
  useTauriEvent("hunt_window_close_requested", handleWindowClose);

  // Handle pause timeout retreat
  const handlePauseTimeout = useCallback(async () => {
    await closeHuntWindow();
  }, []);
  useTauriEvent("pause_timeout_retreat", handlePauseTimeout);

  const handleReviewComplete = async (
    note: string,
    reflType: ReflectionType | null,
    reflText: string
  ) => {
    // Prevent double-submission
    if (reviewInProgress.current) return;
    if (!timer.task_id || !timer.pomodoro_id) return;
    reviewInProgress.current = true;

    try {
      const db = await getDb();

      // Get current loadout for snapshot
      const loadoutRows = await db.select<
        {
          weapon_id: number | null;
          armor_id: number | null;
          items: string;
        }[]
      >("SELECT * FROM loadout WHERE id = 1");
      const loadoutJson = JSON.stringify(loadoutRows[0] || {});

      // Update the pomodoro record (written at start with ended_at=NULL)
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

      // Damage the monster
      await damageTask(timer.task_id);
      await incrementCompleted(timer.task_id);

      // Generate loot
      const taskRows = await db.select<{ category: TaskCategory }[]>(
        "SELECT category FROM tasks WHERE id = $1",
        [timer.task_id]
      );
      const category = taskRows[0]?.category || "other";
      const lootDrops = generateLoot(category, timer.rounds_completed);
      await applyLoot(timer.pomodoro_id, lootDrops);

      setDrops(lootDrops);

      // Advance timer to break phase
      await advancePhase();
      setFlowPhase("settlement");
    } catch (err) {
      console.error("Review complete error:", err);
    } finally {
      reviewInProgress.current = false;
    }
  };

  const handleSettlementDone = () => {
    setFlowPhase("rest");
  };

  if (flowPhase === "settlement") {
    return <Settlement drops={drops} onContinue={handleSettlementDone} />;
  }

  if (flowPhase === "rest") {
    // Show rest screen regardless of timer phase to prevent getting stuck
    if (timer.phase === "break" || timer.phase === "long_break") {
      return <RestScreen />;
    }
    // Fallback: if timer is in unexpected state, still allow returning to village
    return <RestScreen />;
  }

  // Hunting phases
  switch (timer.phase) {
    case "prep":
      return (
        <PrepPhase
          timer={timer}
          onStartBattle={async (note) => {
            setStrategyNote(note);
            try {
              await resizeHuntWindow(600, 176);
            } catch {}
          }}
        />
      );
    case "focus":
      return <FocusPhase timer={timer} strategyNote={strategyNote} />;
    case "review":
      // Resize window larger for review
      resizeHuntWindow(400, 520).catch(() => {});
      return (
        <ReviewPhase timer={timer} onComplete={handleReviewComplete} />
      );
    default:
      return (
        <div className="bg-stone-900 text-stone-400 p-4">
          等待狩猎开始...
        </div>
      );
  }
}
