import type { TaskCategory, TaskDifficulty } from "../../types";
import type { MonsterSpecies } from "../../lib/bestiary";
import { AttributeTag } from "./AttributeTag";
import { PixelSprite } from "./PixelSprite";
import { SPRITE_DATA } from "../../lib/spriteData";

interface MonsterDiscoveryCardProps {
  species: MonsterSpecies;
  monsterName: string;
  description: string;
  difficulty: TaskDifficulty;
  hp: number;
  attributes: string[];
  category: TaskCategory;
  onConfirm: () => void;
}

const DIFFICULTY_LABELS: Record<TaskDifficulty, { label: string; icon: string }> = {
  simple: { label: "简单", icon: "🦎" },
  medium: { label: "中等", icon: "🐺" },
  hard: { label: "困难", icon: "🐻" },
  epic: { label: "史诗", icon: "🐉" },
  legendary: { label: "传说", icon: "👹" },
};

export function MonsterDiscoveryCard({
  species,
  monsterName,
  description,
  difficulty,
  hp,
  attributes,
  category,
  onConfirm,
}: MonsterDiscoveryCardProps) {
  const diff = DIFFICULTY_LABELS[difficulty];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#443355] border-2 border-[#333333] pixel-border rounded-lg p-6 max-w-sm w-full flex flex-col items-center gap-4">
        {/* Monster sprite */}
        {SPRITE_DATA[species.id] ? (
          <PixelSprite sprite={SPRITE_DATA[species.id]} scale={3} />
        ) : (
          <div className="monster-sprite">{species.emoji}</div>
        )}

        {/* Name */}
        <h2 className="pixel-title text-lg font-bold text-[#FFD93D] text-center">
          「{monsterName}」
        </h2>

        {/* Difficulty + HP */}
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span>
            {diff.icon} {diff.label}
          </span>
          <span>·</span>
          <span>❤️ {hp} HP</span>
        </div>

        {/* Attributes */}
        {attributes.length > 0 && (
          <div className="flex gap-1">
            {attributes.map((a) => (
              <AttributeTag key={a} attribute={a} category={category} />
            ))}
          </div>
        )}

        {/* Story description */}
        <p className="text-sm text-white/60 text-center leading-relaxed">
          {description}
        </p>

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className="w-full bg-[#FF8844] hover:bg-[#FF8844]/80 text-white rounded py-2 text-sm font-bold pixel-border mt-2"
        >
          ⚔️ 加入讨伐清单
        </button>
      </div>
    </div>
  );
}
