import { useState } from "react";
import type { TimerState, ReflectionType } from "../../types";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { PixelButton } from "../common/PixelButton";
import { formatTime } from "../../lib/format";
import { NARRATIVE } from "../../lib/narrative";

interface ReviewPhaseProps {
  timer: TimerState;
  onComplete: (
    note: string,
    reflType: ReflectionType | null,
    reflText: string
  ) => void;
}

const reflectionOptions: { value: ReflectionType; label: string }[] = [
  { value: "smooth", label: "很顺利，我做对了什么？" },
  { value: "difficult", label: "遇到困难，下次如何改进？" },
  { value: "discovery", label: "有新的想法或发现？" },
];

export function ReviewPhase({ timer, onComplete }: ReviewPhaseProps) {
  const [completionNote, setCompletionNote] = useState("");
  const [reflectionType, setReflectionType] =
    useState<ReflectionType | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!completionNote.trim() || submitting) return;
    setSubmitting(true);
    onComplete(completionNote, reflectionType, reflectionText);
  };

  return (
    <div className="bg-[#FFF8E8] text-[#333333] p-6 min-h-screen flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#5BBF47] pixel-title">
          {NARRATIVE.reviewPhase}
        </span>
        <span className="text-sm text-[#333333]/40 pixel-title">
          {formatTime(timer.pomodoro_remaining_seconds)}
        </span>
      </div>
      <PixelProgressBar
        current={timer.pomodoro_remaining_seconds}
        total={timer.pomodoro_total_seconds}
        color="grass"
      />

      <label className="text-sm">
        ✅ 你完成了什么？<span className="text-[#EE4433]">*</span>
      </label>
      <textarea
        value={completionNote}
        onChange={(e) => setCompletionNote(e.target.value)}
        className="bg-white outline-2 outline-[#333333] outline-offset-[-2px] p-3 text-sm resize-none h-24 text-[#333333] placeholder-[#333333]/40"
        placeholder="简要描述本次完成的内容..."
        autoFocus
      />

      <label className="text-sm">💡 反思（选填）</label>
      <div className="flex flex-col gap-1">
        {reflectionOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              setReflectionType(
                reflectionType === opt.value ? null : opt.value
              )
            }
            className={`text-left text-xs px-2 py-1 ${
              reflectionType === opt.value
                ? "bg-[#FFD93D]/30 text-[#333333]"
                : "bg-white text-[#333333]/60 hover:bg-[#DDEEFF]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {reflectionType && (
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          className="bg-white outline-2 outline-[#333333] outline-offset-[-2px] p-3 text-sm resize-none h-16 text-[#333333] placeholder-[#333333]/40"
          placeholder="写下你的想法..."
        />
      )}

      <PixelButton
        variant="cta"
        size="lg"
        onClick={handleSubmit}
        disabled={!completionNote.trim() || submitting}
        className="mt-auto w-full"
      >
        {submitting ? "处理中..." : NARRATIVE.reviewComplete}
      </PixelButton>
    </div>
  );
}
