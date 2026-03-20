import { useEffect, useState } from "react";
import { useTaskStore } from "../../stores/taskStore";
import { useTimerStore } from "../../stores/timerStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { openHuntWindow } from "../../lib/commands";
import { getDb } from "../../lib/db";
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
  const { tasks, fetchTasks } = useTaskStore();
  const [splitTarget, setSplitTarget] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Show top-level tasks (no parent) that are ready/hunting, plus split parents
  const topTasks = tasks.filter(
    (t) =>
      !t.parent_task_id &&
      (t.status === "ready" || t.status === "hunting")
  );

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold">{NARRATIVE.huntListTitle}</h2>
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
            />
          );
        }
        return (
          <HuntItem
            key={task.id}
            task={task}
            onSplit={() => setSplitTarget(task)}
          />
        );
      })}

      {splitTarget && (
        <MonsterSplitForm
          task={splitTarget}
          onClose={() => setSplitTarget(null)}
        />
      )}
    </div>
  );
}

function SplitMonsterCard({
  parent,
  children,
}: {
  parent: Task;
  children: Task[];
}) {
  const [expanded, setExpanded] = useState(false);
  const species = selectSpecies(parent.category, parent.name, parent.difficulty);
  const { attributes } = parseMonsterVariant(parent.monster_variant);
  const spriteData = SPRITE_DATA[species.id];

  return (
    <div className="bg-white text-[#333333] rounded p-3 pixel-border border-l-4 border-l-[#EE4433]">
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
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
        <span className="text-xs text-[#666666]">
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {expanded && (
        <div className="bg-[#DDEEFF] rounded p-3 mt-2 flex flex-col gap-2">
          {/* Parent monster details */}
          {parent.description && (
            <p className="text-xs text-[#333333]/70">{parent.description}</p>
          )}
          {parent.monster_description && (
            <p className="text-xs text-[#333333]/60 italic">
              {parent.monster_description}
            </p>
          )}
          {/* Species info: habitat, food chain, traits */}
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="bg-[#333333]/10 px-1.5 py-0.5 rounded">
              {species.habitat}
            </span>
            <span className="bg-[#333333]/10 px-1.5 py-0.5 rounded">
              {TIER_LABELS[species.tier] || "小型猎物"}
            </span>
            {species.traits.map((t) => (
              <span
                key={t.name}
                className="bg-[#333333]/10 px-1.5 py-0.5 rounded"
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
        </div>
      )}

      <div className="flex flex-col gap-2 mt-2">
        {children.map((child) => (
          <BodyPartItem key={child.id} task={child} species={species} />
        ))}
      </div>
    </div>
  );
}

function BodyPartItem({ task, species }: { task: Task; species: MonsterSpecies }) {
  const { startHunt } = useTimerStore();
  const { getActiveWeaponEffect, fetchAll } = useInventoryStore();
  const isKilled = task.status === "killed";
  // Look up the body part icon from the species definition
  const bodyPartDef = species.bodyParts.find((bp) => bp.key === task.body_part);
  const icon = bodyPartDef?.icon || "⚔️";

  const handleStartHunt = async () => {
    if (isKilled) return;
    await fetchAll();
    const weaponEffect = getActiveWeaponEffect() ?? undefined;
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
      [task.id, new Date().toISOString()]
    );
    await startHunt(task.id, task.name, result.lastInsertId, weaponEffect);
    await openHuntWindow();
  };

  return (
    <div
      className={`flex items-center justify-between rounded px-2 py-1 ${
        isKilled
          ? "bg-[#88DDAA]/30 text-[#5BBF47]"
          : "bg-[#DDEEFF] hover:bg-[#DDEEFF]/80"
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
        <button
          onClick={handleStartHunt}
          className="text-xs bg-[#EE4433] hover:bg-[#EE4433]/80 text-white px-2 py-0.5 rounded pixel-border"
        >
          ⚔️
        </button>
      )}
    </div>
  );
}

function HuntItem({
  task,
  onSplit,
}: {
  task: Task;
  onSplit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { startHunt } = useTimerStore();
  const { getActiveWeaponEffect, fetchAll } = useInventoryStore();
  const hpPct =
    task.total_hp > 0 ? (task.current_hp / task.total_hp) * 100 : 100;
  const { attributes } = parseMonsterVariant(task.monster_variant);
  const species = selectSpecies(task.category, task.name, task.difficulty);
  const canSplit = task.total_hp > 4 && task.current_hp === task.total_hp;
  const spriteData = SPRITE_DATA[species.id];

  const handleStartHunt = async () => {
    if (task.current_hp <= 0) return;
    await fetchAll();
    const weaponEffect = getActiveWeaponEffect() ?? undefined;
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
      [task.id, new Date().toISOString()]
    );
    await startHunt(
      task.id,
      task.monster_name || task.name,
      result.lastInsertId,
      weaponEffect
    );
    await openHuntWindow();
  };

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
      className={`bg-white text-[#333333] rounded p-3 pixel-border flex flex-col gap-2 border-l-4 border-l-[#EE4433] ${fadeClass}`}
    >
      {/* Header - always visible, clickable to toggle */}
      <div
        className="flex justify-between items-start cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
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
        <span className="text-xs text-[#666666] mt-1">
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* HP bar - always visible */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-[#DDEEFF] rounded-full h-2 outline-1 outline-[#333333]">
          <div
            className="bg-[#EE4433] h-2 rounded-full"
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className="text-xs text-[#666666]">
          {task.current_hp}/{task.total_hp} HP
        </span>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="bg-[#DDEEFF] rounded p-3 flex flex-col gap-2">
          {/* Task description */}
          {task.description && (
            <p className="text-xs text-[#333333]/70">{task.description}</p>
          )}

          {/* Monster story */}
          {task.monster_description && (
            <p className="text-xs text-[#333333]/60 italic">
              {task.monster_description}
            </p>
          )}

          {/* Species info: habitat, food chain position, traits */}
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="bg-[#333333]/10 px-1.5 py-0.5 rounded">
              {species.habitat}
            </span>
            <span className="bg-[#333333]/10 px-1.5 py-0.5 rounded">
              {TIER_LABELS[species.tier] || "小型猎物"}
            </span>
            {species.traits.map((t) => (
              <span
                key={t.name}
                className="bg-[#333333]/10 px-1.5 py-0.5 rounded"
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

          {/* Attack button inside expanded panel */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartHunt();
            }}
            className="bg-[#EE4433] hover:bg-[#EE4433]/80 text-white text-xs px-3 py-1.5 rounded pixel-border self-end mt-1"
          >
            ⚔️ 出击
          </button>
        </div>
      )}
    </div>
  );
}
