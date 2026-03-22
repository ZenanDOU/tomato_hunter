import { useState } from "react";
import type { Pomodoro } from "../../types";
import { getDb } from "../../lib/db";

interface Props {
  pomodoro: Pomodoro;
  onDismiss: () => void;
}

export function RecoveryDialog({ pomodoro, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRetreat = async () => {
    setLoading(true);
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE pomodoros SET ended_at = $1, result = 'retreated' WHERE id = $2`,
        [new Date().toISOString(), pomodoro.id]
      );
    } catch (error) {
      console.error("[RecoveryDialog] retreat failed:", error);
    }
    onDismiss();
  };

  const handleRecover = async () => {
    // MVP: treat recovery as starting fresh for the same task
    // A more sophisticated approach would calculate remaining time
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="恢复未完成的狩猎">
      <div className="bg-monster-bg rounded-lg p-6 max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-sunny">
          🔄 检测到未完成的狩猎
        </h2>
        <p className="text-sm text-[#AAAAAA]">
          上次的番茄钟（任务 #{pomodoro.task_id}）未正常结束。
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRecover}
            disabled={loading}
            className="flex-1 bg-orange hover:bg-orange/80 text-white rounded py-2 text-sm disabled:opacity-50"
          >
            忽略并继续
          </button>
          <button
            onClick={handleRetreat}
            disabled={loading}
            className="flex-1 bg-[#444444] hover:bg-[#666666] text-white rounded py-2 text-sm disabled:opacity-50"
          >
            {loading ? "处理中..." : "安全撤退"}
          </button>
        </div>
      </div>
    </div>
  );
}
