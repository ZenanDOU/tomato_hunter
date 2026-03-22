import { create } from "zustand";
import type {
  Equipment,
  Material,
  Loadout,
  EquipmentEffect,
  WeaponEffect,
  ArmorEffect,
  TimerMode,
  AudioMode,
} from "../types";
import { getDb } from "../lib/db";
import { useFarmStore } from "./farmStore";

interface MaterialEntry {
  material: Material;
  quantity: number;
}

interface EquipmentEntry {
  equipment: Equipment;
  quantity: number;
}

interface InventoryStore {
  materials: MaterialEntry[];
  ownedEquipment: EquipmentEntry[];
  allEquipment: Equipment[];
  loadout: Loadout;
  fetchAll: () => Promise<void>;
  craftEquipment: (equipmentId: number) => Promise<boolean>;
  buyConsumable: (equipmentId: number) => Promise<boolean>;
  equipWeapon: (id: number | null) => Promise<void>;
  equipArmor: (id: number | null) => Promise<void>;
  useConsumable: (equipmentId: number) => Promise<boolean>;
  grantItems: (items: { equipmentId: number; quantity: number }[]) => Promise<void>;
  getActiveTimerMode: () => TimerMode;
  getActiveAudioMode: () => AudioMode;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  materials: [],
  ownedEquipment: [],
  allEquipment: [],
  loadout: { weapon_id: null, armor_id: null, items: [] },

  fetchAll: async () => {
    try {
      const db = await getDb();

      const mats = await db.select<(Material & { quantity: number })[]>(
        `SELECT m.*, COALESCE(pm.quantity, 0) as quantity
       FROM materials m LEFT JOIN player_materials pm ON pm.material_id = m.id`
      );

      const equips = await db.select<
        (Equipment & { owned_qty: number; effect: string; recipe: string })[]
      >(
        `SELECT e.*, COALESCE(pe.quantity, 0) as owned_qty
       FROM equipment e LEFT JOIN player_equipment pe ON pe.equipment_id = e.id`
      );

      const loadoutRows = await db.select<
        { weapon_id: number | null; armor_id: number | null; items: string }[]
      >("SELECT * FROM loadout WHERE id = 1");

      const parsedEquips: EquipmentEntry[] = equips.map((e) => ({
        equipment: {
          id: e.id,
          name: e.name,
          type: e.type,
          description: e.description,
          effect: JSON.parse(
            typeof e.effect === "string" ? e.effect : JSON.stringify(e.effect)
          ) as EquipmentEffect,
          recipe: JSON.parse(
            typeof e.recipe === "string" ? e.recipe : JSON.stringify(e.recipe)
          ) as Record<number, number>,
          unlocked: Boolean(e.unlocked),
          is_consumable: Boolean(e.is_consumable),
          price: (e as unknown as { price: number | null }).price ?? null,
        },
        quantity: e.owned_qty,
      }));

      set({
        materials: mats.map((m) => ({
          material: {
            id: m.id,
            name: m.name,
            category: m.category,
            rarity: m.rarity,
            icon: m.icon,
          },
          quantity: m.quantity,
        })),
        ownedEquipment: parsedEquips.filter((e) => e.quantity > 0),
        allEquipment: parsedEquips.map((e) => e.equipment),
        loadout: loadoutRows[0]
          ? {
              weapon_id: loadoutRows[0].weapon_id,
              armor_id: loadoutRows[0].armor_id,
              items: JSON.parse(loadoutRows[0].items),
            }
          : { weapon_id: null, armor_id: null, items: [] },
      });
    } catch (error) {
      console.error("[InventoryStore] fetchAll failed:", error);
      throw error;
    }
  },

