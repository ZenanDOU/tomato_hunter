import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTaskStore } from "../../stores/taskStore";
import { TaskForm } from "./TaskForm";
import type { Task } from "../../types";
import { invoke } from "@tauri-apps/api/core";
import { getDb } from "../../lib/db";
import { NARRATIVE } from "../../lib/narrative";
import {
  generateAttributes,
  serializeMonsterVariant,
  parseMonsterVariant,
} from "../../lib/monsterAttributes";
import { AttributeTag } from "../common/AttributeTag";
import { MonsterDiscoveryCard } from "../common/MonsterDiscoveryCard";
import { PixelButton } from "../common/PixelButton";
import {
  generateRelevantName,
  generateDescription,
  selectSpecies,
  type MonsterSpecies,
} from "../../lib/bestiary";
import { useOnboardingQuest, QuestCard } from "../common/OnboardingOverlay";

interface DiscoveryData {
  taskId: number;
  monsterName: string;
  description: string;
  variantStr: string;
  species: MonsterSpecies;
  attributes: string[];
  task: Task;
}

export function Inbox() {
  const { tasks, fetchTasks } = useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [discovery, setDiscovery] = useState<DiscoveryData | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const questStep = useOnboardingQuest();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const inboxTasks = tasks.filter((t) => t.status === "unidentified");

  const handleConfirmDiscovery = async () => {
    if (!discovery || confirming) return;
    setConfirming(true);
    setDiscoveryError(null);
    try {
      const { identifyTask } = useTaskStore.getState();
      await identifyTask(
        discovery.taskId,
        discovery.monsterName,
        discovery.description,
        discovery.variantStr,
        discovery.species.id
      );
      setDiscovery(null);
    } catch (error) {
      console.error("[Inbox] confirmDiscovery failed:", error);
      const msg = error instanceof Error ? error.message : String(error);
      setDiscoveryError(`加入讨伐清单失败: ${msg}`);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {(questStep === 0 || questStep === 1) && (
        <QuestCard step={questStep} />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">{NARRATIVE.inboxTitle}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange hover:bg-orange/80 text-white text-sm px-3 py-1 rounded"
        >
          + 新任务
        </button>
      </div>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      {inboxTasks.length === 0 && !showForm && questStep !== 0 && (
        <p className="text-[#666666] text-sm">{NARRATIVE.inboxEmpty}</p>
      )}

      {inboxTasks.map((task) => (
        <InboxItem key={task.id} task={task} onDiscover={setDiscovery} />
      ))}

      {discovery && (
        <>
          <MonsterDiscoveryCard
            species={discovery.species}
            monsterName={discovery.monsterName}
            description={discovery.description}
            difficulty={discovery.task.difficulty}
            hp={discovery.task.estimated_pomodoros}
            attributes={discovery.attributes}
            category={discovery.task.category}
            confirming={confirming}
            onConfirm={handleConfirmDiscovery}
          />
          {discoveryError && createPortal(
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-tomato text-white text-sm px-4 py-2 rounded pixel-border z-[60]">
              {discoveryError}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

function InboxItem({
  task,
  onDiscover,
}: {
  task: Task;
  onDiscover: (data: DiscoveryData) => void;
}) {
  const [identifying, setIdentifying] = useState(false);

  const handleIdentify = async () => {
    if (identifying) return;
    setIdentifying(true);

    const attrs = generateAttributes(task.category, task.difficulty, task.name);
    const variantStr = serializeMonsterVariant("normal", attrs);
    const species = selectSpecies(task.category, task.name, task.difficulty);

    let monsterName: string;
    let description: string;

    try {
      const db = await getDb();
      const settings = await db.select<{ value: string }[]>(
        "SELECT value FROM settings WHERE key = 'ai_api_key'"
      );
      const apiKey = settings[0]?.value || "";

      const monster = await invoke<{
        name: string;
        description: string;
        variant: string;
      }>("generate_monster", {
        params: {
          category: task.category,
          taskName: task.name,
          taskDescription: task.description,
          apiKey,
        },
      });
      monsterName = monster.name;
      description = monster.description;
    } catch {
      // Offline fallback using bestiary
      const result = generateRelevantName(task.name, task.category, task.difficulty);
      monsterName = result.name;
      description = generateDescription(result.species, task.name);
    }

    onDiscover({
      taskId: task.id,
      monsterName,
      description,
      variantStr,
      species,
      attributes: attrs,
      task,
    });
    setIdentifying(false);
  };

  const { attributes } = parseMonsterVariant(task.monster_variant);

  return (
    <div className="bg-white p-3 outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] flex justify-between items-center">
      <div>
        <div className="font-bold text-sm text-pixel-black">{task.name}</div>
        <div className="text-xs text-[#666666]">
          {task.category} · {task.estimated_pomodoros} 番茄
        </div>
        {attributes.length > 0 && (
          <div className="flex gap-1 mt-1">
            {attributes.map((a) => (
              <AttributeTag key={a} attribute={a} category={task.category} />
            ))}
          </div>
        )}
      </div>
      <PixelButton
        variant="default"
        size="sm"
        onClick={handleIdentify}
        disabled={identifying}
      >
        {identifying ? "侦查中..." : NARRATIVE.identify}
      </PixelButton>
    </div>
  );
}
