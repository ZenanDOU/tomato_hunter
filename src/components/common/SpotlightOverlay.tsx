import { useEffect, useState, useCallback } from "react";

interface SpotlightOverlayProps {
  targetSelector?: string;
  padding?: number;
  onClick?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightOverlay({
  targetSelector,
  padding = 8,
  onClick,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(targetSelector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });
  }, [targetSelector, padding]);

  useEffect(() => {
    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(document.body);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [updateRect]);

  const clipPath = rect
    ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${rect.left}px ${rect.top}px,
        ${rect.left + rect.width}px ${rect.top}px,
        ${rect.left + rect.width}px ${rect.top + rect.height}px,
        ${rect.left}px ${rect.top + rect.height}px,
        ${rect.left}px ${rect.top}px
      )`
    : undefined;

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{
        backgroundColor: "rgba(0,0,0,0.7)",
        clipPath,
      }}
      onClick={onClick}
    />
  );
}
