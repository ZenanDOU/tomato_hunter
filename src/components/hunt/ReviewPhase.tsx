import { memo, useCallback, useEffect, useState } from "react";
import type { TimerState, ReflectionType } from "../../types";
import { useInventoryStore } from "../../stores/inventoryStore";
import { PixelProgressBar } from "../common/PixelProgressBar";
import { PixelButton } from "../common/PixelButton";
import { formatTime } from "../../lib/format";
import { NARRATIVE } from "../../lib/narrative";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface ReviewPhaseProps {
  timer: TimerState;
  onComplete: (
    note: string,
    reflType: ReflectionType | null,
    reflText: string
  ) => void | Promise<void>;
}

const reflectionOptions: { value: ReflectionType; label: string }[] = [
  { value: "smooth", label: "很顺利，我做对了什么？" },
  { value: "difficult", label: "遇到困难，下次如何改进？" },
  { value: "discovery", label: "有新的想法或发现？" },
];

const SKIP_REVIEW_ID = 12;

export const ReviewPhase = memo(function ReviewPhase({ timer, onComplete }: ReviewPhaseProps) {
  const [completionNote, setCompletionNote] = useState("");
  const [reflectionType, setReflectionType] =
    useState<ReflectionType | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { ownedEquipment, useConsumable, fetchAll } = useInventoryStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const skipReviewQty = ownedEquipment.find((e) => e.equipment.id === SKIP_REVIEW_ID)?.quantity || 0;

  const handleSkipReview = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const ok = await useConsumable(SKIP_REVIEW_ID);
      if (ok) {
        await onComplete("（跳过复盘）", null, "");
      } else {
        setSubmitting(false);
      }
    } catch (error) {
      console.error("[ReviewPhase] skip failed:", error);
      setSubmitting(false);
    }
  }, [submitting, useConsumable, onComplete]);

  const handleSubmit = useCallback(async () => {
    if (!completionNote.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onComplete(completionNote, reflectionType, reflectionText);
    } catch (error) {
      console.error("[ReviewPhase] submit failed:", error);
      setSubmitting(false);
    }
  }, [completionNote, submitting, onComplete, reflectionType, reflectionText]);

  return (
    <div
      className="bg-cream text-pixel-black p-6 min-h-screen flex flex-col gap-4"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea")) return;
        getCurrentWindow().startDragging();
      }}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-grass pixel-title">
          {NARRATIVE.reviewPhase}
        </span>
        <span className="text-sm text-pixel-black/40 pixel-title">
          {formatTime(timer.pomodoro_remaining_seconds)}
        </span>
      </div>
      <PixelProgressBar
        current={timer.pomodoro_remaining_seconds}
        total={timer.pomodoro_total_seconds}
        color="grass"
      />

      <label className="text-sm">
        ✅ 你完成了什么？<span className="text-tomato">*</span>
      </label>
      <textarea
        value={completionNote}
        onChange={(e) => setCompletionNote(e.target.value)}
        className="bg-white outline-2 outline-pixel-black outline-offset-[-2px] p-3 text-sm resize-none h-24 text-pixel-black placeholder-pixel-black/40"
        placeholder="简要描述本次完成的内容..."
        autoFocus
        aria-label="完成内容"
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
                ? "bg-sunny/30 text-pixel-black"
                : "bg-white text-pixel-black/60 hover:bg-cloud"
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
          className="bg-white outline-2 outline-pixel-black outline-offset-[-2px] p-3 text-sm resize-none h-16 text-pixel-black placeholder-pixel-black/40"
          placeholder="写下你的想法..."
          aria-label="反思内容"
        />
      )}

      <div className="flex gap-2 mt-auto">
        {skipReviewQty > 0 && (
          <button
            onClick={handleSkipReview}
            disabled={submitting}
            className="text-xs text-pixel-black/40 hover:text-pixel-black px-3 py-2 flex items-center gap-1"
            title="复盘跳过 · 跳过本次复盘"
          >
            ⏭ 跳过<span className="text-[10px]">×{skipReviewQty}</span>
          </button>
        )}
        <PixelButton
          variant="cta"
          size="lg"
          onClick={handleSubmit}
          disabled={!completionNote.trim() || submitting}
          className="flex-1"
        >
          {submitting ? "处理中..." : NARRATIVE.reviewComplete}
        </PixelButton>
      </div>
    </div>
  );
});
