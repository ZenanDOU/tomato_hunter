interface PixelCardProps {
  bg?: "cloud" | "cream" | "dark";
  variant?: "default" | "elevated" | "sunken";
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

const BG_STYLES = {
  cloud: "bg-white text-pixel-black",
  cream: "bg-cream text-pixel-black",
  dark: "bg-monster-bg text-white",
};

const PADDING_STYLES = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

const VARIANT_STYLES = {
  default: "outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.25)]",
  elevated: "outline-2 outline-pixel-black outline-offset-[-2px] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.25)]",
  sunken: "outline-2 outline-[#CCCCCC] outline-offset-[-2px] shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]",
};

export function PixelCard({
  bg = "cloud",
  variant = "default",
  padding = "md",
  interactive = false,
  className = "",
  children,
}: PixelCardProps) {
  return (
    <div
      className={`${VARIANT_STYLES[variant]} ${BG_STYLES[bg]} ${PADDING_STYLES[padding]} ${interactive ? "transition-[outline-color] duration-[var(--transition-fast,150ms)] hover:outline-sky cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
