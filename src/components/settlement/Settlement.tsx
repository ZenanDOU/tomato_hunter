import { useEffect, useState } from "react";
import type { Material } from "../../types";
import { getDb } from "../../lib/db";
import { NARRATIVE } from "../../lib/narrative";
import { useTaskStore } from "../../stores/taskStore";
import { useTimerStore } from "../../stores/timerStore";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";

interface SettlementProps {
  drops: { materialId: number; quantity: number }[];
  onContinue: () => void;
}

export function Settlement({ drops, onContinue }: SettlementProps) {
  const [materials, setMaterials] = useState<Map<number, Material>>(
    new Map()
  );
  const { tasks } = useTaskStore();
  const { timer } = useTimerStore();

  const task = tasks.find((t) => t.id === timer.task_id);
  const isFullyDefeated = task && task.current_hp <= 0;

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const mats = await db.select<Material[]>("SELECT * FROM materials");
      setMaterials(new Map(mats.map((m) => [m.id, m])));
    })();
  }, []);

  return (
    <div className="bg-white text-[#333333] p-6 min-h-screen flex flex-col gap-4">
      <h2 className="pixel-title text-lg font-bold text-[#FFD93D] text-center">
        {NARRATIVE.settlementTitle}
      </h2>

      <PixelCard bg="cream" padding="md" className="text-center">
        {isFullyDefeated ? (
          <>
            <p className="text-base font-bold text-[#EE4433]">{NARRATIVE.monsterDefeated}</p>
            <p className="text-[#5BBF47] mt-1">{NARRATIVE.tomatoRescued}</p>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-[#FF8844]">{NARRATIVE.monsterHurt}</p>
            <p className="text-[#EE4433] mt-1">{NARRATIVE.keepFighting}</p>
          </>
        )}
      </PixelCard>

      <PixelCard bg="cloud" padding="md" className="flex flex-col gap-2">
        <p className="text-sm text-[#333333]/60">{NARRATIVE.settlementYouGot}</p>
        {drops.map((drop, i) => {
          const mat = materials.get(drop.materialId);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>{mat?.icon || "🔮"}</span>
              <span>{mat?.name || "未知素材"}</span>
              <span className="text-[#FF8844]">x{drop.quantity}</span>
            </div>
          );
        })}
      </PixelCard>

      <PixelButton variant="default" size="lg" onClick={onContinue} className="mt-auto w-full">
        {NARRATIVE.settlementContinue}
      </PixelButton>
    </div>
  );
}
