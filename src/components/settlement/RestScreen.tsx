import { useCallback, useMemo } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { usePlanStore } from "../../stores/planStore";
import { useTauriEvent } from "../../hooks/useTauriEvent";
import type { TimerState } from "../../types";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { formatTime } from "../../lib/format";
import { closeHuntWindow } from "../../lib/commands";

const HEALTH_TIPS = [
  "起身走动，喝杯水 💧",
  "眺望远方，放松眼睛 👀",
  "做几个深呼吸 🌬️",
  "简单拉伸一下 🧘",
  "活动一下手腕和肩膀 💪",
];

export function RestScreen() {
  const { timer, setTimer, advancePhase } = useTimerStore();
  const { plan } = usePlanStore();

  const handleTick = useCallback(
    (payload: TimerState) => setTimer(payload),
    [setTimer]
  );
  useTauriEvent("timer_tick", handleTick);

  const tip = useMemo(
    () => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)],
    []
  );

  const nextEntry = plan?.entries.find(
    (e) => e.completed_pomodoros_today < e.planned_pomodoros_today
  );

  const isLongBreak = timer.phase === "long_break";

  const handleContinue = async () => {
    await advancePhase();
    await closeHuntWindow();
  };

  return (
    <div className="bg-[#88DDAA] text-[#333333] p-4 min-h-screen flex flex-col gap-4">
      <h2 className="pixel-title text-lg font-bold text-[#3366AA]">
        🌿 {isLongBreak ? "长休息" : "休息时间"}
      </h2>

      <PixelProgressBar
        current={timer.remaining_seconds}
        total={timer.total_seconds}
        color="grass"
      />
      <span className="text-2xl pixel-title text-center text-[#3366AA]">
        {formatTime(timer.remaining_seconds)}
      </span>

      <PixelCard bg="cloud" padding="md">
        <p className="text-[#333333]/60 text-sm mb-1">💪 建议活动：</p>
        <p className="text-sm">{tip}</p>
      </PixelCard>

      {nextEntry && (
        <PixelCard bg="cloud" padding="md">
          <p className="text-[#333333]/60 text-sm">下一个番茄：</p>
          <p className="font-bold text-sm">
            {nextEntry.monster_name || nextEntry.name}
          </p>
        </PixelCard>
      )}

      <PixelButton variant="success" size="lg" onClick={handleContinue} className="mt-auto w-full">
        返回村庄
      </PixelButton>
    </div>
  );
}
