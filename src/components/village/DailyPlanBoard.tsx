import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { usePlanStore } from "../../stores/planStore";
import { useTaskStore } from "../../stores/taskStore";
import { useTimerStore } from "../../stores/timerStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { openHuntWindow } from "../../lib/commands";
import { getDb } from "../../lib/db";
import { syncAfterTaskRelease } from "../../lib/storeSync";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { PixelBadge } from "../common/PixelBadge";
import { NARRATIVE } from "../../lib/narrative";
import type { PlannedTaskEntry, Task } from "../../types";
import { useOnboardingQuest, QuestCard } from "../common/OnboardingOverlay";

/** 计算番茄组拆分（每组 ≤4，组间长休息） */
function getTomatoGroups(total: number): number[] {
  if (total <= 4) return [total];
  const groups: number[] = [];
  let remaining = total;
  while (remaining > 0) {
    groups.push(Math.min(4, remaining));
    remaining -= 4;
  }
  return groups;
}

export function DailyPlanBoard() {
  const {
    plan,
    fetchTodayPlan,
    setBudget,
    addTaskToPlan,
    removeTaskFromPlan,
    moveEntry,
    getHuntingEntries,
    getReadyEntries,
    getKilledEntries,
    getTotalPlanned,
    getTotalCompleted,
    getRemainingEnergy,
    getRemainingTaskDemand,
    getOverloadLevel,
  } = usePlanStore();
  const { tasks, fetchTasks, killTask } = useTaskStore();
  const { startHunt } = useTimerStore();
  const { getActiveTimerMode, fetchAll: fetchInventory } =
    useInventoryStore();
  const [showAdd, setShowAdd] = useState(false);
  const [killedExpanded, setKilledExpanded] = useState(false);
  const [killConfirmId, setKillConfirmId] = useState<number | null>(null);
  const questStep = useOnboardingQuest();

  useEffect(() => {
    fetchTodayPlan();
    fetchTasks();
  }, [fetchTodayPlan, fetchTasks]);

  const readyTasks = useMemo(() => {
    if (!plan) return [];
    return tasks.filter(
      (t) =>
        (t.status === "ready" || t.status === "hunting") &&
        !plan.entries.some((e) => e.task_id === t.id)
    );
  }, [tasks, plan]);

  const handleStartHunt = useCallback(async (taskId: number, name: string) => {
    try {
      await fetchInventory();
      const mode = getActiveTimerMode();
      const db = await getDb();
      const result = await db.execute(
        `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
        [taskId, new Date().toISOString()]
      );
      await startHunt(taskId, name, result.lastInsertId, mode);
      await openHuntWindow();
    } catch (error) {
      console.error("[DailyPlanBoard] handleStartHunt failed:", error);
    }
  }, [fetchInventory, getActiveTimerMode, startHunt]);

  const handleManualKill = useCallback(async (taskId: number) => {
    try {
      await killTask(taskId);
      await syncAfterTaskRelease();
      setKillConfirmId(null);
    } catch (error) {
      console.error("[DailyPlanBoard] handleManualKill failed:", error);
    }
  }, [killTask]);

  if (!plan) return <div className="text-[#666666] text-sm">加载中...</div>;

  const huntingEntries = getHuntingEntries();
  const readyEntries = getReadyEntries();
  const killedEntries = getKilledEntries();
  const totalPlanned = getTotalPlanned();
  const totalCompleted = getTotalCompleted();
  const t3 = getRemainingEnergy();
  const t4 = getRemainingTaskDemand();
  const overloadLevel = getOverloadLevel();
  const allDone = totalPlanned > 0 && totalCompleted >= totalPlanned;
  const budgetExhausted = totalCompleted >= plan.total_budget && !allDone;

  // Get active weapon for time estimates
  const timerMode = useInventoryStore.getState().getActiveTimerMode();
  const focusMinutes = timerMode === "hammer" ? 50 : timerMode === "dagger" ? 15 : 25;
  const remainingMinutes = Math.max(0, t4) * focusMinutes;
  const remainHours = Math.floor(remainingMinutes / 60);
  const remainMins = remainingMinutes % 60;

  return (
    <div className="flex flex-col gap-4">
      {(questStep === 2 || questStep === 3) && (
        <QuestCard step={questStep} />
      )}

      {/* Header with budget */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">{NARRATIVE.planTitle}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#666666]">计划</span>
          <input
            type="number"
            min={1}
            value={plan.total_budget}
            onChange={(e) =>
              setBudget(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="bg-white border border-pixel-black rounded px-2 py-1 w-12 text-center text-xs"
            aria-label="每日番茄计划"
          />
        </div>
      </div>

      {/* Capacity dashboard */}
      <div className="bg-white rounded p-3 pixel-border flex flex-col gap-2">
        {/* Progress bar: completed / budget */}
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold">
            {allDone
              ? "今日讨伐完成！🎉"
              : budgetExhausted
                ? "计划已用完"
                : `已收获 ${totalCompleted} / 计划 ${plan.total_budget} 🍅`}
          </span>
          {!allDone && !budgetExhausted && remainingMinutes > 0 && (
            <span className="text-[#666666]">
              还剩 {remainHours > 0 ? `${remainHours}h` : ""}{remainMins}m
            </span>
          )}
        </div>
        <PixelProgressBar
          current={totalCompleted}
          total={plan.total_budget}
          color={allDone ? "grass" : budgetExhausted ? "orange" : "tomato"}
          className="w-full"
        />

        {/* t3 vs t4 side by side */}
        {!allDone && (
          <div className="flex justify-around items-center gap-4 pt-1">
            <div className="text-center">
              <div className="text-lg font-bold text-grass">{t3}</div>
              <div className="text-[10px] text-[#666666]">剩余精力</div>
            </div>
            <div className="text-xs text-[#666666]">vs</div>
            <div className="text-center">
              <div className={`text-lg font-bold ${overloadLevel !== "none" ? "text-tomato" : "text-pixel-black"}`}>{t4}</div>
              <div className="text-[10px] text-[#666666]">剩余任务量</div>
            </div>
          </div>
        )}

        {/* Overload warning */}
        {overloadLevel === "mild" && (
          <div className="bg-orange/10 border border-orange rounded p-2 text-xs text-orange">
            任务略多，可能需要加班 🍅
          </div>
        )}
        {overloadLevel === "severe" && (
          <div className="bg-tomato/10 border border-tomato rounded p-2 text-xs text-tomato">
            精力不足！建议移除一些任务
          </div>
        )}
      </div>

      {/* ⚔️ 进行中 section */}
      {huntingEntries.length > 0 && (
        <PixelCard variant="sunken" bg="cloud" padding="sm" className="flex flex-col gap-[var(--space-md,8px)]">
          <h3 className="text-xs font-bold text-tomato">⚔️ 进行中</h3>
          {huntingEntries.map((entry, idx) => {
            const task = tasks.find((t) => t.id === entry.task_id);
            return (
              <PlanEntry
                key={entry.id}
                entry={entry}
                task={task}
                index={idx}
                total={huntingEntries.length}
                focusMinutes={focusMinutes}
                onStartHunt={handleStartHunt}
                onRemove={removeTaskFromPlan}
                onMove={moveEntry}
                onKill={setKillConfirmId}
                isActive
              />
            );
          })}
        </PixelCard>
      )}

      {/* 📋 待战 section */}
      {readyEntries.length > 0 && (
        <PixelCard variant="sunken" bg="cloud" padding="sm" className="flex flex-col gap-[var(--space-md,8px)]">
          <h3 className="text-xs font-bold text-[#666666]">📋 待战</h3>
          {readyEntries.map((entry, idx) => {
            const task = tasks.find((t) => t.id === entry.task_id);
            return (
              <PlanEntry
                key={entry.id}
                entry={entry}
                task={task}
                index={idx}
                total={readyEntries.length}
                focusMinutes={focusMinutes}
                onStartHunt={handleStartHunt}
                onRemove={removeTaskFromPlan}
                onMove={moveEntry}
                onKill={setKillConfirmId}
                overloaded={overloadLevel !== "none"}
              />
            );
          })}
        </PixelCard>
      )}

      {/* ✅ 已讨伐 section (collapsible, default collapsed) */}
      {killedEntries.length > 0 && (
        <PixelCard variant="sunken" bg="cloud" padding="sm" className="flex flex-col gap-[var(--space-md,8px)]">
          <button
            onClick={() => setKilledExpanded(!killedExpanded)}
            className="text-xs font-bold text-grass text-left hover:text-grass/80 flex items-center gap-2"
          >
            <span>✅ 已讨伐</span>
            <PixelBadge count={killedEntries.length} variant="success" />
            <span className="ml-auto">{killedExpanded ? "▼" : "▶"}</span>
          </button>
          {killedExpanded && (
            <div className="flex flex-col gap-[var(--space-sm,4px)] slide-down-enter">
              {killedEntries.map((entry) => {
                const task = tasks.find((t) => t.id === entry.task_id);
                return <KilledEntry key={entry.id} entry={entry} task={task} />;
              })}
            </div>
          )}
        </PixelCard>
      )}

      <button
        onClick={() => setShowAdd(!showAdd)}
        className="text-xs text-[#666666] hover:text-orange"
      >
        {NARRATIVE.addToPlan}
      </button>

      {showAdd && (
        <div className="bg-white rounded p-3 pixel-border flex flex-col gap-2">
          {readyTasks.length === 0 ? (
            <p className="text-xs text-[#666666]">{NARRATIVE.noAddable}</p>
          ) : (
            readyTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  addTaskToPlan(
                    t.id,
                    Math.min(
                      t.current_hp,
                      Math.max(1, t3)
                    )
                  );
                  setShowAdd(false);
                }}
                className="text-left text-xs bg-white hover:bg-cloud rounded px-2 py-1 pixel-border"
              >
                {t.monster_name || t.name} ({t.current_hp} HP)
              </button>
            ))
          )}
        </div>
      )}

      {/* Kill confirmation dialog */}
      {killConfirmId !== null && (
        <div className="fixed inset-0 bg-pixel-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 pixel-border max-w-xs flex flex-col gap-3">
            <p className="text-sm font-bold">确认击杀</p>
            <p className="text-xs text-[#666666]">
              确认击杀{" "}
              {tasks.find((t) => t.id === killConfirmId)?.monster_name ||
                tasks.find((t) => t.id === killConfirmId)?.name}
              ？这个任务完成了吗？
            </p>
            <div className="flex gap-2">
              <PixelButton
                variant="cta"
                size="sm"
                onClick={() => handleManualKill(killConfirmId)}
                className="flex-1"
              >
                确认 ⚔️
              </PixelButton>
              <PixelButton
                variant="default"
                size="sm"
                onClick={() => setKillConfirmId(null)}
                className="flex-1"
              >
                取消
              </PixelButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PlanEntry = memo(function PlanEntry({
  entry,
  task,
  index,
  total,
  focusMinutes,
  onStartHunt,
  onRemove,
  onMove,
  onKill,
  isActive,
  overloaded,
}: {
  entry: PlannedTaskEntry;
  task?: Task;
  index: number;
  total: number;
  focusMinutes: number;
  onStartHunt: (taskId: number, name: string) => void;
  onRemove: (entryId: number) => void;
  onMove: (entryId: number, direction: "up" | "down") => void;
  onKill: (taskId: number) => void;
  isActive?: boolean;
  overloaded?: boolean;
}) {
  const groups = getTomatoGroups(entry.planned_pomodoros_today);
  const showGroups = groups.length > 1;
  const entryMinutes = entry.planned_pomodoros_today * focusMinutes;
  const displayName = task?.monster_name || task?.name || "";

  return (
    <div className={`bg-white rounded p-3 pixel-border flex flex-col gap-2 ${isActive ? "pixel-border-pulse" : ""}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="font-bold text-sm text-pixel-black">
            {displayName}
          </div>
          <div className="text-xs text-[#666666]">
            {task?.name} · {entryMinutes}min
          </div>
          {showGroups && (
            <div className="flex gap-1 mt-1 text-xs text-[#666666]">
              {groups.map((g, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-orange mx-0.5">休</span>}
                  <span className="bg-sunny/20 rounded px-1">
                    第{i + 1}组 {g}🍅
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              onClick={() => onMove(entry.id, "up")}
              disabled={index === 0}
              className="text-xs text-[#666666] hover:text-orange disabled:opacity-30"
              aria-label="上移"
            >
              ▲
            </button>
            <button
              onClick={() => onMove(entry.id, "down")}
              disabled={index === total - 1}
              className="text-xs text-[#666666] hover:text-orange disabled:opacity-30"
              aria-label="下移"
            >
              ▼
            </button>
          </div>
          <button
            onClick={() => onStartHunt(entry.task_id, displayName)}
            className="bg-tomato hover:bg-tomato/80 hover:translate-y-[-1px] text-white text-xs px-2 py-1 rounded pixel-border transition-[transform,background-color] duration-[var(--transition-fast,150ms)]"
            aria-label="出击"
          >
            ⚔️
          </button>
          <button
            onClick={() => onKill(entry.task_id)}
            className="text-grass hover:text-grass/80 hover:translate-y-[-1px] text-xs px-1 transition-[transform,color] duration-[var(--transition-fast,150ms)]"
            aria-label="击杀"
            title="标记任务完成"
          >
            🗡️
          </button>
          <button
            onClick={() => onRemove(entry.id)}
            className={`hover:text-tomato hover:translate-y-[-1px] text-xs transition-[transform,color] duration-[var(--transition-fast,150ms)] ${
              overloaded
                ? "text-tomato animate-pulse font-bold"
                : "text-[#666666]"
            }`}
            aria-label="移除"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#666666]">
        <PixelProgressBar
          current={entry.completed_pomodoros_today}
          total={entry.planned_pomodoros_today}
          color="grass"
          className="flex-1"
        />
        <span>
          {entry.completed_pomodoros_today}/
          {entry.planned_pomodoros_today}
        </span>
      </div>
    </div>
  );
});

function KilledEntry({ entry, task }: { entry: PlannedTaskEntry; task?: Task }) {
  const todayActual = entry.completed_pomodoros_today;
  const planned = entry.planned_pomodoros_today;

  let colorClass = "text-pixel-black";
  if (todayActual < planned) colorClass = "text-grass";
  else if (todayActual > planned) colorClass = "text-orange";

  return (
    <div className="bg-white/60 rounded p-2 pixel-border flex justify-between items-center">
      <div>
        <span className="text-xs text-pixel-black/60 line-through">
          {task?.monster_name || task?.name}
        </span>
      </div>
      <span className={`text-xs font-bold ${colorClass}`}>
        {todayActual}/{planned} 🍅
      </span>
    </div>
  );
}
