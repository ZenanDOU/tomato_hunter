import { useEffect } from "react";
import { useInventoryStore } from "../../stores/inventoryStore";
import type { Equipment } from "../../types";

export function Workshop() {
  const {
    materials,
    ownedEquipment,
    allEquipment,
    loadout,
    fetchAll,
    craftEquipment,
    equipWeapon,
    equipArmor,
  } = useInventoryStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const weapons = allEquipment.filter((e) => e.type === "weapon");
  const armors = allEquipment.filter((e) => e.type === "armor");
  const items = allEquipment.filter((e) => e.type === "item");

  const getMaterialQty = (id: number) =>
    materials.find((m) => m.material.id === id)?.quantity || 0;
  const getOwnedQty = (id: number) =>
    ownedEquipment.find((e) => e.equipment.id === id)?.quantity || 0;

  const canCraft = (equip: Equipment) => {
    if (!equip.unlocked) return false;
    return Object.entries(equip.recipe).every(
      ([matId, needed]) => getMaterialQty(Number(matId)) >= (needed as number)
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-bold text-[#333333]">🔨 工坊</h2>

      <div>
        <h3 className="text-sm font-bold text-[#666666] mb-2">素材库存</h3>
        <div className="flex flex-wrap gap-2">
          {materials
            .filter((m) => m.quantity > 0)
            .map((m) => (
              <div
                key={m.material.id}
                className="bg-white rounded px-2 py-1 text-xs pixel-border flex items-center gap-1"
              >
                <span>{m.material.icon}</span>
                <span className="text-[#333333]">{m.material.name}</span>
                <span className="text-[#FF8844]">x{m.quantity}</span>
              </div>
            ))}
          {materials.every((m) => m.quantity === 0) && (
            <span className="text-xs text-[#666666]">
              还没有素材，完成讨伐来获取！
            </span>
          )}
        </div>
      </div>

      <EquipmentSection
        title="⚔️ 武器"
        items={weapons}
        equippedId={loadout.weapon_id}
        onEquip={equipWeapon}
        onCraft={craftEquipment}
        canCraft={canCraft}
        getOwnedQty={getOwnedQty}
      />

      <EquipmentSection
        title="🛡️ 护甲"
        items={armors}
        equippedId={loadout.armor_id}
        onEquip={equipArmor}
        onCraft={craftEquipment}
        canCraft={canCraft}
        getOwnedQty={getOwnedQty}
      />

      <div>
        <h3 className="text-sm font-bold text-[#666666] mb-2">🧪 道具</h3>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded p-2 pixel-border flex justify-between items-center"
            >
              <div>
                <div className="text-sm font-bold text-[#333333]">{item.name}</div>
                <div className="text-xs text-[#666666]">
                  {item.description}
                </div>
                <div className="text-xs text-[#FF8844]">
                  持有: {getOwnedQty(item.id)}
                </div>
              </div>
              {item.unlocked && canCraft(item) && (
                <button
                  onClick={() => craftEquipment(item.id)}
                  className="text-xs bg-[#FF8844] hover:bg-[#FF8844]/80 text-white px-2 py-1 rounded pixel-border"
                >
                  制作
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquipmentSection({
  title,
  items,
  equippedId,
  onEquip,
  onCraft,
  canCraft,
  getOwnedQty,
}: {
  title: string;
  items: Equipment[];
  equippedId: number | null;
  onEquip: (id: number | null) => Promise<void>;
  onCraft: (id: number) => Promise<boolean>;
  canCraft: (equip: Equipment) => boolean;
  getOwnedQty: (id: number) => number;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#666666] mb-2">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const owned = getOwnedQty(item.id) > 0;
          const equipped = equippedId === item.id;
          return (
            <div
              key={item.id}
              className={`bg-white rounded p-2 pixel-border flex justify-between items-center ${
                equipped ? "ring-1 ring-[#FF8844]" : ""
              }`}
            >
              <div>
                <div className="text-sm font-bold text-[#333333]">
                  {item.name}{" "}
                  {equipped && (
                    <span className="text-[#FF8844] text-xs">装备中</span>
                  )}
                </div>
                <div className="text-xs text-[#666666]">
                  {item.description}
                </div>
              </div>
              {owned && !equipped && (
                <button
                  onClick={() => onEquip(item.id)}
                  className="text-xs bg-white hover:bg-[#DDEEFF] text-[#333333] px-2 py-1 rounded pixel-border"
                >
                  装备
                </button>
              )}
              {!owned && item.unlocked && canCraft(item) && (
                <button
                  onClick={() => onCraft(item.id)}
                  className="text-xs bg-[#FF8844] hover:bg-[#FF8844]/80 text-white px-2 py-1 rounded pixel-border"
                >
                  制作
                </button>
              )}
              {!owned && !canCraft(item) && (
                <span className="text-xs text-[#666666]">
                  {item.unlocked ? "素材不足" : "🔒"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
