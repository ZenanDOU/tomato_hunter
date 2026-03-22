import { useEffect, useState } from "react";
import type { Task, Pomodoro } from "../../types";
import { getDb } from "../../lib/db";

interface JournalEntry {
  task: Task;
  pomodoros: Pomodoro[];
}

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const tasks = await db.select<Task[]>(
        `SELECT * FROM tasks WHERE status = 'killed' ORDER BY completed_at DESC`
      );
      const result: JournalEntry[] = [];
      for (const task of tasks) {
        const pomodoros = await db.select<Pomodoro[]>(
          "SELECT * FROM pomodoros WHERE task_id = $1 AND result = 'completed' ORDER BY started_at",
          [task.id]
        );
        result.push({ task, pomodoros });
      }
      setEntries(result);
    })();
  }, []);

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-[#999999] hover:text-white self-start"
        >
          ← 返回图鉴
        </button>
        <div className="bg-monster-bg rounded p-4">
          <h2 className="text-lg font-bold">
            {selected.task.monster_name}
          </h2>
          <p className="text-sm text-[#999999]">{selected.task.name}</p>
          <p className="text-xs text-[#666666] mt-1">
            {selected.task.monster_description}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#444444] rounded p-2">
              <span className="text-[#999999]">预估番茄</span>
              <span className="block text-lg font-bold">
                {selected.task.estimated_pomodoros}
              </span>
            </div>
            <div className="bg-[#444444] rounded p-2">
              <span className="text-[#999999]">实际番茄</span>
              <span className="block text-lg font-bold">
                {selected.task.actual_pomodoros}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#999999]">狩猎记录</h3>
        {selected.pomodoros.map((p) => (
          <div key={p.id} className="bg-monster-bg rounded p-3 text-sm">
            <div className="font-bold">
              {p.completion_note || "（无记录）"}
            </div>
            {p.reflection_text && (
              <div className="text-xs text-[#999999] mt-1">
                💡 {p.reflection_text}
              </div>
            )}
            <div className="text-xs text-[#666666] mt-1">
              {p.started_at}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold">📖 狩猎图鉴</h2>
      {entries.length === 0 && (
        <p className="text-[#666666] text-sm">
          还没有击杀记录，完成一次狩猎吧！
        </p>
      )}
      {entries.map((entry) => (
        <button
          key={entry.task.id}
          onClick={() => setSelected(entry)}
          className="bg-monster-bg rounded p-3 text-left hover:bg-[#444444]"
        >
          <div className="font-bold text-sm">
            {entry.task.monster_name}
          </div>
          <div className="text-xs text-[#999999]">
            {entry.task.name} · {entry.task.actual_pomodoros}/
            {entry.task.estimated_pomodoros} 番茄 ·{" "}
            {entry.task.completed_at?.slice(0, 10)}
          </div>
        </button>
      ))}
    </div>
  );
}
