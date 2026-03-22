import type { HunterStats } from "../../types";
import { PixelCard } from "../common/PixelCard";

interface StatsOverviewProps {
  stats: HunterStats;
}

const STAT_ITEMS: { key: keyof HunterStats; label: string; icon: string }[] = [
  { key: "totalPomodoros", label: "番茄钟", icon: "🍅" },
  { key: "totalKills", label: "击杀数", icon: "⚔️" },
  { key: "speciesDiscovered", label: "图鉴", icon: "📖" },
  { key: "activeDays", label: "活跃天数", icon: "📅" },
  { key: "longestStreak", label: "最长连续", icon: "🔥" },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <PixelCard bg="cream" padding="md">
      <div className="grid grid-cols-5 gap-2">
        {STAT_ITEMS.map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-1">
            <span className="text-lg">{item.icon}</span>
            <span className="text-lg font-bold text-pixel-black">
              {item.key === "speciesDiscovered" ? `${stats[item.key]}/15` : stats[item.key]}
            </span>
            <span className="text-xs text-pixel-black/60">{item.label}</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
