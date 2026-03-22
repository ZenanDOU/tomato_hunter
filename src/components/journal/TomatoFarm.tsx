import { useEffect, useState, useCallback } from "react";
import { useFarmStore } from "../../stores/farmStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { PixelButton } from "../common/PixelButton";

const FERTILIZER_EQUIPMENT_ID = 14;

function formatCooldown(ms: number): string {
  if (ms <= 0) return "";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function getGrowthStage(count: number): { label: string; emoji: string; color: string } {
  if (count >= 50) return { label: "丰收", emoji: "🍅", color: "text-tomato" };
  if (count >= 26) return { label: "成熟", emoji: "🌿", color: "text-grass" };
  if (count >= 11) return { label: "生长", emoji: "🌱", color: "text-green-500" };
  return { label: "幼苗", emoji: "🌱", color: "text-green-300" };
}

export function TomatoFarm() {
  const {
    tomatoCount,
    essenceBalance,
    productionRate,
    isWatered,
    fertilizerRemainingMinutes,
    fetchFarm,
    water,
    canWater,
    getWateringCooldownRemaining,
    getProductionMultiplier,
  } = useFarmStore();

  const { ownedEquipment, fetchAll: fetchInventory, useConsumable } = useInventoryStore();

  const [cooldownDisplay, setCooldownDisplay] = useState("");
  const [waterAnim, setWaterAnim] = useState(false);
  const [fertilizeAnim, setFertilizeAnim] = useState(false);

  useEffect(() => {
    fetchFarm();
    fetchInventory();
  }, [fetchFarm, fetchInventory]);

  // Cooldown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getWateringCooldownRemaining();
      setCooldownDisplay(formatCooldown(remaining));
    }, 1000);
    return () => clearInterval(timer);
  }, [getWateringCooldownRemaining]);

  const fertilizerCount = ownedEquipment.find(
    (e) => e.equipment.id === FERTILIZER_EQUIPMENT_ID
  )?.quantity || 0;

  const handleWater = useCallback(() => {
    if (!canWater()) return;
    water();
    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), 1500);
  }, [canWater, water]);

  const handleFertilize = useCallback(async () => {
    if (fertilizerCount <= 0) return;
    const ok = await useConsumable(FERTILIZER_EQUIPMENT_ID);
    if (ok) {
      const { activateFertilizer } = useFarmStore.getState();
      await activateFertilizer(60);
      setFertilizeAnim(true);
      setTimeout(() => setFertilizeAnim(false), 2000);
    }
  }, [fertilizerCount, useConsumable]);

  const multiplier = getProductionMultiplier();
  const growth = getGrowthStage(tomatoCount);
  const isWaterOnCooldown = !canWater();

  // Build farm rows
  const rowCount = Math.min(Math.max(Math.ceil(tomatoCount / 5), 1), 10);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold pixel-title">🌱 番茄农场</h2>

      {/* Farm stats */}
      <div className="bg-white rounded p-3 pixel-border">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-[#666666]">农场番茄</div>
            <div className="text-lg font-bold text-tomato">{tomatoCount}</div>
          </div>
          <div>
            <div className="text-[#666666]">番茄素</div>
            <div className="text-lg font-bold text-orange">
              {essenceBalance} 🫘
            </div>
          </div>
          <div>
            <div className="text-[#666666]">产出速率</div>
            <div className="text-lg font-bold text-grass">
              {productionRate}/分
              {multiplier > 1 && (
                <span className="text-xs font-normal text-orange ml-1">
                  ×{multiplier}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active effects */}
      {(isWatered || fertilizerRemainingMinutes > 0) && (
        <div className="flex gap-2">
          {isWatered && (
            <span className="text-xs bg-sky/20 text-sky px-2 py-1 rounded pixel-border">
              💧 润泽中 (+50%)
            </span>
          )}
          {fertilizerRemainingMinutes > 0 && (
            <span className="text-xs bg-sunny/20 text-orange px-2 py-1 rounded pixel-border">
              ✨ 施肥中 (+100%) · 剩余 {Math.ceil(fertilizerRemainingMinutes)} 分钟
            </span>
          )}
        </div>
      )}

      {/* Farm visual — pixel art soil rows with plants */}
      <div
        className={`bg-gradient-to-b from-sky/10 to-green-50 rounded p-4 pixel-border relative overflow-hidden ${
          fertilizeAnim ? "farm-glow" : ""
        }`}
      >
        {/* Water droplet animation overlay */}
        {waterAnim && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="water-drops text-3xl animate-bounce opacity-80">
              💧💧💧
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {Array.from({ length: rowCount }).map((_, rowIdx) => {
            const plantsInRow = Math.min(
              5,
              tomatoCount - rowIdx * 5
            );
            if (plantsInRow <= 0) return null;
            return (
              <div key={rowIdx} className="flex items-end gap-1">
                {/* Soil row */}
                <div className="flex-1 flex items-end">
                  {Array.from({ length: plantsInRow }).map((_, plantIdx) => (
                    <div
                      key={plantIdx}
                      className="flex-1 flex flex-col items-center"
                    >
                      {/* Plant */}
                      <span
                        className={`text-lg ${
                          isWatered ? "drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" : ""
                        } ${
                          fertilizeAnim
                            ? "drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]"
                            : ""
                        }`}
                      >
                        {growth.emoji}
                      </span>
                      {/* Soil */}
                      <div
                        className={`w-full h-2 rounded-sm ${
                          isWatered
                            ? "bg-amber-800"
                            : "bg-amber-700/60"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {tomatoCount > 50 && (
          <div className="text-center text-xs text-pixel-black/50 mt-2">
            +{tomatoCount - 50} 更多植株...
          </div>
        )}

        {tomatoCount === 0 && (
          <div className="text-center text-sm text-pixel-black/40 py-4">
            农场空空如也... 去狩猎获得番茄吧！
          </div>
        )}

        {/* Growth stage label */}
        <div className="text-right mt-1">
          <span className={`text-xs ${growth.color} font-bold`}>
            {growth.emoji} {growth.label}期
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <PixelButton
          variant="default"
          size="sm"
          onClick={handleWater}
          disabled={isWaterOnCooldown}
          className="flex-1"
        >
          💧 浇水
          {isWaterOnCooldown && cooldownDisplay && (
            <span className="ml-1 text-xs opacity-60">{cooldownDisplay}</span>
          )}
        </PixelButton>

        <div className="relative flex-1">
          <PixelButton
            variant="default"
            size="sm"
            onClick={handleFertilize}
            disabled={fertilizerCount <= 0}
            className="w-full"
            title={
              fertilizerCount <= 0
                ? "需要番茄肥料（可在工坊购买）"
                : undefined
            }
          >
            ✨ 施肥
            {fertilizerCount > 0 && (
              <span className="ml-1 text-xs bg-tomato text-white px-1.5 py-0.5 rounded-full">
                {fertilizerCount}
              </span>
            )}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
