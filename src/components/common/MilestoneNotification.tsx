import { PixelCard } from "./PixelCard";
import { PixelButton } from "./PixelButton";
import { MILESTONES } from "../../lib/milestones";

interface MilestoneNotificationProps {
  milestoneId: string;
  onDismiss: () => void;
}

export function MilestoneNotification({ milestoneId, onDismiss }: MilestoneNotificationProps) {
  const def = MILESTONES.find((m) => m.id === milestoneId);
  if (!def) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PixelCard bg="cream" padding="lg" className="max-w-xs w-full flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-pixel-black/60">里程碑达成</p>
        <p className="text-3xl">{def.icon}</p>
        <p className="text-base font-bold text-pixel-black">{def.name}</p>
        <p className="text-sm text-pixel-black/70">{def.description}</p>
        <PixelButton variant="cta" size="md" onClick={onDismiss} className="w-full mt-2">
          确认
        </PixelButton>
      </PixelCard>
    </div>
  );
}
