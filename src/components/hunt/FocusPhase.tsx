import { memo, useCallback, useEffect } from "react";
import type { TimerState, TaskCategory } from "../../types";
import { useTimerStore } from "../../stores/timerStore";
import { useTaskStore } from "../../stores/taskStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { formatTime } from "../../lib/format";
import { closeHuntWindow, resizeHuntWindow } from "../../lib/commands";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PixelBackground } from "../common/PixelBackground";
import { PixelSprite } from "../common/PixelSprite";
import { SPRITE_DATA } from "../../lib/spriteData";
import { selectSpecies } from "../../lib/bestiary";

interface FocusPhaseProps {
  timer: TimerState;
  strategyNote?: string;
}

// Consumable IDs
const SMOKE_BOMB = 7;
const EXTEND_FOCUS = 8;
const SHORTEN_FOCUS = 10;

export const FocusPhase = memo(function FocusPhase({ timer, strategyNote }: FocusPhaseProps) {
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const retreat = useTimerStore((s) => s.retreat);
  const extendFocus = useTimerStore((s) => s.extendFocus);
  const shortenFocus = useTimerStore((s) => s.shortenFocus);
  const { tasks } = useTaskStore();
  const { ownedEquipment, useConsumable, fetchAll } = useInventoryStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Fixed window height
  useEffect(() => {
    resizeHuntWindow(600, 220).catch(() => {});
  }, []);

  const task = tasks.find((t) => t.id === timer.task_id);
  const taskCategory = (task?.category || "other") as TaskCategory;
  const taskName = task?.name || timer.task_name;

  // Monster sprite
  const species = task ? selectSpecies(task.category, task.name, task.difficulty) : null;
  const spriteData = species ? SPRITE_DATA[species.id] : null;

  // Consumable quantities
  const getQty = (id: number) =>
    ownedEquipment.find((e) => e.equipment.id === id)?.quantity || 0;
  const smokeBombQty = getQty(SMOKE_BOMB);
  const extendQty = getQty(EXTEND_FOCUS);
  const shortenQty = getQty(SHORTEN_FOCUS);

  const handlePause = useCallback(async () => {
    const ok = await useConsumable(SMOKE_BOMB);
    if (ok) await pause();
  }, [useConsumable, pause]);

  const handleExtend = useCallback(async () => {
    const ok = await useConsumable(EXTEND_FOCUS);
    if (ok) await extendFocus(3);
  }, [useConsumable, extendFocus]);

  const handleShorten = useCallback(async () => {
    const ok = await useConsumable(SHORTEN_FOCUS);
    if (ok) await shortenFocus(5);
  }, [useConsumable, shortenFocus]);

  const handleRetreat = useCallback(async () => {
    await retreat();
    await closeHuntWindow();
  }, [retreat]);

  return (
    <div
      className="bg-deep-blue text-white flex flex-col relative"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea")) return;
        getCurrentWindow().startDragging();
      }}
    >
      <PixelBackground category={taskCategory} />

      {/* Row 1: Big countdown */}
      <div className="text-center pt-3">
        <span className="text-[96px] pixel-title text-white leading-none">
          {formatTime(timer.timer_mode === "dagger" ? timer.remaining_seconds : timer.pomodoro_remaining_seconds)}
        </span>
      </div>

      {/* Row 2: Monster icon + task name + strategy */}
      <div className="flex items-center justify-center gap-2 px-6">
        {spriteData && <PixelSprite sprite={spriteData} scale={1.5} />}
        <span className="text-[24px] font-bold text-sunny truncate leading-tight">
          {taskName}
        </span>
      </div>
      {strategyNote && (
        <div className="text-center px-6 mt-0.5">
          <span className="text-[14px] text-white/50 truncate block">
            🎯 {strategyNote}
          </span>
        </div>
      )}

      {/* Row 3: Item bar + retreat */}
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex gap-3 items-center">
          {timer.is_paused ? (
            <button
              onClick={resume}
              className="text-[18px] text-sunny hover:text-white px-2 py-0.5"
              aria-label="继续"
              title="继续"
            >
              ▶ 继续
            </button>
          ) : (
            <>
              {smokeBombQty > 0 && (
                <button
                  onClick={handlePause}
                  className="text-[14px] text-white/60 hover:text-white flex items-center gap-0.5"
                  title="烟雾弹 · 暂停"
                >
                  💣<span className="text-[12px]">×{smokeBombQty}</span>
                </button>
              )}
              {extendQty > 0 && (
                <button
                  onClick={handleExtend}
                  className="text-[14px] text-white/60 hover:text-white flex items-center gap-0.5"
                  title="时间延伸 · +3分钟"
                >
                  ⏩<span className="text-[12px]">×{extendQty}</span>
                </button>
              )}
              {shortenQty > 0 && (
                <button
                  onClick={handleShorten}
                  className="text-[14px] text-white/60 hover:text-white flex items-center gap-0.5"
                  title="时间压缩 · -5分钟"
                >
                  ⏪<span className="text-[12px]">×{shortenQty}</span>
                </button>
              )}
            </>
          )}
        </div>
        <button
          onClick={handleRetreat}
          className="text-[18px] text-white/30 hover:text-tomato"
          aria-label="撤退"
          title="撤退"
        >
          ✕
        </button>
      </div>
    </div>
  );
});
