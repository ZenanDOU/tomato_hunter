import { useState } from "react";
import { useTaskStore } from "../../stores/taskStore";
import type { TaskCategory, TaskDifficulty, TaskFormData } from "../../types";

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "work", label: "工作" },
  { value: "study", label: "学习" },
  { value: "creative", label: "创作" },
  { value: "life", label: "生活" },
  { value: "other", label: "其他" },
];

const DIFFICULTIES: {
  value: TaskDifficulty;
  label: string;
  range: string;
  icon: string;
  defaultPomodoros: number;
}[] = [
  { value: "simple", label: "简单", range: "1-2 番茄", icon: "🦎", defaultPomodoros: 1 },
  { value: "medium", label: "中等", range: "3-5 番茄", icon: "🐺", defaultPomodoros: 3 },
  { value: "hard", label: "困难", range: "6-10 番茄", icon: "🐻", defaultPomodoros: 6 },
  { value: "epic", label: "史诗", range: "11-20 番茄", icon: "🐉", defaultPomodoros: 11 },
  { value: "legendary", label: "传说", range: ">20 番茄", icon: "👹", defaultPomodoros: 21 },
];

export function TaskForm({ onClose }: { onClose: () => void }) {
  const { createTask } = useTaskStore();
  const [form, setForm] = useState<TaskFormData>({
    name: "",
    description: "",
    category: "work",
    difficulty: "simple",
    estimated_pomodoros: 1,
    repeat_config: "none",
  });

  const showSplitWarning = form.estimated_pomodoros > 5;

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await createTask(form);
    onClose();
  };

  return (
    <div className="bg-white rounded p-4 pixel-border flex flex-col gap-3">
      <h3 className="font-bold text-sm text-[#333333]">📝 发现新怪物</h3>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="任务名称 *"
        className="bg-white border border-[#333333] rounded px-3 py-2 text-sm text-[#333333] placeholder-[#666666]"
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="任务描述（选填）"
        className="bg-white border border-[#333333] rounded px-3 py-2 text-sm text-[#333333] placeholder-[#666666] resize-none h-16"
      />

      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setForm({ ...form, category: c.value })}
            className={`text-xs px-2 py-1 rounded ${
              form.category === c.value
                ? "bg-[#FF8844] text-white"
                : "bg-white text-[#333333] hover:bg-[#DDEEFF]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            onClick={() => setForm({ ...form, difficulty: d.value, estimated_pomodoros: d.defaultPomodoros })}
            className={`text-left text-xs px-2 py-1 rounded flex justify-between ${
              form.difficulty === d.value
                ? "bg-[#FF8844]/20 text-[#FF8844]"
                : "bg-white text-[#333333] hover:bg-[#DDEEFF]"
            }`}
          >
            <span>
              {d.icon} {d.label}（{d.range}）
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[#666666]">预估番茄数</label>
        <input
          type="number"
          min={1}
          value={form.estimated_pomodoros}
          onChange={(e) =>
            setForm({
              ...form,
              estimated_pomodoros: Math.max(1, parseInt(e.target.value) || 1),
            })
          }
          className="bg-white border border-[#333333] rounded px-2 py-1 w-16 text-sm text-center text-[#333333]"
        />
      </div>

      {showSplitWarning && (
        <div className="bg-amber-100 border border-amber-400 rounded p-2 text-xs text-amber-700">
          ⚠️ 这个怪物太强大了！建议拆分成小任务以便逐个击破
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onClose}
          className="text-xs text-[#666666] hover:text-[#333333] px-3 py-1"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          className="text-xs bg-[#FF8844] hover:bg-[#FF8844]/80 disabled:bg-[#666666] disabled:text-[#333333] text-white px-3 py-1 rounded pixel-border"
        >
          生成怪物
        </button>
      </div>
    </div>
  );
}
