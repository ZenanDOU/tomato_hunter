import { useRef, useEffect } from "react";

export interface SpriteData {
  width: number;   // 16
  height: number;  // 16
  pixels: string;  // each char is palette index ('0'=transparent, '1'=color1, etc.)
  palette: string[]; // ["transparent", "#EE4433", "#333333", ...]
}

interface PixelSpriteProps {
  sprite: SpriteData;
  scale?: number;  // 2, 3, or 4 (default 3)
  className?: string;
}

export function PixelSprite({ sprite, scale = 3, className }: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sprite) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = sprite.width * scale;
    const h = sprite.height * scale;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    for (let y = 0; y < sprite.height; y++) {
      for (let x = 0; x < sprite.width; x++) {
        const idx = y * sprite.width + x;
        const paletteChar = sprite.pixels[idx];
        if (!paletteChar) continue;

        const paletteIndex = parseInt(paletteChar, 10);
        if (isNaN(paletteIndex) || paletteIndex === 0) continue; // 0 = transparent

        const color = sprite.palette[paletteIndex];
        if (!color || color === "transparent") continue;

        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }, [sprite, scale]);

  if (!sprite) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: "pixelated",
        width: sprite.width * scale,
        height: sprite.height * scale,
      }}
    />
  );
}
