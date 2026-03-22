import { useState } from "react";
import type { SpeciesDiscovery } from "../../types";
import { BESTIARY, type MonsterSpecies } from "../../lib/bestiary";
import { getSpriteData } from "../../lib/spriteData";
import { PixelCard } from "../common/PixelCard";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { PixelSprite } from "../common/PixelSprite";
import { SpeciesDetail } from "./SpeciesDetail";

interface BestiaryCollectionProps {
  discoveredSpecies: SpeciesDiscovery[];
}

const FAMILIES = [
  { name: "锈蚀机械兽", category: "work" },
  { name: "枯彩幻灵", category: "creative" },
  { name: "蛀典书灵", category: "study" },
  { name: "荒野蔓生兽", category: "life" },
  { name: "迷雾幻形体", category: "other" },
] as const;

const TIER_ORDER: Record<string, number> = { prey: 0, predator: 1, apex: 2 };
const TIER_LABELS: Record<string, string> = { prey: "幼年", predator: "成年", apex: "王级" };

export function BestiaryCollection({ discoveredSpecies }: BestiaryCollectionProps) {
  const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null);
  const discoveredMap = new Map(discoveredSpecies.map((d) => [d.speciesId, d]));
  const discoveredCount = discoveredSpecies.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-pixel-black">怪物图鉴</p>
        <span className="text-xs text-pixel-black/60">{discoveredCount}/15 已发现</span>
      </div>
      <PixelProgressBar current={discoveredCount} total={15} color="tomato" />

      {FAMILIES.map((family) => {
        const species = BESTIARY
          .filter((s) => s.family === family.name)
          .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);

        return (
          <PixelCard key={family.name} bg="cream" padding="sm" className="flex flex-col gap-2">
            <p className="text-xs font-bold text-pixel-black">{family.name}</p>
            <div className="grid grid-cols-3 gap-2">
              {species.map((sp) => {
                const disc = discoveredMap.get(sp.id);
                const isDiscovered = !!disc;
                const isExpanded = expandedSpecies === sp.id;

                return (
                  <div key={sp.id} className="flex flex-col gap-1">
                    <button
                      className={`flex flex-col items-center gap-1 p-2 outline-1 outline-offset-[-1px] ${
                        isDiscovered
                          ? "outline-pixel-black/20 hover:bg-white/50 cursor-pointer"
                          : "outline-pixel-black/10 opacity-40 cursor-default"
                      }`}
                      onClick={() => {
                        if (isDiscovered) {
                          setExpandedSpecies(isExpanded ? null : sp.id);
                        }
                      }}
                      disabled={!isDiscovered}
                    >
                      {isDiscovered ? (
                        <SpeciesThumb species={sp} />
                      ) : (
                        <span className="text-xl opacity-30">❓</span>
                      )}
                      <span className="text-xs text-pixel-black/70">
                        {isDiscovered ? sp.name : "???"}
                      </span>
                      <span className="text-[10px] text-pixel-black/40">
                        {TIER_LABELS[sp.tier]}
                      </span>
                    </button>
                    {isExpanded && disc && <SpeciesDetail species={sp} discovery={disc} />}
                  </div>
                );
              })}
            </div>
          </PixelCard>
        );
      })}
    </div>
  );
}

function SpeciesThumb({ species }: { species: MonsterSpecies }) {
  const sprite = getSpriteData(species.id);
  if (sprite) {
    return <PixelSprite sprite={sprite} animation="idle" scale={2} />;
  }
  return <span className="text-xl monster-sprite">{species.emoji}</span>;
}
