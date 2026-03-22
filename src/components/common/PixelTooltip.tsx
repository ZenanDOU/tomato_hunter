import { useEffect, useState, useCallback, type ReactNode } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right" | "center";

interface PixelTooltipProps {
  targetSelector?: string;
  position?: TooltipPosition;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function PixelTooltip({
  targetSelector,
  position = "bottom",
  title,
  description,
  children,
  actions,
}: PixelTooltipProps) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!targetSelector || position === "center") {
      setStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 12;

    switch (position) {
      case "bottom":
        setStyle({
          position: "fixed",
          top: r.bottom + gap,
          left: r.left + r.width / 2,
          transform: "translateX(-50%)",
        });
        break;
      case "top":
        setStyle({
          position: "fixed",
          bottom: window.innerHeight - r.top + gap,
          left: r.left + r.width / 2,
          transform: "translateX(-50%)",
        });
        break;
      case "left":
        setStyle({
          position: "fixed",
          top: r.top + r.height / 2,
          right: window.innerWidth - r.left + gap,
          transform: "translateY(-50%)",
        });
        break;
      case "right":
        setStyle({
          position: "fixed",
          top: r.top + r.height / 2,
          left: r.right + gap,
          transform: "translateY(-50%)",
        });
        break;
    }
  }, [targetSelector, position]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  const arrowClass = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#333333]",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#333333]",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#333333]",
    right: "left-[-6px] top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#333333]",
    center: "",
  };

  return (
    <div
      className="z-[101] max-w-xs"
      style={style}
    >
      <div className="bg-cream rounded p-3 pixel-border shadow-[2px_2px_0px_#333333] relative">
        {position !== "center" && (
          <div className={`absolute w-0 h-0 ${arrowClass[position]}`} />
        )}
        {title && (
          <div className="font-bold text-sm text-pixel-black mb-1">{title}</div>
        )}
        {description && (
          <p className="text-xs text-pixel-black/80 leading-relaxed">{description}</p>
        )}
        {children}
        {actions && (
          <div className="flex items-center justify-between mt-2 gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
