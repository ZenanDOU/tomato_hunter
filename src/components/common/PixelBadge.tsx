interface PixelBadgeProps {
  count: number;
  variant?: "default" | "success" | "info";
  className?: string;
}

const VARIANT_COLORS = {
  default: "bg-tomato text-white",
  success: "bg-grass text-white",
  info: "bg-sky text-white",
};

export function PixelBadge({
  count,
  variant = "default",
  className = "",
}: PixelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded-sm text-[10px] font-bold leading-none ${VARIANT_COLORS[variant]} ${className}`}
    >
      {count}
    </span>
  );
}
