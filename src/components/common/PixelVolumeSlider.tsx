import { useCallback, useRef } from "react";

interface PixelVolumeSliderProps {
  value: number; // 0-100
  onChange: (v: number) => void;
  className?: string;
}

export function PixelVolumeSlider({
  value,
  onChange,
  className = "",
}: PixelVolumeSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      onChange(Math.round(pct));
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteraction(e.clientX);
    const onMove = (ev: MouseEvent) => handleInteraction(ev.clientX);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={barRef}
      className={`h-4 bg-white outline-2 outline-pixel-black outline-offset-[-2px] cursor-pointer relative select-none ${className}`}
      onMouseDown={handleMouseDown}
    >
      <div
        className="h-full bg-sky"
        style={{ width: `${value}%` }}
      />
      {/* Pixel thumb */}
      <div
        className="absolute top-[-2px] w-3 h-5 bg-pixel-black"
        style={{ left: `calc(${value}% - 6px)` }}
      />
    </div>
  );
}
