import { useEffect, useState } from "react";
import type { MonsterSpecies } from "../../lib/bestiary";
import type { SpeciesDiscovery } from "../../types";
import { getDb } from "../../lib/db";
import { getSpriteData } from "../../lib/spriteData";
import { PixelCard } from "../common/PixelCard";
import { PixelSprite } from "../common/PixelSprite";

interface SpeciesDetailProps {
  species: MonsterSpecies;
  discovery: SpeciesDiscovery;
}

interface KillRecord {
  taskName: string;
  completedAt: string;
  actualPomodoros: number;
}

export function SpeciesDetail({ species, discovery }: SpeciesDetailProps) {
  const [kills, setKills] = useState<KillRecord[]>([]);

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const rows = await db.select<
        { name: string; completed_at: string; actual_pomodoros: number }[]
      >(
        `SELECT name, completed_at, actual_pomodoros FROM tasks
         WHERE monster_variant = $1 AND status = 'killed' AND parent_task_id IS NULL
         ORDER BY completed_at DESC`,
        [species.id]
      );
      setKills(
        rows.map((r) => ({
          taskName: r.name,
          completedAt: r.completed_at,
          actualPomodoros: r.actual_pomodoros,
        }))
      );
    })();
  }, [species.id]);

  return (
    <PixelCard bg="cloud" padding="md" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {(() => {
            const sprite = getSpriteData(species.id);
            return sprite ? (
              <PixelSprite sprite={sprite} animation="idle" scale={3} />
            ) : (
              <span className="text-3xl monster-sprite">{species.emoji}</span>
            );
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-pixel-black">{species.name}</p>
          <p className="text-xs text-pixel-black/60">{species.family} · {species.habitat}</p>
          <p className="text-xs text-pixel-black/40">
            首次发现: {discovery.firstKillDate.slice(0, 10)} · 击杀: {discovery.killCount}
          </p>
        </div>
      </div>

      {species.traits.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {species.traits.map((trait) => (
            <span key={trait.name} className="text-xs bg-cream px-2 py-0.5 outline-1 outline-pixel-black/20 outline-offset-[-1px]">
              {trait.icon} {trait.name}·{trait.desc}
            </span>
          ))}
        </div>
      )}

      {kills.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-pixel-black/60">击杀记录</p>
          {kills.slice(0, 5).map((kill, i) => (
            <div key={i} className="flex justify-between text-xs text-pixel-black/70">
              <span className="truncate flex-1">{kill.taskName}</span>
              <span className="shrink-0 ml-2">
                {kill.completedAt.slice(0, 10)} · {kill.actualPomodoros}🍅
              </span>
            </div>
          ))}
          {kills.length > 5 && (
            <p className="text-xs text-pixel-black/40">...还有 {kills.length - 5} 条记录</p>
          )}
        </div>
      )}
    </PixelCard>
  );
}
