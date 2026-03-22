interface PixelProgressBarProps {
  current: number;
  total: number;
  color?: "tomato" | "grass" | "orange";
  className?: string;
}

const FILL_COLORS = {
  tomato: "bg-tomato",
  grass: "bg-grass",
  orange: "bg-orange",
};

export function PixelProgressBar({
  current,
  total,
  color = "tomato",
  className = "",
}: PixelProgressBarProps) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;

  return (
    <div
      className={`h-4 bg-white outline-2 outline-pixel-black outline-offset-[-2px] ${className}`}
    >
      <div
        className={`h-full ${FILL_COLORS[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
