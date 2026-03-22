import { useEffect, useState } from "react";
import { VillageLayout } from "./components/village/VillageLayout";
import { RecoveryDialog } from "./components/common/RecoveryDialog";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useTauriEvent } from "./hooks/useTauriEvent";
import type { Pomodoro } from "./types";
import { getDb } from "./lib/db";
import { audioManager } from "./lib/audio";
import { useSettingsStore } from "./stores/settingsStore";
import { useInventoryStore } from "./stores/inventoryStore";
import { syncAfterHuntComplete } from "./lib/storeSync";

export default function App() {
  const [recoveryPomodoro, setRecoveryPomodoro] = useState<Pomodoro | null>(
    null
  );

  useEffect(() => {
    // Initialize audio system — main window auto-starts village BGM
    audioManager.init({ autoPlayVillageBgm: true });
    useSettingsStore.getState().fetchSettings().then(async () => {
      const settings = useSettingsStore.getState();
      if (!settings.starterItemsGranted && !settings.onboardingCompleted) {
        await useInventoryStore.getState().grantItems([{ equipmentId: 10, quantity: 5 }]);
        await settings.setStarterItemsGranted(true);
      }
    });

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

  // Refresh stores when hunt window closes
  useTauriEvent("hunt_completed", () => {
    syncAfterHuntComplete();
    // Clear stale recovery dialog if present
    setRecoveryPomodoro(null);
  });

  return (
    <>
      {recoveryPomodoro && (
        <RecoveryDialog
          pomodoro={recoveryPomodoro}
          onDismiss={() => setRecoveryPomodoro(null)}
        />
      )}
      <ErrorBoundary>
        <VillageLayout />
      </ErrorBoundary>
    </>
  );
}
