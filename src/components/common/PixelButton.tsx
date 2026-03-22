import { audioManager } from "../../lib/audio";

interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "cta" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
}

const VARIANT_STYLES = {
  default: {
    base: "bg-orange text-white hover:bg-[#FFAA66] active:bg-[#DD6622]",
    disabled: "bg-[#CCCCCC] text-[#999999]",
  },
  cta: {
    base: "bg-tomato text-white hover:bg-[#FF6655] active:bg-[#CC2211]",
    disabled: "bg-[#CCCCCC] text-[#999999]",
  },
  danger: {
    base: "bg-tomato text-white hover:bg-[#FF6655] active:bg-[#CC2211]",
    disabled: "bg-[#CCCCCC] text-[#999999]",
  },
  success: {
    base: "bg-grass text-white hover:bg-[#6DD55A] active:bg-[#4AA638]",
    disabled: "bg-[#CCCCCC] text-[#999999]",
  },
  ghost: {
    base: "bg-white text-pixel-black hover:bg-cloud active:bg-[#CCDDEE]",
    disabled: "bg-[#EEEEEE] text-[#AAAAAA]",
  },
};

const SIZE_STYLES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-base font-bold",
};

export function PixelButton({
  variant = "default",
  size = "md",
  disabled,
  className = "",
  children,
  ...props
}: PixelButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const stateClass = disabled ? v.disabled : v.base;

  return (
    <button
      disabled={disabled}
      className={`rounded-none outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] hover:translate-y-[-1px] hover:shadow-[2px_3px_0_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-[var(--transition-fast,150ms)] cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] ${s} ${stateClass} ${className}`}
      {...props}
      onClick={(e) => {
        audioManager.playSfx("button-click");
        props.onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
