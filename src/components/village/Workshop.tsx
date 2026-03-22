import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useFarmStore } from "../../stores/farmStore";
import { audioManager } from "../../lib/audio";
import { PixelSprite } from "../common/PixelSprite";
import { EQUIPMENT_SPRITES, EQUIPMENT_SHORT_DESC } from "../../lib/equipmentSprites";
import type { Equipment } from "../../types";

export function Workshop() {
  const {
    materials,
    ownedEquipment,
    allEquipment,
    loadout,
    fetchAll,
    craftEquipment,
    buyConsumable,
    equipWeapon,
    equipArmor,
  } = useInventoryStore();
  const { essenceBalance, fetchFarm } = useFarmStore();

  useEffect(() => {
    fetchAll();
    fetchFarm();
  }, [fetchAll, fetchFarm]);

  const weapons = allEquipment.filter((e) => e.type === "weapon");
  const armors = allEquipment.filter((e) => e.type === "armor");
  const items = allEquipment.filter((e) => e.type === "item");

  const handleEquipWeapon = useCallback(async (id: number | null) => {
    audioManager.playSfx(id ? "equip" : "unequip");
    await equipWeapon(id);
  }, [equipWeapon]);
  const handleEquipArmor = useCallback(async (id: number | null) => {
    audioManager.playSfx(id ? "equip" : "unequip");
    await equipArmor(id);
  }, [equipArmor]);

  const getMaterialQty = useCallback((id: number) =>
    materials.find((m) => m.material.id === id)?.quantity || 0, [materials]);
  const getOwnedQty = useCallback((id: number) =>
    ownedEquipment.find((e) => e.equipment.id === id)?.quantity || 0, [ownedEquipment]);

  const canCraft = useCallback((equip: Equipment) => {
    if (!equip.unlocked || equip.is_consumable) return false;
    if (Object.keys(equip.recipe).length === 0) return false;
    return Object.entries(equip.recipe).every(
      ([matId, needed]) => getMaterialQty(Number(matId)) >= (needed as number)
    );
  }, [getMaterialQty]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-bold text-pixel-black">🔨 工坊</h2>

      {/* Materials — compact grid */}
      <div>
        <h3 className="text-sm font-bold text-[#666666] mb-2">素材库存</h3>
        {materials.every((m) => m.quantity === 0) ? (
          <span className="text-xs text-[#666666]">
            还没有素材，完成讨伐来获取！
          </span>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-[var(--space-sm,4px)]">
            {materials.map((m) => (
              <div
                key={m.material.id}
                className={`bg-white rounded px-2 py-1 text-xs pixel-border flex items-center gap-1 ${
                  m.quantity === 0 ? "opacity-40" : ""
                }`}
              >
                <span>{m.material.icon}</span>
                <span className="text-orange">x{m.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weapons */}
      <EquipmentSection
        title="⚔️ 武器"
        items={weapons}
        equippedId={loadout.weapon_id}
        onEquip={handleEquipWeapon}
        onCraft={craftEquipment}
        canCraft={canCraft}
        getOwnedQty={getOwnedQty}
        materials={materials}
      />

      {/* Armor */}
      <EquipmentSection
        title="🛡️ 护甲"
        items={armors}
        equippedId={loadout.armor_id}
        onEquip={handleEquipArmor}
        onCraft={craftEquipment}
        canCraft={canCraft}
        getOwnedQty={getOwnedQty}
        materials={materials}
      />

      {/* Consumables */}
      <div>
        <h3 className="text-sm font-bold text-[#666666] mb-2">
          🧪 道具 <span className="font-normal text-orange">余额: {essenceBalance} 🫘</span>
        </h3>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ConsumableCard
              key={item.id}
              item={item}
              owned={getOwnedQty(item.id)}
              canBuy={item.price != null && essenceBalance >= item.price}
              onBuy={() => buyConsumable(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const EquipmentSection = memo(function EquipmentSection({
  title,
  items,
  equippedId,
  onEquip,
  onCraft,
  canCraft,
  getOwnedQty,
  materials,
}: {
  title: string;
  items: Equipment[];
  equippedId: number | null;
  onEquip: (id: number | null) => Promise<void>;
  onCraft: (id: number) => Promise<boolean>;
  canCraft: (equip: Equipment) => boolean;
  getOwnedQty: (id: number) => number;
  materials: { material: { id: number; name: string; icon: string }; quantity: number }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#666666] mb-2">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <EquipmentCard
            key={item.id}
            item={item}
            owned={getOwnedQty(item.id) > 0}
            equipped={equippedId === item.id}
            craftable={canCraft(item)}
            onEquip={() => onEquip(item.id)}
            onCraft={() => { return onCraft(item.id); }}
            materials={materials}
          />
        ))}
      </div>
    </div>
  );
});

const EquipmentCard = memo(function EquipmentCard({
  item,
  owned,
  equipped,
  craftable,
  onEquip,
  onCraft,
  materials,
}: {
  item: Equipment;
  owned: boolean;
  equipped: boolean;
  craftable: boolean;
  onEquip: () => void;
  onCraft: () => Promise<boolean>;
  materials: { material: { id: number; name: string; icon: string }; quantity: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [craftSuccess, setCraftSuccess] = useState(false);
  const sprite = EQUIPMENT_SPRITES[item.id];
  const shortDesc = EQUIPMENT_SHORT_DESC[item.id] || item.description;

  const statusTag = equipped
    ? <span className="text-orange text-xs font-bold">装备中</span>
    : !owned && !item.unlocked
      ? <span className="text-xs text-[#999999]">🔒</span>
      : null;

  const recipeMaterials = useMemo(() => {
    if (Object.keys(item.recipe).length === 0) return null;
    return Object.entries(item.recipe).map(([matId, needed]) => {
      const mat = materials.find((m) => m.material.id === Number(matId));
      const have = mat?.quantity || 0;
      const enough = have >= (needed as number);
      return (
        <span
          key={matId}
          className={`text-xs px-1.5 py-0.5 rounded ${
            enough ? "bg-grass/20 text-grass" : "bg-tomato/10 text-tomato"
          }`}
        >
          {mat?.material.icon || "?"} {have}/{needed as number}
        </span>
      );
    });
  }, [item.recipe, materials]);

  return (
    <div
      className={`bg-white rounded pixel-border ${equipped ? "ring-1 ring-orange" : ""}`}
    >
      {/* Collapsed header — always visible */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${item.name} 详情`}
      >
        {sprite ? (
          <PixelSprite sprite={sprite} scale={2} className="shrink-0" />
        ) : (
          <span className="text-2xl shrink-0 w-8 h-8 flex items-center justify-center">⚔️</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-pixel-black">{item.name}</span>
            {statusTag}
          </div>
          <div className="text-xs text-[#666666] truncate">{shortDesc}</div>
        </div>
        <span className="text-xs text-[#999999]">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-[#EEEEEE] p-3 flex flex-col gap-2">
          <p className="text-xs text-[#666666] leading-relaxed">{item.description}</p>

          {/* Recipe materials */}
          {recipeMaterials && (
            <div className="flex flex-wrap gap-1">
              {recipeMaterials}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-1">
            {owned && !equipped && (
              <button
                onClick={(e) => { e.stopPropagation(); onEquip(); }}
                className="text-xs bg-white hover:bg-cloud text-pixel-black px-3 py-1 rounded pixel-border"
              >
                装备
              </button>
            )}
            {!owned && item.unlocked && craftable && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await onCraft();
                  if (ok) {
                    audioManager.playSfx("equip");
                    setCraftSuccess(true);
                    setTimeout(() => setCraftSuccess(false), 1500);
                  }
                }}
                disabled={craftSuccess}
                className={`text-xs px-3 py-1 rounded pixel-border ${
                  craftSuccess
                    ? "bg-grass text-white"
                    : "bg-orange hover:bg-orange/80 text-white"
                }`}
              >
                {craftSuccess ? "制作成功！✅" : "制作"}
              </button>
            )}
            {!owned && !craftable && item.unlocked && (
              <span className="text-xs text-[#999999]">素材不足</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

const ConsumableCard = memo(function ConsumableCard({
  item,
  owned,
  canBuy,
  onBuy,
}: {
  item: Equipment;
  owned: number;
  canBuy: boolean;
  onBuy: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded pixel-border">
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between p-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${item.name} 详情`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-pixel-black">
            {item.name}
          </span>
          {owned > 0 && (
            <span className="text-xs text-orange">x{owned}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.price != null && (
            <button
              onClick={(e) => { e.stopPropagation(); onBuy(); }}
              disabled={!canBuy}
              className={`text-xs px-2 py-1 rounded pixel-border ${
                canBuy
                  ? "bg-orange hover:bg-[#FFAA66] text-white"
                  : "bg-[#CCCCCC] text-[#999999] cursor-not-allowed"
              }`}
              aria-label={`购买 ${item.name}，${item.price} 番茄精华`}
            >
              {item.price} 🫘
            </button>
          )}
          <span className="text-xs text-[#999999]">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div className="border-t border-[#EEEEEE] px-3 py-2">
          <p className="text-xs text-[#666666]">{item.description}</p>
        </div>
      )}
    </div>
  );
});
