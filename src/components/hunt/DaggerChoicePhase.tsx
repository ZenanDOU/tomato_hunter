import type { TimerState } from "../../types";
import { useTimerStore } from "../../stores/timerStore";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface DaggerChoicePhaseProps {
  timer: TimerState;
}

export function DaggerChoicePhase({ timer }: DaggerChoicePhaseProps) {
  const daggerChoose = useTimerStore((s) => s.daggerChoose);
  const actionCount = timer.dagger_action_count;
  const tomatoCount = Math.ceil(actionCount / 2);

  return (
    <div
      className="bg-sky text-pixel-black p-5 min-h-screen flex flex-col gap-4 items-center justify-center"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea")) return;
        getCurrentWindow().startDragging();
      }}
    >
      <PixelCard bg="cloud" padding="lg" className="w-full max-w-xs text-center">
        <div className="text-4xl mb-2">🗡️</div>
        <h2 className="pixel-title text-base font-bold">匕首模式</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-cloud rounded p-2 pixel-border">
            <span className="text-[#666666]">行动次数</span>
            <span className="block text-lg font-bold text-pixel-black">
              {actionCount}
            </span>
          </div>
          <div className="bg-cloud rounded p-2 pixel-border">
            <span className="text-[#666666]">已获番茄</span>
            <span className="block text-lg font-bold text-tomato">
              {tomatoCount} 🍅
            </span>
          </div>
        </div>
      </PixelCard>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <PixelButton
          variant="cta"
          size="lg"
          onClick={() => daggerChoose(true)}
          className="w-full"
        >
          ⚔️ 继续行动（15分钟）
        </PixelButton>
        <PixelButton
          variant="success"
          size="lg"
          onClick={() => daggerChoose(false)}
          className="w-full"
        >
          🌿 选择休息（15分钟）
        </PixelButton>
        <button
          onClick={async () => {
            const { closeHuntWindow } = await import("../../lib/commands");
            await useTimerStore.getState().retreat();
            await closeHuntWindow();
          }}
          className="text-xs text-white/60 hover:text-white mt-2"
        >
          结束匕首模式（获得 {tomatoCount} 🍅）
        </button>
      </div>
    </div>
  );
}
