import { useCallback, useEffect, useRef, useState } from "react";
import { useTimerStore } from "./stores/timerStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useFarmStore } from "./stores/farmStore";
import { useInventoryStore } from "./stores/inventoryStore";
import { useTaskStore } from "./stores/taskStore";
import { useTauriEvent } from "./hooks/useTauriEvent";
import { useHuntAudio } from "./hooks/useHuntAudio";
import { useReviewFlow } from "./hooks/useReviewFlow";
import { closeHuntWindow, resizeHuntWindow } from "./lib/commands";
import { emit } from "@tauri-apps/api/event";
import { audioManager } from "./lib/audio";
import type { TimerState } from "./types";
import { PrepPhase } from "./components/hunt/PrepPhase";
import { FocusPhase } from "./components/hunt/FocusPhase";
import { ReviewPhase } from "./components/hunt/ReviewPhase";
import { DaggerChoicePhase } from "./components/hunt/DaggerChoicePhase";
import { Settlement } from "./components/settlement/Settlement";
import { RestScreen } from "./components/settlement/RestScreen";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

type FlowPhase = "hunting" | "settlement" | "rest";

export function HuntApp() {
  const timer = useTimerStore((s) => s.timer);
  const setTimer = useTimerStore((s) => s.setTimer);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("hunting");
  const [strategyNote, setStrategyNote] = useState("");
  const lastEssenceTick = useRef(0); // track last minute we awarded essence

  const handleTickAudio = useHuntAudio();
  const { handleReviewComplete, drops, hpReachedZero, unlockedRecipes, showFirstKillReward } = useReviewFlow(timer, setFlowPhase);

  useKeyboardShortcuts({
    onSpace: timer.phase === "focus" ? () => {
      const store = useTimerStore.getState();
      if (store.timer.is_paused) store.resume();
      else store.pause();
    } : undefined,
  });

  // Initialize stores in hunt window (audio init is handled by useHuntAudio)
  useEffect(() => {
    useSettingsStore.getState().fetchSettings();
    useFarmStore.getState().fetchFarm();
    useInventoryStore.getState().fetchAll();
    useTaskStore.getState().fetchTasks();
  }, []);

  const handleTick = useCallback(
    (payload: TimerState) => {
      // Tomato essence production: every 60 seconds of focus
      if (payload.phase === "focus") {
        const elapsed = payload.total_seconds - payload.remaining_seconds;
        const currentMinute = Math.floor(elapsed / 60);
        if (currentMinute > lastEssenceTick.current) {
          const minutesDelta = currentMinute - lastEssenceTick.current;
          lastEssenceTick.current = currentMinute;
          useFarmStore.getState().tickProduction(minutesDelta);
        }
      } else {
        lastEssenceTick.current = 0;
      }

      // Audio transitions (countdown, armor enter/exit, phase SFX)
      handleTickAudio(payload);

      setTimer(payload);
    },
    [setTimer, handleTickAudio]
  );
  useTauriEvent("timer_tick", handleTick);

  // Handle window close request (pause or retreat)
  const handleWindowClose = useCallback(async () => {
    const inv = useInventoryStore.getState();
    // Smoke bomb is now equipment ID 7
    const hasSmokeBomb = inv.ownedEquipment.some(
      (e) => e.equipment.id === 7 && e.quantity > 0
    );
    if (hasSmokeBomb) {
      await inv.useConsumable(7);
      await useTimerStore.getState().pause();
    } else {
      await useTimerStore.getState().retreat();
      await closeHuntWindow();
    }
  }, []);
  useTauriEvent("hunt_window_close_requested", handleWindowClose);

  // Handle pause timeout retreat
  const handlePauseTimeout = useCallback(async () => {
    await closeHuntWindow();
  }, []);
  useTauriEvent("pause_timeout_retreat", handlePauseTimeout);

  const handleSettlementDone = async () => {
    audioManager.playSfx("transition-out");
    audioManager.leaveHabitat(true);
    // Advance timer from review → break/idle NOW (not earlier during settlement)
    await useTimerStore.getState().advancePhase();
    // Hammer mode: no break phase, go straight to idle and close
    if (timer.timer_mode === "hammer") {
      audioManager.exitFocusAudio();
      await emit("hunt_completed");
      await closeHuntWindow();
      return;
    }
    audioManager.playSfx("break-start");
    setFlowPhase("rest");
  };

  const handleStartNextHunt = useCallback(() => {
    audioManager.playSfx("transition-in");
    setFlowPhase("hunting");
    setStrategyNote("");
    lastEssenceTick.current = 0;
  }, []);

  if (flowPhase === "settlement") {
    return <ErrorBoundary fallbackTitle="Hunt Error"><Settlement drops={drops} hpReachedZero={hpReachedZero} unlockedRecipes={unlockedRecipes} showFirstKillReward={showFirstKillReward} onContinue={handleSettlementDone} /></ErrorBoundary>;
  }

  if (flowPhase === "rest") {
    return <ErrorBoundary fallbackTitle="Hunt Error"><RestScreen onStartNextHunt={handleStartNextHunt} /></ErrorBoundary>;
  }

  // Hunting phases
  switch (timer.phase) {
    case "awaiting_choice":
      return <ErrorBoundary fallbackTitle="Hunt Error"><DaggerChoicePhase timer={timer} /></ErrorBoundary>;
    case "dagger_rest":
      return (
        <ErrorBoundary fallbackTitle="Hunt Error">
        <div className="bg-grass text-white p-5 min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="text-4xl">🌿</div>
          <h2 className="pixel-title text-lg">休息中</h2>
          <div className="text-3xl font-bold pixel-title">
            {Math.floor(timer.remaining_seconds / 60)}:{String(timer.remaining_seconds % 60).padStart(2, "0")}
          </div>
          <p className="text-sm text-white/70">
            已行动 {timer.dagger_action_count} 次 · {Math.ceil(timer.dagger_action_count / 2)} 🍅
          </p>
        </div>
        </ErrorBoundary>
      );
    case "prep":
      return (
        <ErrorBoundary fallbackTitle="Hunt Error">
        <PrepPhase
          timer={timer}
          onStartBattle={async (note) => {
            setStrategyNote(note);
            try {
              await resizeHuntWindow(600, 176);
            } catch {}
          }}
        />
        </ErrorBoundary>
      );
    case "focus":
      return <ErrorBoundary fallbackTitle="Hunt Error"><FocusPhase timer={timer} strategyNote={strategyNote} /></ErrorBoundary>;
    case "review":
      resizeHuntWindow(400, 520).catch(() => {});
      return (
        <ErrorBoundary fallbackTitle="Hunt Error">
        <ReviewPhase timer={timer} onComplete={handleReviewComplete} />
        </ErrorBoundary>
      );
    default:
      return (
        <ErrorBoundary fallbackTitle="Hunt Error">
        <div className="bg-pixel-black text-[#999999] p-4">
          等待狩猎开始...
        </div>
        </ErrorBoundary>
      );
  }
}
