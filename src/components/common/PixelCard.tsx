interface PixelCardProps {
  bg?: "cloud" | "cream" | "dark";
  padding?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

const BG_STYLES = {
  cloud: "bg-white text-[#333333]",
  cream: "bg-[#FFF8E8] text-[#333333]",
  dark: "bg-[#443355] text-white",
};

const PADDING_STYLES = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function PixelCard({
  bg = "cloud",
  padding = "md",
  className = "",
  children,
}: PixelCardProps) {
  return (
    <div
      className={`outline-2 outline-[#333333] outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] ${BG_STYLES[bg]} ${PADDING_STYLES[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
