import { useEffect, useState } from "react";
import type { Material, MilestoneRecord } from "../../types";
import { getDb } from "../../lib/db";
import { NARRATIVE } from "../../lib/narrative";
import { audioManager } from "../../lib/audio";
import { useTaskStore } from "../../stores/taskStore";
import { useTimerStore } from "../../stores/timerStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useProfileStore } from "../../stores/profileStore";
import { syncAfterTaskRelease } from "../../lib/storeSync";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { MilestoneNotification } from "../common/MilestoneNotification";
import { SpeciesDiscoveryCard } from "../common/SpeciesDiscoveryCard";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface SettlementProps {
  drops: { materialId: number; quantity: number }[];
  hpReachedZero: boolean;
  unlockedRecipes: string[];
  showFirstKillReward: boolean;
  onContinue: () => void;
}

type SettlementView = "loot" | "kill-confirm" | "celebration" | "pursuit";

export function Settlement({ drops, hpReachedZero, unlockedRecipes, showFirstKillReward, onContinue }: SettlementProps) {
  const [materials, setMaterials] = useState<Map<number, Material>>(new Map());
  const { tasks, killTask, pursuitTask } = useTaskStore();
  const { timer } = useTimerStore();
  const [view, setView] = useState<SettlementView>(
    hpReachedZero ? "kill-confirm" : "loot"
  );

  // Sync view with hpReachedZero prop changes (handles late state updates)
  useEffect(() => {
    if (hpReachedZero && view === "loot") {
      setView("kill-confirm");
    }
  }, [hpReachedZero]);

  const [pursuitHp, setPursuitHp] = useState<number>(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [defeatAnimating, setDefeatAnimating] = useState(false);
  const [pendingMilestones, setPendingMilestones] = useState<MilestoneRecord[]>([]);
  const [discoveredSpeciesId, setDiscoveredSpeciesId] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);

  const task = tasks.find((t) => t.id === timer.task_id);

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const mats = await db.select<Material[]>("SELECT * FROM materials");
      setMaterials(new Map(mats.map((m) => [m.id, m])));

      // Detect new milestones after pomodoro completion
      const newMilestones = await useProfileStore.getState().detectNewMilestones();
      if (newMilestones.length > 0) {
        setPendingMilestones(newMilestones);
      }
    })();
  }, []);

  useEffect(() => {
    if (task) {
      setPursuitHp(task.actual_pomodoros + 1);
    }
  }, [task]);

  const handleConfirmKill = async () => {
    if (!task) return;
    await killTask(task.id);
    await syncAfterTaskRelease();
    audioManager.playSfx("monster-down");

    // Play defeat animation before showing celebration
    setDefeatAnimating(true);
    setTimeout(() => {
      setDefeatAnimating(false);
      setShowSparkle(true);
      setView("celebration");
    }, 300);

    // Check if this is a new species discovery
    // Re-fetch task to get updated species_id
    const freshTasks = useTaskStore.getState().tasks;
    const freshTask = freshTasks.find((t) => t.id === task.id);
    const speciesId = freshTask?.species_id || task.species_id;
    if (speciesId) {
      const isNew = await useProfileStore.getState().isSpeciesNew(speciesId);
      if (isNew) {
        setDiscoveredSpeciesId(speciesId);
      }
    }

    // Re-detect milestones after kill (kill might trigger new ones)
    const newMilestones = await useProfileStore.getState().detectNewMilestones();
    if (newMilestones.length > 0) {
      setPendingMilestones((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const unique = newMilestones.filter((m) => !existingIds.has(m.id));
        return [...prev, ...unique];
      });
    }
  };

  const handleStartPursuit = () => {
    setView("pursuit");
  };

  const handleConfirmPursuit = async () => {
    if (!task) return;
    const inv = useInventoryStore.getState();
    // Pursuit scroll = equipment ID 14 (追踪术卷轴)
    const hasScroll = inv.ownedEquipment.some(
      (e) => e.equipment.id === 14 && e.quantity > 0
    );
    if (!hasScroll) return;
    await inv.useConsumable(14);
    await pursuitTask(task.id, pursuitHp);
    await syncAfterTaskRelease();
    onContinue();
  };

  // Handle continue: show discovery → milestones → then actual continue
  const handleContinueWithNotifications = () => {
    if (discoveredSpeciesId) {
      setShowDiscovery(true);
      return;
    }
    if (pendingMilestones.length > 0) {
      setShowMilestone(true);
      return;
    }
    onContinue();
  };

  const handleDismissDiscovery = () => {
    setShowDiscovery(false);
    setDiscoveredSpeciesId(null);
    if (pendingMilestones.length > 0) {
      setShowMilestone(true);
    } else {
      onContinue();
    }
  };

  const handleDismissMilestone = async () => {
    const current = pendingMilestones[0];
    if (current) {
      await useProfileStore.getState().markMilestoneNotified(current.id);
      const remaining = pendingMilestones.slice(1);
      setPendingMilestones(remaining);
      if (remaining.length === 0) {
        setShowMilestone(false);
        onContinue();
      }
    }
  };

  const hasScroll = useInventoryStore.getState().ownedEquipment.some(
    (e) => e.equipment.id === 14 && e.quantity > 0
  );
  const minPursuitHp = task ? task.actual_pomodoros + 1 : 1;

  // Loot display (shared between views)
  const lootSection = (
    <div className="flex flex-col gap-[var(--space-sm,4px)]">
      <p className="text-sm text-pixel-black/60">{NARRATIVE.settlementYouGot}</p>
      {drops.map((drop, i) => {
        const mat = materials.get(drop.materialId);
        return (
          <div
            key={i}
            className="bg-cream p-3 outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] flex items-center gap-2 text-sm pixel-loot-enter"
            style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
          >
            <span className="text-lg">{mat?.icon || "🔮"}</span>
            <span className="flex-1 text-pixel-black">{mat?.name || "未知素材"}</span>
            <span className="text-orange font-bold">x{drop.quantity}</span>
          </div>
        );
      })}
    </div>
  );

  const firstKillRewardSection = showFirstKillReward ? (
    <PixelCard bg="dark" padding="md" className="flex flex-col gap-2 ring-2 ring-sunny pixel-pulse">
      <p className="text-sm font-bold text-sunny">🎁 新手奖励！</p>
      <div className="flex items-center gap-2 text-sm text-white/90">
        <span>💨</span>
        <span>烟雾弹 x2</span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">
        消耗品可以在狩猎中使用，帮助你应对各种情况。烟雾弹可以在专注时暂停番茄钟（关闭狩猎窗口即可触发）。
      </p>
      <p className="text-xs text-sunny/70">
        在工坊中用番茄精华购买更多道具
      </p>
    </PixelCard>
  ) : null;

  const recipeUnlockSection = unlockedRecipes.length > 0 ? (
    <PixelCard bg="cream" padding="md" className="flex flex-col gap-1 ring-2 ring-sunny">
      <p className="text-sm font-bold text-sunny">🔓 新配方发现！</p>
      {unlockedRecipes.map((name, i) => (
        <p key={i} className="text-sm text-pixel-black">
          ✨ {name} 的制作配方已解锁
        </p>
      ))}
      <p className="text-xs text-pixel-black/50 mt-1">前往工坊查看详情</p>
    </PixelCard>
  ) : null;

  const efficiencyLabel = task ? getEfficiencyLabel(task.actual_pomodoros, task.total_hp) : null;

  return (
    <div
      className="bg-white text-pixel-black p-6 min-h-screen flex flex-col gap-4"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea")) return;
        getCurrentWindow().startDragging();
      }}
      onClick={() => {
        // Skip animations on click (only during animated states)
        if (defeatAnimating) {
          setDefeatAnimating(false);
          setShowSparkle(true);
          setView("celebration");
        }
      }}
    >
      <h2 className="pixel-title text-lg font-bold text-deep-blue text-center bg-sunny px-4 py-2 outline-2 outline-pixel-black outline-offset-[-2px]">
        {NARRATIVE.settlementTitle}
      </h2>

      {view === "kill-confirm" && (
        <>
          <PixelCard bg="cream" padding="md" className="text-center">
            <p className={`text-2xl mb-1 ${defeatAnimating ? "pixel-hit" : ""}`}>⚔️</p>
            <p className={`text-base font-bold text-tomato ${defeatAnimating ? "pixel-defeat-fade" : ""}`}>
              怪物倒地了！
            </p>
            <p className="text-sm text-pixel-black/60 mt-1">
              {task?.monster_name || "怪物"} 的 HP 已归零，这个任务完成了吗？
            </p>
          </PixelCard>

          {lootSection}

          <div className="flex gap-2 mt-auto">
            <PixelButton
              variant="cta"
              size="lg"
              onClick={handleConfirmKill}
              className="flex-1"
            >
              确认击杀 ⚔️
            </PixelButton>
            <PixelButton
              variant="default"
              size="lg"
              onClick={handleStartPursuit}
              className="flex-1"
              disabled={!hasScroll}
              title={!hasScroll ? "需要追踪术卷轴" : undefined}
            >
              发起追击 🔍
            </PixelButton>
          </div>
        </>
      )}

      {view === "pursuit" && task && (
        <>
          <PixelCard bg="cream" padding="md" className="flex flex-col gap-3">
            <p className="text-sm font-bold">
              追击 {task.monster_name || task.name}
            </p>
            <p className="text-xs text-pixel-black/60">
              消耗 1 个追踪术卷轴，重新设定怪物血量继续讨伐
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs">新 HP：</label>
              <input
                type="number"
                min={minPursuitHp}
                value={pursuitHp}
                onChange={(e) =>
                  setPursuitHp(Math.max(minPursuitHp, parseInt(e.target.value) || minPursuitHp))
                }
                className="bg-white border border-pixel-black rounded px-2 py-1 w-16 text-center text-sm"
              />
              <span className="text-xs text-pixel-black/60">
                (已造成 {task.actual_pomodoros} 点伤害，新 HP 不得低于 {minPursuitHp})
              </span>
            </div>
          </PixelCard>

          {lootSection}

          <div className="flex gap-2 mt-auto">
            <PixelButton
              variant="cta"
              size="lg"
              onClick={handleConfirmPursuit}
              className="flex-1"
            >
              确认追击
            </PixelButton>
            <PixelButton
              variant="default"
              size="lg"
              onClick={() => setView("kill-confirm")}
              className="flex-1"
            >
              返回
            </PixelButton>
          </div>
        </>
      )}

      {view === "celebration" && task && (
        <>
          <PixelCard bg="cream" padding="md" className="text-center relative overflow-hidden">
            {showSparkle && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const radius = 30 + Math.random() * 40;
                  return (
                    <span
                      key={i}
                      className="absolute text-lg pixel-sparkle"
                      style={{
                        left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                        animationDelay: `${i * 80}ms`,
                        color: "#FFD93D",
                      }}
                    >
                      ✨
                    </span>
                  );
                })}
              </div>
            )}
            <p className="text-2xl mb-1 pixel-defeat-fade">💀</p>
            <p className="text-lg font-bold text-tomato">
              🎉 怪物被击败！
            </p>
            <p className="text-sm text-grass mt-1">
              {task.monster_name || task.name}
            </p>
          </PixelCard>

          <PixelCard bg="cloud" padding="md" className="flex flex-col gap-1">
            <p className="text-sm font-bold text-pixel-black/80">击杀统计</p>
            <div className="flex justify-between text-xs">
              <span>实际番茄</span>
              <span className="font-bold">{task.actual_pomodoros} 🍅</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>预估番茄</span>
              <span>{task.total_hp} 🍅</span>
            </div>
            {efficiencyLabel && (
              <p className={`text-sm font-bold text-center mt-1 ${efficiencyLabel.color}`}>
                {efficiencyLabel.text}
              </p>
            )}
          </PixelCard>

          {lootSection}
          {recipeUnlockSection}
          {firstKillRewardSection}

          <PixelButton variant="default" size="lg" onClick={handleContinueWithNotifications} className="mt-auto w-full">
            {NARRATIVE.settlementContinue}
          </PixelButton>
        </>
      )}

      {view === "loot" && (
        <>
          <PixelCard bg="cream" padding="md" className="text-center">
            <p className="text-base font-bold text-orange">{NARRATIVE.monsterHurt}</p>
            <p className="text-tomato mt-1">{NARRATIVE.keepFighting}</p>
          </PixelCard>

          {lootSection}
          {recipeUnlockSection}
          {firstKillRewardSection}

          <PixelButton variant="default" size="lg" onClick={handleContinueWithNotifications} className="mt-auto w-full">
            {NARRATIVE.settlementContinue}
          </PixelButton>
        </>
      )}

      {/* Notification overlays */}
      {showDiscovery && discoveredSpeciesId && (
        <SpeciesDiscoveryCard
          speciesId={discoveredSpeciesId}
          onDismiss={handleDismissDiscovery}
        />
      )}
      {showMilestone && pendingMilestones.length > 0 && (
        <MilestoneNotification
          milestoneId={pendingMilestones[0].id}
          onDismiss={handleDismissMilestone}
        />
      )}
    </div>
  );
}

function getEfficiencyLabel(actual: number, estimated: number): { text: string; color: string } {
  if (actual === estimated) {
    return { text: "完美估时 ⚔️", color: "text-pixel-black" };
  } else if (actual < estimated) {
    return {
      text: `提前完成！省了 ${estimated - actual} 个番茄 🎯`,
      color: "text-grass",
    };
  } else {
    return {
      text: `多花了 ${actual - estimated} 个番茄 💪`,
      color: "text-orange",
    };
  }
}
