import { create } from "zustand";
import { getDb } from "../lib/db";
import { audioManager } from "../lib/audio";

interface SettingsStore {
  soundEnabled: boolean;
  volume: number;
  bgmVolume: number;
  sfxVolume: number;
  onboardingCompleted: boolean;
  onboardingStep: number;
  starterItemsGranted: boolean;
  firstKillRewardGranted: boolean;
  fetchSettings: () => Promise<void>;
  toggleSound: () => Promise<void>;
  setVolume: (v: number) => Promise<void>;
  setBgmVolume: (v: number) => Promise<void>;
  setSfxVolume: (v: number) => Promise<void>;
  setOnboardingCompleted: (v: boolean) => Promise<void>;
  setOnboardingStep: (step: number) => Promise<void>;
  setStarterItemsGranted: (v: boolean) => Promise<void>;
  setFirstKillRewardGranted: (v: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,
  volume: 80,
  bgmVolume: 60,
  sfxVolume: 80,
  onboardingCompleted: false,
  onboardingStep: 0,
  starterItemsGranted: false,
  firstKillRewardGranted: false,

  fetchSettings: async () => {
    try {
      const db = await getDb();
      const rows = await db.select<{ key: string; value: string }[]>(
        "SELECT * FROM settings WHERE key IN ('sound_enabled', 'volume', 'bgm_volume', 'sfx_volume', 'onboarding_completed', 'onboarding_step', 'starter_items_granted', 'first_kill_reward_granted')"
      );
      const soundRow = rows.find((r) => r.key === "sound_enabled");
      const volumeRow = rows.find((r) => r.key === "volume");
      const bgmRow = rows.find((r) => r.key === "bgm_volume");
      const sfxRow = rows.find((r) => r.key === "sfx_volume");
      const onboardingCompletedRow = rows.find((r) => r.key === "onboarding_completed");
      const onboardingStepRow = rows.find((r) => r.key === "onboarding_step");
      const starterItemsRow = rows.find((r) => r.key === "starter_items_granted");
      const firstKillRewardRow = rows.find((r) => r.key === "first_kill_reward_granted");
      const soundEnabled = soundRow?.value !== "false";
      const volume = volumeRow ? parseInt(volumeRow.value) : 80;
      const bgmVolume = bgmRow ? parseInt(bgmRow.value) : 60;
      const sfxVolume = sfxRow ? parseInt(sfxRow.value) : 80;
      const onboardingCompleted = onboardingCompletedRow?.value === "true";
      const onboardingStep = onboardingStepRow ? parseInt(onboardingStepRow.value) : 0;
      const starterItemsGranted = starterItemsRow?.value === "true";
      const firstKillRewardGranted = firstKillRewardRow?.value === "true";

      set({ soundEnabled, volume, bgmVolume, sfxVolume, onboardingCompleted, onboardingStep, starterItemsGranted, firstKillRewardGranted });
      audioManager.setEnabled(soundEnabled);
      audioManager.setVolume(volume / 100);
      audioManager.setBgmVolume(bgmVolume / 100);
      audioManager.setSfxVolume(sfxVolume / 100);
    } catch (error) {
      console.error("[SettingsStore] fetchSettings failed:", error);
    }
  },

  toggleSound: async () => {
    const db = await getDb();
    const newVal = !get().soundEnabled;
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('sound_enabled', $1)",
      [String(newVal)]
    );
    set({ soundEnabled: newVal });
    audioManager.setEnabled(newVal);
  },

  setVolume: async (v: number) => {
    const db = await getDb();
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('volume', $1)",
      [String(clamped)]
    );
    set({ volume: clamped });
    audioManager.setVolume(clamped / 100);
  },

  setBgmVolume: async (v: number) => {
    const db = await getDb();
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('bgm_volume', $1)",
      [String(clamped)]
    );
    set({ bgmVolume: clamped });
    audioManager.setBgmVolume(clamped / 100);
  },

  setSfxVolume: async (v: number) => {
    const db = await getDb();
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('sfx_volume', $1)",
      [String(clamped)]
    );
    set({ sfxVolume: clamped });
    audioManager.setSfxVolume(clamped / 100);
  },

  setOnboardingCompleted: async (v: boolean) => {
    const db = await getDb();
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('onboarding_completed', $1)",
      [String(v)]
    );
    set({ onboardingCompleted: v });
  },

  setOnboardingStep: async (step: number) => {
    const db = await getDb();
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('onboarding_step', $1)",
      [String(step)]
    );
    set({ onboardingStep: step });
  },

  setStarterItemsGranted: async (v: boolean) => {
    const db = await getDb();
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('starter_items_granted', $1)",
      [String(v)]
    );
    set({ starterItemsGranted: v });
  },

  setFirstKillRewardGranted: async (v: boolean) => {
    const db = await getDb();
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('first_kill_reward_granted', $1)",
      [String(v)]
    );
    set({ firstKillRewardGranted: v });
  },
}));
