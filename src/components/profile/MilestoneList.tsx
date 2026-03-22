import type { MilestoneRecord, HunterStats } from "../../types";
import { MILESTONES } from "../../lib/milestones";
import { PixelCard } from "../common/PixelCard";

interface MilestoneListProps {
  achieved: MilestoneRecord[];
  stats: HunterStats;
  craftedCount: number;
}

export function MilestoneList({ achieved, stats, craftedCount }: MilestoneListProps) {
  const achievedIds = new Set(achieved.map((m) => m.id));
  const achievedMap = new Map(achieved.map((m) => [m.id, m]));

  const achievedDefs = MILESTONES.filter((m) => achievedIds.has(m.id));
  const lockedDefs = MILESTONES.filter((m) => !achievedIds.has(m.id));

  const checkStats = {
    ...stats,
    craftedCount,
    perfectDays: 0,
    streakDays: stats.longestStreak,
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-pixel-black">
        里程碑 ({achievedDefs.length}/{MILESTONES.length})
      </p>

      {achievedDefs.length === 0 && lockedDefs.length > 0 && (
        <p className="text-xs text-pixel-black/50">完成你的第一次狩猎来解锁里程碑！</p>
      )}

      {achievedDefs.map((def) => {
        const record = achievedMap.get(def.id)!;
        return (
          <PixelCard key={def.id} bg="cream" padding="sm" className="flex items-center gap-3">
            <span className="text-xl">{def.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-pixel-black">{def.name}</p>
              <p className="text-xs text-pixel-black/60">{def.description}</p>
            </div>
            <span className="text-xs text-pixel-black/40 shrink-0">
              {record.achieved_at.slice(0, 10)}
            </span>
          </PixelCard>
        );
      })}

      {lockedDefs.map((def) => {
        const result = def.check(checkStats);
        return (
          <PixelCard key={def.id} bg="cloud" padding="sm" className="flex items-center gap-3 opacity-50">
            <span className="text-xl grayscale">🔒</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-pixel-black/50">{def.name}</p>
              {result.progress && (
                <p className="text-xs text-pixel-black/40">
                  {result.progress.current}/{result.progress.target}
                </p>
              )}
            </div>
          </PixelCard>
        );
      })}
    </div>
  );
}
