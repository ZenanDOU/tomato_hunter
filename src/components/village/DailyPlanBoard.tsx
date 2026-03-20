import { useEffect, useState } from "react";
import { usePlanStore } from "../../stores/planStore";
import { useTaskStore } from "../../stores/taskStore";
import { useTimerStore } from "../../stores/timerStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { openHuntWindow } from "../../lib/commands";
import { getDb } from "../../lib/db";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { NARRATIVE } from "../../lib/narrative";
import type { PlannedTaskEntry } from "../../types";

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
  } = usePlanStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { startHunt } = useTimerStore();
  const { getActiveWeaponEffect, fetchAll: fetchInventory } =
    useInventoryStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchTodayPlan();
    fetchTasks();
  }, [fetchTodayPlan, fetchTasks]);

  if (!plan) return <div className="text-[#666666] text-sm">加载中...</div>;

  const allocated = plan.entries.reduce(
    (sum, e) => sum + e.planned_pomodoros_today,
    0
  );
  const readyTasks = tasks.filter(
    (t) =>
      (t.status === "ready" || t.status === "hunting") &&
      !plan.entries.some((e) => e.task_id === t.id)
  );

  // Get active weapon for time estimates
  const weaponEffect = useInventoryStore.getState().getActiveWeaponEffect();
  const focusMinutes = weaponEffect?.focus_minutes ?? 25;
  const totalMinutes = allocated * focusMinutes;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMinutes = totalMinutes % 60;

  const handleStartHunt = async (taskId: number, name: string) => {
    await fetchInventory();
    const we = getActiveWeaponEffect() ?? undefined;
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
      [taskId, new Date().toISOString()]
    );
    await startHunt(taskId, name, result.lastInsertId, we);
    await openHuntWindow();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">{NARRATIVE.planTitle}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={
              allocated > plan.total_budget
                ? "text-[#EE4433]"
                : "text-[#666666]"
            }
          >
            {allocated}/{plan.total_budget} 番茄
          </span>
          <span className="text-xs text-[#666666]">
            {totalHours > 0 ? `${totalHours}h${remainMinutes}m` : `${remainMinutes}m`}
          </span>
          <input
            type="number"
            min={1}
            value={plan.total_budget}
            onChange={(e) =>
              setBudget(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="bg-white border border-[#333333] rounded px-2 py-1 w-12 text-center text-xs"
          />
        </div>
      </div>

      {allocated > plan.total_budget && (
        <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-red-600">
          {NARRATIVE.overBudget}
        </div>
      )}

      {plan.entries.map((entry, idx) => (
        <PlanEntry
          key={entry.id}
          entry={entry}
          index={idx}
          total={plan.entries.length}
          focusMinutes={focusMinutes}
          onStartHunt={handleStartHunt}
          onRemove={removeTaskFromPlan}
          onMove={moveEntry}
        />
      ))}

      <button
        onClick={() => setShowAdd(!showAdd)}
        className="text-xs text-[#666666] hover:text-[#FF8844]"
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
                      Math.max(1, plan.total_budget - allocated)
                    )
                  );
                  setShowAdd(false);
                }}
                className="text-left text-xs bg-white hover:bg-[#DDEEFF] rounded px-2 py-1 pixel-border"
              >
                {t.monster_name || t.name} ({t.current_hp} HP)
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PlanEntry({
  entry,
  index,
  total,
  focusMinutes,
  onStartHunt,
  onRemove,
  onMove,
}: {
  entry: PlannedTaskEntry;
  index: number;
  total: number;
  focusMinutes: number;
  onStartHunt: (taskId: number, name: string) => void;
  onRemove: (entryId: number) => void;
  onMove: (entryId: number, direction: "up" | "down") => void;
}) {
  const groups = getTomatoGroups(entry.planned_pomodoros_today);
  const showGroups = groups.length > 1;
  const entryMinutes = entry.planned_pomodoros_today * focusMinutes;

  return (
    <div className="bg-white rounded p-3 pixel-border flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="font-bold text-sm text-[#333333]">
            {entry.monster_name || entry.name}
          </div>
          <div className="text-xs text-[#666666]">
            {entry.name} · {entryMinutes}min
          </div>
          {showGroups && (
            <div className="flex gap-1 mt-1 text-xs text-[#666666]">
              {groups.map((g, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-[#FF8844] mx-0.5">休</span>}
                  <span className="bg-amber-100 rounded px-1">
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
              className="text-xs text-[#666666] hover:text-[#FF8844] disabled:opacity-30"
            >
              ▲
            </button>
            <button
              onClick={() => onMove(entry.id, "down")}
              disabled={index === total - 1}
              className="text-xs text-[#666666] hover:text-[#FF8844] disabled:opacity-30"
            >
              ▼
            </button>
          </div>
          <button
            onClick={() =>
              onStartHunt(
                entry.task_id,
                entry.monster_name || entry.name || ""
              )
            }
            className="bg-[#EE4433] hover:bg-[#EE4433]/80 text-white text-xs px-2 py-1 rounded pixel-border"
          >
            ⚔️
          </button>
          <button
            onClick={() => onRemove(entry.id)}
            className="text-[#666666] hover:text-[#EE4433] text-xs"
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
}
