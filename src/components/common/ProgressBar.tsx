interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  color?: string;
}

export function ProgressBar({
  current,
  total,
  className = "",
  color = "bg-amber-500",
}: ProgressBarProps) {
  const pct =
    total > 0
      ? Math.max(0, Math.min(100, ((total - current) / total) * 100))
      : 0;
  return (
    <div className={`w-full bg-stone-700 rounded-full h-3 ${className}`}>
      <div
        className={`${color} h-3 rounded-full transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
