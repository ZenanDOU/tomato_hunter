import { useState, useMemo } from "react";
import { useTaskStore } from "../../stores/taskStore";
import { selectSpecies } from "../../lib/bestiary";
import type { Task } from "../../types";

interface MonsterSplitFormProps {
  task: Task;
  onClose: () => void;
}

export function MonsterSplitForm({ task, onClose }: MonsterSplitFormProps) {
  const { splitTask } = useTaskStore();

  // Look up the species from the task's category, name, and difficulty
  const species = useMemo(
    () => selectSpecies(task.category, task.name, task.difficulty),
    [task.category, task.name, task.difficulty]
  );
  const bodyParts = species.bodyParts;

  const [parts, setParts] = useState(
    bodyParts.map((bp, idx) => ({
      bodyPart: bp.key,
      name: "",
      description: "",
      pomodoros: idx === 1 ? Math.max(1, task.total_hp - 2) : 1,
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  const totalPomodoros = parts.reduce((s, p) => s + p.pomodoros, 0);
  const isValid =
    totalPomodoros === task.total_hp &&
    parts.every((p) => p.name.trim() && p.pomodoros >= 1);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    await splitTask(task.id, parts);
    onClose();
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white pixel-border rounded-lg p-5 max-w-md w-full flex flex-col gap-4 border-2 border-[#333333] max-h-[90vh] overflow-y-auto">
        <h2 className="pixel-title text-base font-bold text-[#333333] text-center">
          ⚔️ 拆分怪物：{task.monster_name || task.name}
        </h2>
        <p className="text-xs text-[#666666] text-center">
          将 {task.total_hp} 番茄分配给三个部位（总和必须等于 {task.total_hp}）
        </p>

        {bodyParts.map((bp, idx) => (
          <div
            key={bp.key}
            className="bg-[#DDEEFF] rounded p-3 pixel-border flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{bp.icon}</span>
              <span className="font-bold text-sm text-[#333333]">
                {bp.label}
              </span>
              <span className="text-xs text-[#666666]">{bp.hint}</span>
            </div>
            <input
              value={parts[idx].name}
              onChange={(e) => updatePart(idx, "name", e.target.value)}
              placeholder={`${bp.label}的具体任务名称 *`}
              className="bg-white border border-[#333333] rounded px-2 py-1 text-xs text-[#333333] placeholder-[#666666]"
            />
            <input
              value={parts[idx].description}
              onChange={(e) => updatePart(idx, "description", e.target.value)}
              placeholder="描述（选填）"
              className="bg-white border border-[#333333] rounded px-2 py-1 text-xs text-[#333333] placeholder-[#666666]"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#666666]">番茄数</label>
              <input
                type="number"
                min={1}
                value={parts[idx].pomodoros}
                onChange={(e) =>
                  updatePart(idx, "pomodoros", Math.max(1, parseInt(e.target.value) || 1))
                }
                className="bg-white border border-[#333333] rounded px-2 py-1 w-14 text-xs text-center text-[#333333]"
              />
            </div>
          </div>
        ))}

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

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-xs text-[#666666] hover:text-[#333333] py-2"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 bg-[#FF8844] hover:bg-[#FF8844]/80 disabled:bg-[#666666] disabled:text-[#333333] text-white rounded py-2 text-xs font-bold pixel-border"
          >
            {submitting ? "拆分中..." : "确认拆分"}
          </button>
        </div>
      </div>
    </div>
  );
}
