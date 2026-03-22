import { useCallback, useEffect, useMemo, useState } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useTaskStore } from "../../stores/taskStore";
import { PixelBackground } from "../common/PixelBackground";
import { usePlanStore } from "../../stores/planStore";
import { useTauriEvent } from "../../hooks/useTauriEvent";
import type { TimerState } from "../../types";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { formatTime } from "../../lib/format";
import { closeHuntWindow } from "../../lib/commands";
import { emit } from "@tauri-apps/api/event";
import { getDb } from "../../lib/db";

const HEALTH_TIPS = [
  "起身走动，喝杯水 💧",
  "眺望远方，放松眼睛 👀",
  "做几个深呼吸 🌬️",
  "简单拉伸一下 🧘",
  "活动一下手腕和肩膀 💪",
];

interface RestScreenProps {
  onStartNextHunt?: () => void;
}

const EXTEND_BREAK_ID = 9;

export function RestScreen({ onStartNextHunt }: RestScreenProps) {
  const { timer, setTimer, advancePhase, startHunt, extendBreak } = useTimerStore();
  const { plan, fetchTodayPlan } = usePlanStore();
  const { getActiveTimerMode, fetchAll: fetchInventory, ownedEquipment, useConsumable } = useInventoryStore();
  const [breakDone, setBreakDone] = useState(false);

  const handleTick = useCallback(
    (payload: TimerState) => {
      // Detect break timer reaching 0
      if (
        (payload.phase === "break" || payload.phase === "long_break") &&
        payload.remaining_seconds === 0 &&
        !breakDone
      ) {
        setBreakDone(true);
      }
      setTimer(payload);
    },
    [setTimer, breakDone]
  );
  useTauriEvent("timer_tick", handleTick);

  // Refresh plan data on mount so we show accurate state
  useEffect(() => {
    fetchTodayPlan();
  }, [fetchTodayPlan]);

  const tip = useMemo(
    () => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)],
    []
  );

  const extendBreakQty = ownedEquipment.find((e) => e.equipment.id === EXTEND_BREAK_ID)?.quantity || 0;

  const handleExtendBreak = async () => {
    const ok = await useConsumable(EXTEND_BREAK_ID);
    if (ok) await extendBreak(2);
  };

  const allTasks = useTaskStore.getState().tasks;
  const nextEntry = plan?.entries.find(
    (e) => {
      const task = allTasks.find((t) => t.id === e.task_id);
      return e.completed_pomodoros_today < e.planned_pomodoros_today &&
        task?.status !== "killed";
    }
  );

  const isLongBreak = timer.phase === "long_break";

  const handleReturnToVillage = async () => {
    await advancePhase();
    // Refresh plan so village shows updated state
    await fetchTodayPlan();
    // Notify main window to refresh data before showing it
    await emit("hunt_completed");
    await closeHuntWindow();
  };

  const handleQuickStartNext = async () => {
    if (!nextEntry) return;
    await advancePhase(); // end break
    await useTaskStore.getState().fetchTasks(); // refresh task HP data
    await fetchInventory();
    const mode = getActiveTimerMode();
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
      [nextEntry.task_id, new Date().toISOString()]
    );
    const nextTask = useTaskStore.getState().tasks.find((t) => t.id === nextEntry.task_id);
    await startHunt(
      nextEntry.task_id,
      nextTask?.monster_name || nextTask?.name || "",
      result.lastInsertId,
      mode
    );
    // Reset hunt view to show PrepPhase
    setBreakDone(false);
    onStartNextHunt?.();
  };

  return (
    <div
      className="bg-mint text-pixel-black p-4 min-h-screen flex flex-col gap-4 relative"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea")) return;
        getCurrentWindow().startDragging();
      }}
    >
      <PixelBackground scene="rest" />
      <div className="absolute inset-0 rest-color-cycle pointer-events-none" style={{ zIndex: 0 }} />
      <h2 className="pixel-title text-lg font-bold text-deep-blue">
        🌿 {breakDone ? "休息结束" : isLongBreak ? "长休息" : "休息时间"}
      </h2>

      {!breakDone && (
        <>
          <PixelProgressBar
            current={timer.remaining_seconds}
            total={timer.total_seconds}
            color="grass"
            className="rest-breath"
          />
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl pixel-title text-deep-blue">
              {formatTime(timer.remaining_seconds)}
            </span>
            {extendBreakQty > 0 && (
              <button
                onClick={handleExtendBreak}
                className="text-xs text-deep-blue/60 hover:text-deep-blue flex items-center gap-0.5 px-2 py-1 rounded pixel-border bg-white/50"
                title="休息延伸 · +2分钟"
              >
                ⏳<span>+2min</span><span className="text-[10px]">×{extendBreakQty}</span>
              </button>
            )}
          </div>
        </>
      )}

      <PixelCard bg="cream" padding="sm" className="max-w-[320px] mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">💪</span>
          <span className="font-bold text-pixel-black/60">建议活动</span>
        </div>
        <p className="text-sm mt-1">{tip}</p>
      </PixelCard>

      {nextEntry && (
        <PixelCard bg="cloud" padding="sm" className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <div className="flex-1">
            <p className="text-pixel-black/60 text-xs">下一个番茄</p>
            <p className="font-bold text-sm">
              {allTasks.find((t) => t.id === nextEntry.task_id)?.monster_name ||
                allTasks.find((t) => t.id === nextEntry.task_id)?.name}
            </p>
          </div>
          <span className="text-xs text-[#666666]">
            {nextEntry.planned_pomodoros_today - nextEntry.completed_pomodoros_today} 🍅
          </span>
        </PixelCard>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        {nextEntry && (
          <PixelButton
            variant="cta"
            size="lg"
            onClick={handleQuickStartNext}
            className="w-full"
          >
            ⚔️ 开始下一个番茄
          </PixelButton>
        )}
        <PixelButton
          variant="success"
          size="lg"
          onClick={handleReturnToVillage}
          className="w-full"
        >
          返回村庄
        </PixelButton>
      </div>
    </div>
  );
}
