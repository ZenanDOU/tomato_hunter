import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { TimerState } from "../../types";
import { useTimerStore } from "../../stores/timerStore";
import { useTaskStore } from "../../stores/taskStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { getDb } from "../../lib/db";
import { selectSpecies } from "../../lib/bestiary";
import { parseMonsterVariant } from "../../lib/monsterAttributes";
import { AttributeTag } from "../common/AttributeTag";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PixelSprite } from "../common/PixelSprite";
import { SPRITE_DATA } from "../../lib/spriteData";
import { audioManager } from "../../lib/audio";
import { formatTime } from "../../lib/format";

interface PrepPhaseProps {
  timer: TimerState;
  onStartBattle?: (strategyNote: string) => void;
}

const SKIP_PREP_ID = 11;

export const PrepPhase = memo(function PrepPhase({ timer, onStartBattle }: PrepPhaseProps) {
  const retreat = useTimerStore((s) => s.retreat);
  const advancePhase = useTimerStore((s) => s.advancePhase);
  const { tasks } = useTaskStore();
  const { ownedEquipment, useConsumable, fetchAll } = useInventoryStore();
  const [strategyNote, setStrategyNote] = useState("");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const skipPrepQty = ownedEquipment.find((e) => e.equipment.id === SKIP_PREP_ID)?.quantity || 0;

  const handleSkipPrep = useCallback(async () => {
    const ok = await useConsumable(SKIP_PREP_ID);
    if (ok) {
      audioManager.playSfx("phase-start");
      if (onStartBattle) onStartBattle("");
      await advancePhase();
    }
  }, [useConsumable, onStartBattle, advancePhase]);

  const task = tasks.find((t) => t.id === timer.task_id);
  const species = useMemo(
    () => (task ? selectSpecies(task.category, task.name, task.difficulty) : null),
    [task?.category, task?.name, task?.difficulty]
  );
  const attributes = useMemo(
    () => parseMonsterVariant(task?.monster_variant || "").attributes,
    [task?.monster_variant]
  );

  const handleStartBattle = useCallback(async () => {
    if (strategyNote.trim() && timer.pomodoro_id) {
      try {
        const db = await getDb();
        await db.execute(
          "UPDATE pomodoros SET strategy_note = $1 WHERE id = $2",
          [strategyNote, timer.pomodoro_id]
        );
      } catch (error) {
        console.error("[PrepPhase] failed to save strategy note:", error);
      }
    }
    // Enter habitat BGM
    if (task) {
      audioManager.enterHabitat(task.category);
    }
    audioManager.playSfx("phase-start");
    if (onStartBattle) {
      onStartBattle(strategyNote);
    }
    await advancePhase();
  }, [strategyNote, timer.pomodoro_id, task, onStartBattle, advancePhase]);

  return (
    <div
      className="bg-sky text-pixel-black p-5 min-h-screen flex flex-col gap-4"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea")) return;
        getCurrentWindow().startDragging();
      }}
    >
      {/* Monster display */}
      <PixelCard bg="cloud" padding="lg" className="flex flex-col items-center gap-2">
        {species && (
          SPRITE_DATA[species.id] ? (
            <PixelSprite sprite={SPRITE_DATA[species.id]} scale={3} />
          ) : (
            <span className="monster-sprite">{species.emoji}</span>
          )
        )}
        <h2 className="pixel-title text-base font-bold text-tomato">
          {task?.monster_name || timer.task_name}
        </h2>
        <p className="text-xs text-pixel-black/60">{task?.name}</p>
        {task && (
          <div className="flex items-center gap-3 text-xs text-pixel-black/60">
            <span>❤️ {task.current_hp}/{task.total_hp} HP</span>
            {task.body_part && (
              <span>
                {task.body_part === "head" ? "🧠" : task.body_part === "body" ? "💪" : "🦶"}{" "}
                {task.body_part === "head" ? "头部" : task.body_part === "body" ? "身体" : "脚部"}
              </span>
            )}
          </div>
        )}
        {attributes.length > 0 && task && (
          <div className="flex gap-1">
            {attributes.map((a) => (
              <AttributeTag key={a} attribute={a} category={task.category} />
            ))}
          </div>
        )}
        {task?.monster_description && (
          <p className="text-xs text-pixel-black/50 text-center mt-1">
            {task.monster_description}
          </p>
        )}
      </PixelCard>

      {/* Pomodoro countdown */}
      <div className="text-center">
        <span className="text-3xl pixel-title text-white">
          {formatTime(timer.pomodoro_remaining_seconds)}
        </span>
        {timer.total_seconds > 0 &&
          timer.total_seconds - timer.remaining_seconds >
            (timer.timer_mode === "hammer" ? 180 : 120) && (
            <p className="text-xs text-tomato mt-1 pixel-pulse">
              策略时间已到，建议尽快开始专注
            </p>
          )}
      </div>

      {/* Strategy section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-white">
          🎯 准备从哪里开始入手？
        </label>
        <textarea
          value={strategyNote}
          onChange={(e) => setStrategyNote(e.target.value)}
          className="bg-white outline-2 outline-pixel-black outline-offset-[-2px] p-3 text-sm resize-none h-20 text-pixel-black placeholder-pixel-black/40"
          placeholder="想好策略再出击...（选填）"
          autoFocus
          aria-label="策略笔记"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={retreat}
          className="text-xs text-white/60 hover:text-white px-3 py-2"
        >
          撤退
        </button>
        {skipPrepQty > 0 && (
          <button
            onClick={handleSkipPrep}
            className="text-xs text-white/60 hover:text-white px-3 py-2 flex items-center gap-1"
            title="策略跳过 · 直接进入战斗"
          >
            ⏭ 跳过<span className="text-[10px]">×{skipPrepQty}</span>
          </button>
        )}
        <PixelButton variant="cta" size="lg" onClick={handleStartBattle} className="flex-1">
          ⚔️ 开始战斗
        </PixelButton>
      </div>
    </div>
  );
});
