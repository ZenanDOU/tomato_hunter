import { useEffect, useState } from "react";
import type { Task, Pomodoro } from "../../types";
import { getDb } from "../../lib/db";
import { NARRATIVE } from "../../lib/narrative";
import { parseMonsterVariant } from "../../lib/monsterAttributes";
import { AttributeTag } from "../common/AttributeTag";

interface BattleEntry {
  task: Task;
  pomodoros: Pomodoro[];
}

export function BattleHistory() {
  const [entries, setEntries] = useState<BattleEntry[]>([]);
  const [selected, setSelected] = useState<BattleEntry | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const tasks = await db.select<Task[]>(
        `SELECT * FROM tasks WHERE status = 'killed' ORDER BY completed_at DESC`
      );
      const result: BattleEntry[] = [];
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
    const { attributes } = parseMonsterVariant(selected.task.monster_variant);
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-[#666666] hover:text-pixel-black self-start"
        >
          {NARRATIVE.journalBack}
        </button>
        <div className="bg-white rounded p-4 pixel-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            <div>
              <h2 className="text-lg font-bold text-pixel-black">
                {selected.task.monster_name}
              </h2>
              <p className="text-sm text-[#666666]">{selected.task.name}</p>
            </div>
          </div>
          <p className="text-xs text-[#666666] mt-2">
            {selected.task.monster_description}
          </p>
          {attributes.length > 0 && (
            <div className="flex gap-1 mt-2">
              {attributes.map((a) => (
                <AttributeTag
                  key={a}
                  attribute={a}
                  category={selected.task.category}
                />
              ))}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-cloud rounded p-2 pixel-border">
              <span className="text-[#666666]">预估番茄</span>
              <span className="block text-lg font-bold pixel-title text-pixel-black">
                {selected.task.estimated_pomodoros}
              </span>
            </div>
            <div className="bg-cloud rounded p-2 pixel-border">
              <span className="text-[#666666]">实际番茄</span>
              <span className="block text-lg font-bold pixel-title text-pixel-black">
                {selected.task.actual_pomodoros}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#666666]">
          {NARRATIVE.journalRecords}
        </h3>
        {selected.pomodoros.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded p-3 text-sm pixel-border"
          >
            <div className="font-bold text-pixel-black">
              {p.completion_note || "（无记录）"}
            </div>
            {p.strategy_note && (
              <div className="text-xs text-orange mt-1">
                🎯 策略：{p.strategy_note}
              </div>
            )}
            {p.reflection_text && (
              <div className="text-xs text-[#666666] mt-1">
                💡 {p.reflection_text}
              </div>
            )}
            <div className="text-xs text-[#666666] mt-1">{p.started_at}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold rounded pixel-border bg-white text-pixel-black"
        aria-expanded={expanded}
      >
        <span>
          📖 战斗日志{" "}
          <span className="text-xs font-normal text-pixel-black/60">
            ({entries.length})
          </span>
        </span>
        <span className="text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 mt-2">
          {entries.length === 0 && (
            <p className="text-[#666666] text-sm">
              还没有战斗记录，去狩猎吧！
            </p>
          )}
          {entries.map((entry) => (
            <button
              key={entry.task.id}
              onClick={() => setSelected(entry)}
              className="bg-white rounded p-3 text-left hover:bg-cloud pixel-border"
            >
              <div className="flex items-center gap-2">
                <span>🍅</span>
                <div>
                  <div className="font-bold text-sm text-pixel-black">
                    {entry.task.monster_name}
                  </div>
                  <div className="text-xs text-[#666666]">
                    {entry.task.name} · {entry.task.actual_pomodoros}/
                    {entry.task.estimated_pomodoros} 番茄 ·{" "}
                    {entry.task.completed_at?.slice(0, 10)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
