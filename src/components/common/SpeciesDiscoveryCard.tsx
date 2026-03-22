import { BESTIARY } from "../../lib/bestiary";
import { PixelCard } from "./PixelCard";
import { PixelButton } from "./PixelButton";
import { PixelSprite } from "./PixelSprite";

interface SpeciesDiscoveryCardProps {
  speciesId: string;
  onDismiss: () => void;
}

export function SpeciesDiscoveryCard({ speciesId, onDismiss }: SpeciesDiscoveryCardProps) {
  const species = BESTIARY.find((s) => s.id === speciesId);
  if (!species) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PixelCard bg="cream" padding="lg" className="max-w-xs w-full flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-grass font-bold">新物种发现！</p>
        <div className="text-4xl">
          {species.spriteData ? (
            <PixelSprite sprite={species.spriteData} animation="idle" scale={4} />
          ) : (
            <span className="monster-sprite">{species.emoji}</span>
          )}
        </div>
        <p className="text-base font-bold text-pixel-black">{species.name}</p>
        <div className="text-xs text-pixel-black/60 flex flex-col gap-1">
          <span>家族: {species.family}</span>
          <span>栖息地: {species.habitat}</span>
        </div>
        <PixelButton variant="default" size="md" onClick={onDismiss} className="w-full mt-2">
          记录到图鉴
        </PixelButton>
      </PixelCard>
    </div>
  );
}
