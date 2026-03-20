import { create } from "zustand";
import { getDb } from "../lib/db";

interface SettingsStore {
  soundEnabled: boolean;
  fetchSettings: () => Promise<void>;
  toggleSound: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,

  fetchSettings: async () => {
    const db = await getDb();
    const rows = await db.select<{ key: string; value: string }[]>(
      "SELECT * FROM settings WHERE key = 'sound_enabled'"
    );
    set({ soundEnabled: rows[0]?.value !== "false" });
  },

  toggleSound: async () => {
    const db = await getDb();
    const newVal = !get().soundEnabled;
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('sound_enabled', $1)",
      [String(newVal)]
    );
    set({ soundEnabled: newVal });
  },
}));
