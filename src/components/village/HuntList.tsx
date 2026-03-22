import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTaskStore } from "../../stores/taskStore";
import { useTimerStore } from "../../stores/timerStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { usePlanStore } from "../../stores/planStore";
import { openHuntWindow } from "../../lib/commands";
import { getDb } from "../../lib/db";
import { syncAfterTaskRelease } from "../../lib/storeSync";
import type { Task } from "../../types";
import { NARRATIVE } from "../../lib/narrative";
import { parseMonsterVariant } from "../../lib/monsterAttributes";
import { AttributeTag } from "../common/AttributeTag";
import { MonsterSplitForm } from "../common/MonsterSplitForm";
import { selectSpecies, type MonsterSpecies } from "../../lib/bestiary";
import { PixelSprite } from "../common/PixelSprite";
import { SPRITE_DATA } from "../../lib/spriteData";

const TIER_LABELS: Record<string, string> = {
  prey: "小型猎物",
  predator: "中型捕食者",
  apex: "顶级掠食者",
};

export function HuntList() {
  const { tasks, fetchTasks, releaseTask, batchReleaseTasks } = useTaskStore();
  const { fetchTodayPlan } = usePlanStore();
  const [splitTarget, setSplitTarget] = useState<Task | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmRelease, setConfirmRelease] = useState<{ id: number; name: string } | null>(null);
  const [confirmBatch, setConfirmBatch] = useState(false);

  const onRelease = useCallback((id: number, name: string) => {
    setConfirmRelease({ id, name });
  }, []);

  const onSplit = useCallback((task: Task) => {
    setSplitTarget(task);
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchTodayPlan();
  }, [fetchTasks, fetchTodayPlan]);

  // Show top-level tasks (no parent) that are ready/hunting, plus split parents
  const topTasks = useMemo(() => tasks.filter(
    (t) =>
      !t.parent_task_id &&
      (t.status === "ready" || t.status === "hunting")
  ), [tasks]);

  const selectableTasks = useMemo(() =>
    topTasks.filter((t) => t.status !== "hunting"),
    [topTasks]
  );

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === selectableTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableTasks.map((t) => t.id)));
    }
  }, [selectableTasks, selectedIds.size]);

  const handleBatchRelease = async () => {
    if (selectedIds.size === 0) return;
    try {
      await batchReleaseTasks(Array.from(selectedIds));
      await syncAfterTaskRelease();
    } catch (error) {
      console.error("[HuntList] batch release failed:", error);
    }
    setSelectedIds(new Set());
    setBatchMode(false);
    setConfirmBatch(false);
  };

  const handleSingleRelease = async (id: number) => {
    try {
      await releaseTask(id);
      await syncAfterTaskRelease();
    } catch (error) {
      console.error("[HuntList] release failed:", error);
    }
    setConfirmRelease(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">{NARRATIVE.huntListTitle}</h2>
        {topTasks.length > 0 && !batchMode && (
          <button
            onClick={() => setBatchMode(true)}
            className="text-xs text-[#666666] hover:text-pixel-black px-2 py-1 rounded pixel-border bg-cloud"
          >
            清理
          </button>
        )}
      </div>

      {batchMode && (
        <div className="flex items-center justify-between bg-cream rounded p-2 pixel-border text-xs">
          <span className="text-pixel-black">
            {selectedIds.size > 0
              ? `已选择 ${selectedIds.size} 只`
              : "选择要释放的怪物"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2 py-0.5 rounded pixel-border bg-cloud hover:bg-white"
            >
              {selectedIds.size === selectableTasks.length ? "取消全选" : "全选"}
            </button>
            <button
              onClick={() => selectedIds.size > 0 && setConfirmBatch(true)}
              disabled={selectedIds.size === 0}
              className="px-2 py-0.5 rounded pixel-border bg-tomato text-white hover:bg-tomato/80 disabled:bg-[#CCCCCC] disabled:text-[#999999]"
            >
              确认释放
            </button>
            <button
              onClick={() => { setBatchMode(false); setSelectedIds(new Set()); }}
              className="px-2 py-0.5 rounded pixel-border bg-cloud hover:bg-white"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {topTasks.length === 0 && (
        <p className="text-[#666666] text-sm">
          {NARRATIVE.huntListEmpty}
        </p>
      )}
      {topTasks.map((task) => {
        const children = tasks.filter((t) => t.parent_task_id === task.id);
        if (children.length > 0) {
          return (
            <SplitMonsterCard
              key={task.id}
              parent={task}
              children={children}
              batchMode={batchMode}
              selected={selectedIds.has(task.id)}
              onToggleSelect={() => toggleSelect(task.id)}
              onRelease={onRelease}
            />
          );
        }
        return (
          <HuntItem
            key={task.id}
            task={task}
            onSplit={() => onSplit(task)}
            batchMode={batchMode}
            selected={selectedIds.has(task.id)}
            onToggleSelect={() => toggleSelect(task.id)}
            onRelease={onRelease}
          />
        );
      })}

      {splitTarget && (
        <MonsterSplitForm
          task={splitTarget}
          onClose={() => setSplitTarget(null)}
        />
      )}

      {/* Single release confirmation */}
      {confirmRelease && (
        <ReleaseConfirmDialog
          message={`确定要释放 ${confirmRelease.name} 吗？释放后无法撤销。`}
          onConfirm={() => handleSingleRelease(confirmRelease.id)}
          onCancel={() => setConfirmRelease(null)}
        />
      )}

      {/* Batch release confirmation */}
      {confirmBatch && (
        <ReleaseConfirmDialog
          message={`确定要释放 ${selectedIds.size} 只怪物吗？`}
          onConfirm={handleBatchRelease}
          onCancel={() => setConfirmBatch(false)}
        />
      )}
    </div>
  );
}

const SplitMonsterCard = memo(function SplitMonsterCard({
  parent,
  children,
  batchMode,
  selected,
  onToggleSelect,
  onRelease,
}: {
  parent: Task;
  children: Task[];
  batchMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onRelease?: (id: number, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const species = useMemo(
    () => selectSpecies(parent.category, parent.name, parent.difficulty),
    [parent.category, parent.name, parent.difficulty]
  );
  const { attributes } = useMemo(
    () => parseMonsterVariant(parent.monster_variant),
    [parent.monster_variant]
  );
  const spriteData = SPRITE_DATA[species.id];

  const hasHuntingChild = children.some((c) => c.status === "hunting");
  const canRelease = parent.status !== "hunting" && !hasHuntingChild;

  return (
    <div className="bg-white text-pixel-black rounded p-3 pixel-border border-l-4 border-l-tomato">
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => batchMode ? (canRelease && onToggleSelect?.()) : setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${parent.monster_name || parent.name} 详情`}
      >
        {batchMode && canRelease && (
          <input
            type="checkbox"
            checked={selected || false}
            onChange={() => onToggleSelect?.()}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 accent-tomato"
          />
        )}
        {spriteData ? (
          <PixelSprite sprite={spriteData} scale={2} />
        ) : (
          <span className="monster-sprite-sm">{species.emoji}</span>
        )}
        <div className="flex-1">
          <div className="font-bold text-sm">
            {parent.monster_name || parent.name}
          </div>
          <div className="text-xs text-[#666666]">{parent.name}</div>
        </div>
        {!batchMode && (
          <span className="text-xs text-[#666666]">
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </div>

      {expanded && !batchMode && (
        <div className="bg-cloud rounded p-3 mt-2 flex flex-col gap-2">
          {/* Parent monster details */}
          {parent.description && (
            <p className="text-xs text-pixel-black/70">{parent.description}</p>
          )}
          {parent.monster_description && (
            <p className="text-xs text-pixel-black/60 italic">
              {parent.monster_description}
            </p>
          )}
          {/* Species info: habitat, food chain, traits */}
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="bg-pixel-black/10 px-1.5 py-0.5 rounded">
              {species.habitat}
            </span>
            <span className="bg-pixel-black/10 px-1.5 py-0.5 rounded">
              {TIER_LABELS[species.tier] || "小型猎物"}
            </span>
            {species.traits.map((t) => (
              <span
                key={t.name}
                className="bg-pixel-black/10 px-1.5 py-0.5 rounded"
                title={t.desc}
              >
                {t.icon} {t.name}
              </span>
            ))}
            {attributes.length > 0 &&
              attributes.map((a) => (
                <AttributeTag
                  key={a}
                  attribute={a}
                  category={parent.category}
                />
              ))}
          </div>

          {/* Release whole monster button */}
          {canRelease && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRelease?.(parent.id, parent.monster_name || parent.name);
              }}
              className="text-xs text-[#666666] hover:text-pixel-black px-2 py-1 rounded pixel-border bg-white self-start mt-1"
            >
              释放整只怪物
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-2">
        {children
          .filter((c) => c.status !== "abandoned")
          .map((child) => (
            <BodyPartItem
              key={child.id}
              task={child}
              species={species}
              onRelease={onRelease}
            />
          ))}
      </div>
    </div>
  );
});

const BodyPartItem = memo(function BodyPartItem({
  task,
  species,
  onRelease,
}: {
  task: Task;
  species: MonsterSpecies;
  onRelease?: (id: number, name: string) => void;
}) {
  const { startHunt } = useTimerStore();
  const { getActiveTimerMode, fetchAll } = useInventoryStore();
  const { addTaskToPlan, plan } = usePlanStore();
  const isKilled = task.status === "killed";
  // Look up the body part icon from the species definition
  const bodyPartDef = species.bodyParts.find((bp) => bp.key === task.body_part);
  const icon = bodyPartDef?.icon || "⚔️";

  const handleStartHunt = useCallback(async () => {
    if (isKilled) return;
    await fetchAll();
    // Auto-add to today's plan if not already there
    if (plan && !plan.entries.some((e) => e.task_id === task.id)) {
      await addTaskToPlan(task.id, 1);
    }
    const timerMode = getActiveTimerMode();
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
      [task.id, new Date().toISOString()]
    );
    await startHunt(task.id, task.name, result.lastInsertId, timerMode);
    await openHuntWindow();
  }, [isKilled, fetchAll, plan, task.id, task.name, addTaskToPlan, getActiveTimerMode, startHunt]);

  return (
    <div
      className={`flex items-center justify-between rounded px-2 py-1 ${
        isKilled
          ? "bg-mint/30 text-grass"
          : "bg-cloud hover:bg-cloud/80"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-xs">
          {isKilled ? "✓ " : ""}
          {task.name}
        </span>
        <span className="text-xs text-[#666666]">
          {task.current_hp}/{task.total_hp}
        </span>
      </div>
      {!isKilled && (
        <div className="flex items-center gap-1">
          {task.status !== "hunting" && (
            <button
              onClick={() => onRelease?.(task.id, task.name)}
              className="text-xs text-[#999999] hover:text-[#666666] px-1 py-0.5"
              aria-label="释放"
              title="释放"
            >
              释放
            </button>
          )}
          <button
            onClick={handleStartHunt}
            className="text-xs bg-tomato hover:bg-tomato/80 text-white px-2 py-0.5 rounded pixel-border"
            aria-label="出击"
          >
            出击
          </button>
        </div>
      )}
    </div>
  );
});

function ReleaseConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cream rounded p-4 pixel-border max-w-xs mx-4 flex flex-col gap-3">
        <p className="text-sm text-pixel-black">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1 rounded pixel-border bg-cloud hover:bg-white"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="text-xs px-3 py-1 rounded pixel-border bg-tomato text-white hover:bg-tomato/80"
          >
            确认释放
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const HuntItem = memo(function HuntItem({
  task,
  onSplit,
  batchMode,
  selected,
  onToggleSelect,
  onRelease,
}: {
  task: Task;
  onSplit: () => void;
  batchMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onRelease?: (id: number, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { startHunt } = useTimerStore();
  const { getActiveTimerMode, fetchAll } = useInventoryStore();
  const { addTaskToPlan, plan } = usePlanStore();
  const hpPct =
    task.total_hp > 0 ? (task.current_hp / task.total_hp) * 100 : 100;
  const { attributes } = useMemo(
    () => parseMonsterVariant(task.monster_variant),
    [task.monster_variant]
  );
  const species = useMemo(
    () => selectSpecies(task.category, task.name, task.difficulty),
    [task.category, task.name, task.difficulty]
  );
  const canSplit = task.total_hp > 4 && task.current_hp === task.total_hp;
  const spriteData = SPRITE_DATA[species.id];

  const handleStartHunt = useCallback(async () => {
    if (task.current_hp <= 0) return;
    await fetchAll();
    // Auto-add to today's plan if not already there
    if (plan && !plan.entries.some((e) => e.task_id === task.id)) {
      await addTaskToPlan(task.id, task.current_hp);
    }
    const timerMode = getActiveTimerMode();
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
      [task.id, new Date().toISOString()]
    );
    await startHunt(
      task.id,
      task.monster_name || task.name,
      result.lastInsertId,
      timerMode
    );
    await openHuntWindow();
  }, [task.current_hp, task.id, task.name, task.monster_name, fetchAll, plan, addTaskToPlan, getActiveTimerMode, startHunt]);

  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(task.created_at).getTime()) / 86400000
  );
  const fadeClass =
    daysSinceCreation > 7
      ? "captive-fade-3"
      : daysSinceCreation > 3
        ? "captive-fade-2"
        : daysSinceCreation > 1
          ? "captive-fade-1"
          : "";

  return (
    <div
      className={`bg-white text-pixel-black rounded p-3 pixel-border flex flex-col gap-2 border-l-4 border-l-tomato ${fadeClass}`}
    >
      {/* Header - always visible, clickable to toggle */}
      <div
        className="flex justify-between items-start cursor-pointer select-none"
        onClick={() => batchMode ? (task.status !== "hunting" && onToggleSelect?.()) : setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${task.monster_name || task.name} 详情`}
      >
        <div className="flex items-center gap-2">
          {batchMode && task.status !== "hunting" && (
            <input
              type="checkbox"
              checked={selected || false}
              onChange={() => onToggleSelect?.()}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 accent-tomato"
            />
          )}
          {spriteData ? (
            <PixelSprite sprite={spriteData} scale={2} />
          ) : (
            <span className="monster-sprite-sm">{species.emoji}</span>
          )}
          <div>
            <div className="font-bold text-sm">
              {task.monster_name || task.name}
            </div>
            <div className="text-xs text-[#666666]">{task.name}</div>
          </div>
        </div>
        {!batchMode && (
          <span className="text-xs text-[#666666] mt-1">
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </div>

      {/* HP bar - always visible */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-cloud rounded-full h-2 outline-1 outline-pixel-black">
          <div
            className="bg-tomato h-2 rounded-full"
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className="text-xs text-[#666666]">
          {task.current_hp}/{task.total_hp} HP
        </span>
      </div>

      {/* Expanded detail panel */}
      {expanded && !batchMode && (
        <div className="bg-cloud rounded p-3 flex flex-col gap-2">
          {/* Task description */}
          {task.description && (
            <p className="text-xs text-pixel-black/70">{task.description}</p>
          )}

          {/* Monster story */}
          {task.monster_description && (
            <p className="text-xs text-pixel-black/60 italic">
              {task.monster_description}
            </p>
          )}

          {/* Species info: habitat, food chain position, traits */}
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="bg-pixel-black/10 px-1.5 py-0.5 rounded">
              {species.habitat}
            </span>
            <span className="bg-pixel-black/10 px-1.5 py-0.5 rounded">
              {TIER_LABELS[species.tier] || "小型猎物"}
            </span>
            {species.traits.map((t) => (
              <span
                key={t.name}
                className="bg-pixel-black/10 px-1.5 py-0.5 rounded"
                title={t.desc}
              >
                {t.icon} {t.name}
              </span>
            ))}
            {attributes.length > 0 &&
              attributes.map((a) => (
                <AttributeTag
                  key={a}
                  attribute={a}
                  category={task.category}
                />
              ))}
          </div>

          {/* Split button (if splittable): body part preview + split action */}
          {canSplit && (
            <div className="flex flex-col gap-1 mt-1">
              <div className="text-xs text-[#666666] flex gap-2">
                {species.bodyParts.map((bp) => (
                  <span key={bp.key}>
                    {bp.icon} {bp.label}
                  </span>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSplit();
                }}
                className="text-xs bg-[#666666] hover:bg-[#666666]/80 text-white px-2 py-1 rounded pixel-border self-start"
              >
                拆分怪物
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-1">
            {task.status !== "hunting" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRelease?.(task.id, task.monster_name || task.name);
                }}
                className="text-xs text-[#666666] hover:text-pixel-black px-2 py-1 rounded pixel-border bg-white"
              >
                释放
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartHunt();
              }}
              className="bg-tomato hover:bg-tomato/80 text-white text-xs px-3 py-1.5 rounded pixel-border ml-auto"
            >
              出击
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
