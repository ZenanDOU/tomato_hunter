import { useEffect, useRef, useCallback } from "react";
import { audioManager } from "../lib/audio";
import { useInventoryStore } from "../stores/inventoryStore";
import type { TimerState } from "../types";

/**
 * Extracts audio-related logic from HuntApp's tick handler.
 *
 * Returns `handleTickAudio` — call it from the main `handleTick` callback
 * with each incoming TimerState payload.
 */
export function useHuntAudio(): (payload: TimerState) => void {
  const prevPhase = useRef<string | null>(null);

  // Initialize audio manager on mount
  useEffect(() => {
    audioManager.init();
  }, []);

  const handleTickAudio = useCallback((payload: TimerState) => {
    // Countdown warning at 60s remaining (sword/hammer focus)
    if (
      payload.phase === "focus" &&
      payload.remaining_seconds <= 60 &&
      payload.remaining_seconds > 59 &&
      payload.timer_mode !== "dagger"
    ) {
      audioManager.playSfx("countdown-warning");
    }

    // Enter armor audio on focus phase start
    if (payload.phase === "focus" && !audioManager.isInFocusAudio) {
      const audioMode = useInventoryStore.getState().getActiveAudioMode();
      audioManager.enterFocusWithArmor(audioMode);
    }
    // Exit armor audio when leaving focus
    if (payload.phase !== "focus" && audioManager.isInFocusAudio) {
      audioManager.exitFocusAudio();
    }

    // Phase transition SFX
    const prev = prevPhase.current;
    if (prev && prev !== payload.phase) {
      // Focus phase just ended -> focus-complete + transition-in (back to interactive)
      if (prev === "focus") {
        audioManager.playSfx("focus-complete");
        audioManager.playSfx("transition-in");
      }
      // Entering focus -> transition-out (leaving interactive)
      if (payload.phase === "focus") {
        audioManager.playSfx("transition-out");
      }
    }
    prevPhase.current = payload.phase;
  }, []);

  return handleTickAudio;
}
