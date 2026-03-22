import { useEffect, useRef, useState, type ReactNode } from "react";

interface PixelTransitionProps {
  transitionKey: string;
  children: ReactNode;
  className?: string;
}

/**
 * Pixel-style scanline slide-in transition for tab switches.
 * Wraps content and plays a steps(4) slide-down animation on key change.
 */
export function PixelTransition({
  transitionKey,
  children,
  className = "",
}: PixelTransitionProps) {
  const [animating, setAnimating] = useState(false);
  const prevKey = useRef(transitionKey);

  useEffect(() => {
    if (transitionKey !== prevKey.current) {
      prevKey.current = transitionKey;
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [transitionKey]);

  return (
    <div
      className={`${className} ${animating ? "scanline-enter" : ""}`}
      style={{ willChange: animating ? "clip-path" : "auto" }}
    >
      {children}
    </div>
  );
}
