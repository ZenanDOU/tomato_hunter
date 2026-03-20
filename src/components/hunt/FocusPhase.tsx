import { useEffect, useState } from "react";
import type { TimerState } from "../../types";
import { useTimerStore } from "../../stores/timerStore";
import { useTaskStore } from "../../stores/taskStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { formatTime } from "../../lib/format";
import { closeHuntWindow, resizeHuntWindow } from "../../lib/commands";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface FocusPhaseProps {
  timer: TimerState;
  strategyNote?: string;
}

export function FocusPhase({ timer, strategyNote }: FocusPhaseProps) {
  const { pause, resume, retreat } = useTimerStore();
  const { tasks } = useTaskStore();
  const { ownedEquipment, useConsumable, fetchAll } = useInventoryStore();
  const [showStrategy, setShowStrategy] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Resize window when strategy panel toggles
  useEffect(() => {
    const h = showStrategy ? 240 : 176;
    resizeHuntWindow(600, h).catch(() => {});
  }, [showStrategy]);

  const task = tasks.find((t) => t.id === timer.task_id);
  const hasSmokeBomb = ownedEquipment.some(
    (e) => e.equipment.id === 6 && e.quantity > 0
  );

  const handlePause = async () => {
    await useConsumable(6);
    await pause();
  };

  const handleRetreat = async () => {
    await retreat();
    await closeHuntWindow();
  };

  const taskName = task?.name || timer.task_name;

  return (
    <div
      className="bg-[#3366AA] text-white flex flex-col"
      onMouseDown={(e) => {
        // Only drag on the background, not on buttons
        if ((e.target as HTMLElement).closest("button")) return;
        getCurrentWindow().startDragging();
      }}
    >
      {/* Row 1: Big countdown */}
      <div className="text-center pt-3">
        <span className="text-[96px] pixel-title text-white leading-none">
          {formatTime(timer.pomodoro_remaining_seconds)}
        </span>
      </div>

      {/* Row 2: Task name + controls */}
      <div className="flex items-center px-6 py-2 gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[28px] font-bold text-[#FFD93D] truncate leading-tight">
            {taskName}
          </div>
        </div>
        <div className="flex gap-4 shrink-0 items-center">
          {strategyNote && (
            <button
              onClick={() => setShowStrategy(!showStrategy)}
              className="text-[24px] text-white/40 hover:text-white"
              title="查看策略"
            >
              {showStrategy ? "📝" : "📋"}
            </button>
          )}
          {timer.is_paused ? (
            <button onClick={resume} className="text-[24px] text-[#FFD93D] hover:text-white">▶</button>
          ) : (
            hasSmokeBomb && (
              <button onClick={handlePause} className="text-[24px] text-white/50 hover:text-white">⏸</button>
            )
          )}
          <button onClick={handleRetreat} className="text-[24px] text-white/30 hover:text-[#EE4433]">✕</button>
        </div>
      </div>

      {/* Row 3: Strategy note (collapsible) */}
      {showStrategy && strategyNote && (
        <div className="px-6 pb-3">
          <div className="text-[22px] text-white/60 leading-snug truncate">
            🎯 {strategyNote}
          </div>
        </div>
      )}
    </div>
  );
}
