import { useEffect, useState } from "react";
import { VillageLayout } from "./components/village/VillageLayout";
import { RecoveryDialog } from "./components/common/RecoveryDialog";
import type { Pomodoro } from "./types";
import { getDb } from "./lib/db";

export default function App() {
  const [recoveryPomodoro, setRecoveryPomodoro] = useState<Pomodoro | null>(
    null
  );

  useEffect(() => {
    (async () => {
      try {
        const db = await getDb();
        const unfinished = await db.select<Pomodoro[]>(
          `SELECT * FROM pomodoros WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1`
        );
        if (unfinished.length > 0) {
          setRecoveryPomodoro(unfinished[0]);
        }
      } catch {
        // DB not ready yet on first launch
      }
    })();
  }, []);

  return (
    <>
      {recoveryPomodoro && (
        <RecoveryDialog
          pomodoro={recoveryPomodoro}
          onDismiss={() => setRecoveryPomodoro(null)}
        />
      )}
      <VillageLayout />
    </>
  );
}
