import type { Pomodoro } from "../../types";
import { getDb } from "../../lib/db";

interface Props {
  pomodoro: Pomodoro;
  onDismiss: () => void;
}

export function RecoveryDialog({ pomodoro, onDismiss }: Props) {
  const handleRetreat = async () => {
    const db = await getDb();
    await db.execute(
      `UPDATE pomodoros SET ended_at = $1, result = 'retreated' WHERE id = $2`,
      [new Date().toISOString(), pomodoro.id]
    );
    onDismiss();
  };

  const handleRecover = async () => {
    // MVP: treat recovery as starting fresh for the same task
    // A more sophisticated approach would calculate remaining time
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-lg p-6 max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-amber-400">
          🔄 检测到未完成的狩猎
        </h2>
        <p className="text-sm text-stone-300">
          上次的番茄钟（任务 #{pomodoro.task_id}）未正常结束。
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRecover}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white rounded py-2 text-sm"
          >
            忽略并继续
          </button>
          <button
            onClick={handleRetreat}
            className="flex-1 bg-stone-700 hover:bg-stone-600 text-white rounded py-2 text-sm"
          >
            安全撤退
          </button>
        </div>
      </div>
    </div>
  );
}
