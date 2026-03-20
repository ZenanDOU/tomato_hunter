import { useState } from "react";
import type { TimerState } from "../../types";
import { useTimerStore } from "../../stores/timerStore";
import { useTaskStore } from "../../stores/taskStore";
import { getDb } from "../../lib/db";
import { selectSpecies } from "../../lib/bestiary";
import { parseMonsterVariant } from "../../lib/monsterAttributes";
import { AttributeTag } from "../common/AttributeTag";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { PixelSprite } from "../common/PixelSprite";
import { SPRITE_DATA } from "../../lib/spriteData";

interface PrepPhaseProps {
  timer: TimerState;
  onStartBattle?: (strategyNote: string) => void;
}

export function PrepPhase({ timer, onStartBattle }: PrepPhaseProps) {
  const { retreat, advancePhase } = useTimerStore();
  const { tasks } = useTaskStore();
  const [strategyNote, setStrategyNote] = useState("");

  const task = tasks.find((t) => t.id === timer.task_id);
  const species = task ? selectSpecies(task.category, task.name, task.difficulty) : null;
  const { attributes } = parseMonsterVariant(task?.monster_variant || "");

  const handleStartBattle = async () => {
    if (strategyNote.trim() && timer.pomodoro_id) {
      const db = await getDb();
      await db.execute(
        "UPDATE pomodoros SET strategy_note = $1 WHERE id = $2",
        [strategyNote, timer.pomodoro_id]
      );
    }
    if (onStartBattle) {
      onStartBattle(strategyNote);
    }
    await advancePhase();
  };

  return (
    <div className="bg-[#55BBEE] text-[#333333] p-5 min-h-screen flex flex-col gap-4">
      {/* Monster display */}
      <PixelCard bg="cloud" padding="lg" className="flex flex-col items-center gap-2">
        {species && (
          SPRITE_DATA[species.id] ? (
            <PixelSprite sprite={SPRITE_DATA[species.id]} scale={3} />
          ) : (
            <span className="monster-sprite">{species.emoji}</span>
          )
        )}
        <h2 className="pixel-title text-base font-bold text-[#EE4433]">
          {task?.monster_name || timer.task_name}
        </h2>
        <p className="text-xs text-[#333333]/60">{task?.name}</p>
        {task && (
          <div className="flex items-center gap-3 text-xs text-[#333333]/60">
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
          <p className="text-xs text-[#333333]/50 text-center mt-1">
            {task.monster_description}
          </p>
        )}
      </PixelCard>

      {/* Strategy section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-white">
          🎯 准备从哪里开始入手？
        </label>
        <textarea
          value={strategyNote}
          onChange={(e) => setStrategyNote(e.target.value)}
          className="bg-white outline-2 outline-[#333333] outline-offset-[-2px] p-3 text-sm resize-none h-20 text-[#333333] placeholder-[#333333]/40"
          placeholder="想好策略再出击...（选填）"
          autoFocus
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
        <PixelButton variant="cta" size="lg" onClick={handleStartBattle} className="flex-1">
          ⚔️ 开始战斗
        </PixelButton>
      </div>
    </div>
  );
}