  craftEquipment: async (equipmentId) => {
    try {
      const equip = get().allEquipment.find((e) => e.id === equipmentId);
      if (!equip || !equip.unlocked || equip.is_consumable) return false;

      const db = await getDb();
      for (const [matId, needed] of Object.entries(equip.recipe)) {
        const result = await db.execute(
          "UPDATE player_materials SET quantity = quantity - $1 WHERE material_id = $2 AND quantity >= $1",
          [needed as number, Number(matId)]
        );
        if (result.rowsAffected === 0) {
          throw new Error(`Insufficient material ${matId}`);
        }
      }

      await db.execute(
        `INSERT INTO player_equipment (equipment_id, quantity) VALUES ($1, 1)
         ON CONFLICT(equipment_id) DO UPDATE SET quantity = quantity + 1`,
        [equipmentId]
      );

      await get().fetchAll();
      return true;
    } catch (error) {
      if ((error as Error).message?.startsWith("Insufficient material")) {
        return false;
      }
      console.error("[InventoryStore] craftEquipment failed:", error);
      throw error;
    }
  },

  buyConsumable: async (equipmentId) => {
    try {
      const equip = get().allEquipment.find((e) => e.id === equipmentId);
      if (!equip || !equip.is_consumable || equip.price == null) return false;

      const success = await useFarmStore.getState().spendEssence(equip.price);
      if (!success) return false;

      const db = await getDb();
      await db.execute(
        `INSERT INTO player_equipment (equipment_id, quantity) VALUES ($1, 1)
       ON CONFLICT(equipment_id) DO UPDATE SET quantity = quantity + 1`,
        [equipmentId]
      );

      await get().fetchAll();
      return true;
    } catch (error) {
      console.error("[InventoryStore] buyConsumable failed:", error);
      throw error;
    }
  },

  equipWeapon: async (id) => {
    try {
      const db = await getDb();
      await db.execute("UPDATE loadout SET weapon_id = $1 WHERE id = 1", [id]);
      await get().fetchAll();
    } catch (error) {
      console.error("[InventoryStore] equipWeapon failed:", error);
      throw error;
    }
  },

  equipArmor: async (id) => {
    try {
      const db = await getDb();
      await db.execute("UPDATE loadout SET armor_id = $1 WHERE id = 1", [id]);
      await get().fetchAll();
    } catch (error) {
      console.error("[InventoryStore] equipArmor failed:", error);
      throw error;
    }
  },

  useConsumable: async (equipmentId) => {
    try {
      const owned = get().ownedEquipment.find(
        (e) => e.equipment.id === equipmentId
      );
      if (!owned || owned.quantity <= 0) return false;
      const db = await getDb();
      await db.execute(
        "UPDATE player_equipment SET quantity = quantity - 1 WHERE equipment_id = $1",
        [equipmentId]
      );
      await get().fetchAll();
      return true;
    } catch (error) {
      console.error("[InventoryStore] useConsumable failed:", error);
      throw error;
    }
  },

  grantItems: async (items) => {
    try {
      const db = await getDb();
      for (const { equipmentId, quantity } of items) {
        await db.execute(
          `INSERT INTO player_equipment (equipment_id, quantity) VALUES ($1, $2)
           ON CONFLICT(equipment_id) DO UPDATE SET quantity = quantity + $2`,
          [equipmentId, quantity]
        );
      }
      await get().fetchAll();
    } catch (error) {
      console.error("[InventoryStore] grantItems failed:", error);
      throw error;
    }
  },

  getActiveTimerMode: (): TimerMode => {
    const { loadout, allEquipment } = get();
    if (!loadout.weapon_id) return "sword";
    const weapon = allEquipment.find((e) => e.id === loadout.weapon_id);
    if (weapon?.effect.type === "timer_mode") {
      return (weapon.effect as WeaponEffect).mode;
    }
    return "sword";
  },

  getActiveAudioMode: (): AudioMode => {
    const { loadout, allEquipment } = get();
    if (!loadout.armor_id) return "silent";
    const armor = allEquipment.find((e) => e.id === loadout.armor_id);
    if (armor?.effect.type === "audio_mode") {
      return (armor.effect as ArmorEffect).mode;
    }
    return "silent";
  },
}));
