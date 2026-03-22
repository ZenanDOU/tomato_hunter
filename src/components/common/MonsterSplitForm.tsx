import { useState, useMemo, useCallback } from "react";
import { useTaskStore } from "../../stores/taskStore";
import { selectSpecies } from "../../lib/bestiary";
import type { Task, TaskDifficulty } from "../../types";

const GENERIC_ICONS = ["⚔️", "🛡️", "🗡️", "🏹", "🔮", "💎", "🔥", "⚡"];

function getDefaultPartCount(difficulty: TaskDifficulty, totalHp: number): number {
  const map: Record<TaskDifficulty, number> = {
    simple: 2,
    medium: 2,
    hard: 3,
    epic: 4,
    legendary: 5,
  };
  return Math.min(map[difficulty] ?? 3, totalHp);
}

function getGenericPart(index: number) {
  return {
    key: `extra-${index - 2}`,
    icon: GENERIC_ICONS[(index - 3) % GENERIC_ICONS.length],
    label: `部位 ${index + 1}`,
    hint: "额外分解",
  };
}

function distributePomodoros(totalHp: number, count: number): number[] {
  const base = Math.floor(totalHp / count);
  const remainder = totalHp % count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

function getPartMeta(index: number, speciesBodyParts: { key: string; icon: string; label: string; hint: string }[]) {
  return index < speciesBodyParts.length ? speciesBodyParts[index] : getGenericPart(index);
}

interface MonsterSplitFormProps {
  task: Task;
  onClose: () => void;
}

export function MonsterSplitForm({ task, onClose }: MonsterSplitFormProps) {
  const { splitTask } = useTaskStore();

  const species = useMemo(
    () => selectSpecies(task.category, task.name, task.difficulty),
    [task.category, task.name, task.difficulty]
  );

  const defaultCount = useMemo(
    () => getDefaultPartCount(task.difficulty, task.total_hp),
    [task.difficulty, task.total_hp]
  );

  const [parts, setParts] = useState(() => {
    const pomodoros = distributePomodoros(task.total_hp, defaultCount);
    return Array.from({ length: defaultCount }, (_, i) => ({
      bodyPart: getPartMeta(i, species.bodyParts).key,
      name: "",
      description: "",
      pomodoros: pomodoros[i],
    }));
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPomodoros = parts.reduce((s, p) => s + p.pomodoros, 0);
  const isValid =
    totalPomodoros === task.total_hp &&
    parts.every((p) => p.name.trim() && p.pomodoros >= 1);

  const canAdd = parts.length < task.total_hp;
  const canRemove = parts.length > 2;

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    const newCount = parts.length + 1;
    const pomodoros = distributePomodoros(task.total_hp, newCount);
    const meta = getPartMeta(newCount - 1, species.bodyParts);
    setParts((prev) => [
      ...prev.map((p, i) => ({ ...p, pomodoros: pomodoros[i] })),
      { bodyPart: meta.key, name: "", description: "", pomodoros: pomodoros[newCount - 1] },
    ]);
  }, [canAdd, parts.length, task.total_hp, species.bodyParts]);

  const handleRemove = useCallback(() => {
    if (!canRemove) return;
    const newCount = parts.length - 1;
    const pomodoros = distributePomodoros(task.total_hp, newCount);
    setParts((prev) => prev.slice(0, newCount).map((p, i) => ({ ...p, pomodoros: pomodoros[i] })));
  }, [canRemove, parts.length, task.total_hp]);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await splitTask(task.id, parts);
      onClose();
    } catch (e) {
      console.error("[MonsterSplitForm] split failed:", e);
      setError("拆分失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const updatePart = (
    idx: number,
    field: "name" | "description" | "pomodoros",
    value: string | number
  ) => {
    setParts((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="拆分怪物">
      <div className="bg-white pixel-border rounded-lg p-5 max-w-md w-full flex flex-col gap-4 border-2 border-pixel-black max-h-[90vh] overflow-y-auto">
        <h2 className="pixel-title text-base font-bold text-pixel-black text-center">
          ⚔️ 拆分怪物：{task.monster_name || task.name}
        </h2>
        <p className="text-xs text-[#666666] text-center">
          将 {task.total_hp} 番茄分配给 {parts.length} 个部位（总和必须等于 {task.total_hp}）
        </p>

        {parts.map((part, idx) => {
          const meta = getPartMeta(idx, species.bodyParts);
          return (
            <div
              key={part.bodyPart}
              className="bg-cloud rounded p-3 pixel-border flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{meta.icon}</span>
                <span className="font-bold text-sm text-pixel-black">
                  {meta.label}
                </span>
                <span className="text-xs text-[#666666]">{meta.hint}</span>
              </div>
              <input
                value={part.name}
                onChange={(e) => updatePart(idx, "name", e.target.value)}
                placeholder={`${meta.label}的具体任务名称 *`}
                className="bg-white border border-pixel-black rounded px-2 py-1 text-xs text-pixel-black placeholder-[#666666]"
                aria-label={`${meta.label}任务名称`}
              />
              <input
                value={part.description}
                onChange={(e) => updatePart(idx, "description", e.target.value)}
                placeholder="描述（选填）"
                className="bg-white border border-pixel-black rounded px-2 py-1 text-xs text-pixel-black placeholder-[#666666]"
                aria-label={`${meta.label}描述`}
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#666666]">番茄数</label>
                <input
                  type="number"
                  min={1}
                  value={part.pomodoros}
                  onChange={(e) =>
                    updatePart(idx, "pomodoros", Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="bg-white border border-pixel-black rounded px-2 py-1 w-14 text-xs text-center text-pixel-black"
                  aria-label={`${meta.label}番茄数`}
                />
              </div>
            </div>
          );
        })}

        <div className="flex justify-center gap-3">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="text-xs px-3 py-1 rounded pixel-border bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-pixel-black"
          >
            + 添加部位
          </button>
          <button
            onClick={handleRemove}
            disabled={!canRemove}
            className="text-xs px-3 py-1 rounded pixel-border bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-pixel-black"
          >
            - 移除部位
          </button>
        </div>

        <div
          className={`text-xs text-center ${
            totalPomodoros === task.total_hp
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          已分配 {totalPomodoros}/{task.total_hp} 番茄
          {totalPomodoros !== task.total_hp && "（需要调整）"}
        </div>

        {error && (
          <div className="text-xs text-red-500 text-center">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-xs text-[#666666] hover:text-pixel-black py-2"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 bg-orange hover:bg-orange/80 disabled:bg-[#666666] disabled:text-pixel-black text-white rounded py-2 text-xs font-bold pixel-border"
          >
            {submitting ? "拆分中..." : "确认拆分"}
          </button>
        </div>
      </div>
    </div>
  );
}
