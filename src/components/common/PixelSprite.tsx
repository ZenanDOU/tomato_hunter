import { useRef, useEffect, useCallback } from "react";
import type { SpriteData, LegacySpriteData, SpriteAnimation } from "../../types";

interface PixelSpriteProps {
  sprite: SpriteData | LegacySpriteData;
  scale?: number;
  animation?: SpriteAnimation;
  className?: string;
}

function isNewFormat(s: SpriteData | LegacySpriteData): s is SpriteData {
  return 'frames' in s;
}

export function PixelSprite({
  sprite,
  scale = 3,
  animation = "idle",
  className,
}: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const tickRef = useRef(0);
  const animDoneRef = useRef(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sprite) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isNewFormat(sprite)) {
      // New 32x32 multi-frame format
      const size = 32;
      const w = size * scale;
      const h = size * scale;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      const frames = sprite.frames[animation] || sprite.frames.idle;
      if (!frames || frames.length === 0) return;

      const frameIdx = animDoneRef.current
        ? frames.length - 1
        : frameRef.current % frames.length;
      const frame = frames[frameIdx];

      for (let y = 0; y < size; y++) {
        if (!frame[y]) continue;
        for (let x = 0; x < size; x++) {
          const paletteIndex = frame[y][x];
          if (paletteIndex === 0) continue;
          const color = sprite.palette[paletteIndex];
          if (!color || color === "transparent") continue;
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    } else {
      // Legacy 16x16 string format — render at 2x internal scale
      const lw = sprite.width;
      const lh = sprite.height;
      const w = lw * scale;
      const h = lh * scale;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      for (let y = 0; y < lh; y++) {
        for (let x = 0; x < lw; x++) {
          const idx = y * lw + x;
          const ch = sprite.pixels[idx];
          if (!ch) continue;
          const pi = parseInt(ch, 10);
          if (isNaN(pi) || pi === 0) continue;
          const color = sprite.palette[pi];
          if (!color || color === "transparent") continue;
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }, [sprite, scale, animation]);

  useEffect(() => {
    frameRef.current = 0;
    tickRef.current = 0;
    animDoneRef.current = false;
    render();

    if (!isNewFormat(sprite)) return; // legacy = static, no animation loop

    const FPS = 4;
    const FRAME_INTERVAL = 1000 / FPS;
    let lastTime = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      const delta = now - lastTime;
      if (delta < FRAME_INTERVAL) return;
      lastTime = now - (delta % FRAME_INTERVAL);

      tickRef.current++;

      if (animation === "idle") {
        frameRef.current = tickRef.current % 2;
      } else if (animation === "hit") {
        if (tickRef.current >= 3) {
          animDoneRef.current = true;
        } else {
          frameRef.current = tickRef.current % 1;
        }
      } else if (animation === "defeat") {
        if (tickRef.current >= 2) {
          animDoneRef.current = true;
        } else {
          frameRef.current = tickRef.current;
        }
      }

      render();
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [sprite, animation, render]);

  if (!sprite) return null;

  const displaySize = isNewFormat(sprite)
    ? 32 * scale
    : sprite.width * scale;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: "pixelated",
        width: displaySize,
        height: displaySize,
      }}
    />
  );
}
