import { useEffect, useState } from "react";
import { useProfileStore } from "../../stores/profileStore";
import { getDb } from "../../lib/db";
import { StatsOverview } from "./StatsOverview";
import { MilestoneList } from "./MilestoneList";
import { BestiaryCollection } from "./BestiaryCollection";
import { BattleHistory } from "./BattleHistory";

export function HunterProfile() {
  const { stats, milestones, discoveredSpecies, loading, fetchAll } = useProfileStore();
  const [craftedCount, setCraftedCount] = useState(0);

  useEffect(() => {
    (async () => {
      // Always fetch profile data first — this must not be blocked
      await fetchAll();
      const db = await getDb();
      const [result] = await db.select<[{ cnt: number }]>(
        "SELECT COUNT(*) as cnt FROM player_equipment pe JOIN equipment e ON pe.equipment_id = e.id WHERE e.is_consumable = 0 AND pe.quantity > 0"
      );
      setCraftedCount(result.cnt);
      // Then detect milestones (catches any missed during settlement)
      try {
        const newMilestones = await useProfileStore.getState().detectNewMilestones();
        if (newMilestones.length > 0) {
          // Re-fetch to pick up newly detected milestones
          await useProfileStore.getState().fetchMilestones();
        }
      } catch (error) {
        console.error("[HunterProfile] detectNewMilestones failed:", error);
      }
    })();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-pixel-black/50">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      <h2 className="text-base font-bold text-pixel-black">📜 猎人档案</h2>
      <StatsOverview stats={stats} />
      <MilestoneList achieved={milestones} stats={stats} craftedCount={craftedCount} />
      <BestiaryCollection discoveredSpecies={discoveredSpecies} />
      <BattleHistory />
    </div>
  );
}
