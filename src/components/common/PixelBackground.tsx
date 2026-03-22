import { useRef, useEffect, useCallback } from "react";
import type { TaskCategory } from "../../types";

// Seeded PRNG for deterministic backgrounds
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
  color: string;
}

type SceneType = "village" | "rest" | TaskCategory;

interface SceneConfig {
  bgColor: string;
  elements: (ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) => void;
  particles: { count: number; color: string; vy: number; size: number };
}

const SCENES: Record<SceneType, SceneConfig> = {
  village: {
    bgColor: "#DDEEFF",
    elements: (ctx, w, h, rand) => {
      // Sky gradient
      for (let y = 0; y < h * 0.6; y += 2) {
        const t = y / (h * 0.6);
        const r = Math.floor(221 + (255 - 221) * t);
        const g = Math.floor(238 + (255 - 238) * t);
        const b = 255;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, y, w, 2);
      }
      // Mountains (3 layers)
      const layers = [
        { y: h * 0.45, color: "#AABBCC", amplitude: 20 },
        { y: h * 0.5, color: "#99AACC", amplitude: 30 },
        { y: h * 0.55, color: "#8899BB", amplitude: 25 },
      ];
      for (const layer of layers) {
        ctx.fillStyle = layer.color;
        for (let x = 0; x < w; x += 2) {
          const mountainY = layer.y + Math.sin(x * 0.02 + rand() * 10) * layer.amplitude;
          ctx.fillRect(x, mountainY, 2, h - mountainY);
        }
      }
      // Grass
      ctx.fillStyle = "#5BBF47";
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      ctx.fillStyle = "#4AA638";
      for (let x = 0; x < w; x += 4) {
        const grassH = 4 + rand() * 8;
        ctx.fillRect(x, h * 0.7 - grassH, 2, grassH);
      }
      // Scattered trees
      for (let i = 0; i < 6; i++) {
        const tx = rand() * w;
        const ty = h * 0.65 + rand() * (h * 0.1);
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(tx, ty, 4, 12);
        ctx.fillStyle = "#2D5A1E";
        ctx.fillRect(tx - 6, ty - 8, 16, 10);
      }
    },
    particles: { count: 0, color: "", vy: 0, size: 0 },
  },
  rest: {
    bgColor: "#88DDAA",
    elements: (ctx, w, h, rand) => {
      // Light green base
      ctx.fillStyle = "#88DDAA";
      ctx.fillRect(0, 0, w, h);
      // Grass strip
      ctx.fillStyle = "#5BBF47";
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      ctx.fillStyle = "#4AA638";
      for (let x = 0; x < w; x += 4) {
        const grassH = 3 + rand() * 6;
        ctx.fillRect(x, h * 0.8 - grassH, 2, grassH);
      }
      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (let i = 0; i < 3; i++) {
        const cx = rand() * w;
        const cy = h * 0.15 + rand() * (h * 0.2);
        for (let j = 0; j < 5; j++) {
          ctx.fillRect(cx + j * 8 - 16, cy + (j % 2) * 4, 10, 6);
        }
      }
    },
    particles: { count: 0, color: "", vy: 0, size: 0 },
  },
  work: {
    bgColor: "#2A2A2A",
    elements: (ctx, w, h, rand) => {
      ctx.fillStyle = "#2A2A2A";
      ctx.fillRect(0, 0, w, h);
      // Gear outlines
      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const gx = rand() * w;
        const gy = rand() * h;
        const gr = 15 + rand() * 25;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.stroke();
        // Teeth
        for (let t = 0; t < 8; t++) {
          const angle = (t / 8) * Math.PI * 2;
          ctx.fillStyle = "#444444";
          ctx.fillRect(gx + Math.cos(angle) * gr - 2, gy + Math.sin(angle) * gr - 2, 4, 4);
        }
      }
      // Pipes
      ctx.fillStyle = "#3A3A3A";
      for (let i = 0; i < 3; i++) {
        const py = rand() * h;
        ctx.fillRect(0, py, w, 4);
      }
    },
    particles: { count: 15, color: "#FF8844", vy: -0.3, size: 2 },
  },
  creative: {
    bgColor: "#2A1A3A",
    elements: (ctx, w, h, rand) => {
      ctx.fillStyle = "#2A1A3A";
      ctx.fillRect(0, 0, w, h);
      // Picture frames
      ctx.strokeStyle = "#443355";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const fx = 20 + rand() * (w - 60);
        const fy = 20 + rand() * (h - 60);
        ctx.strokeRect(fx, fy, 30 + rand() * 20, 25 + rand() * 15);
      }
    },
    particles: { count: 12, color: "#8877AA", vy: 0.4, size: 2 },
  },
  study: {
    bgColor: "#1A2A4A",
    elements: (ctx, w, h, rand) => {
      ctx.fillStyle = "#1A2A4A";
      ctx.fillRect(0, 0, w, h);
      // Bookshelves
      ctx.fillStyle = "#223355";
      for (let i = 0; i < 4; i++) {
        const sy = rand() * h;
        ctx.fillRect(0, sy, w, 3);
        // Books on shelf
        for (let b = 0; b < 8; b++) {
          const bx = rand() * w;
          const bh = 8 + rand() * 12;
          ctx.fillStyle = ["#8B4513", "#3366AA", "#EE4433", "#5BBF47"][Math.floor(rand() * 4)];
          ctx.fillRect(bx, sy - bh, 4, bh);
        }
        ctx.fillStyle = "#223355";
      }
    },
    particles: { count: 10, color: "#FFD93D", vy: -0.2, size: 2 },
  },
  life: {
    bgColor: "#1A3A2A",
    elements: (ctx, w, h, rand) => {
      ctx.fillStyle = "#1A3A2A";
      ctx.fillRect(0, 0, w, h);
      // Vines
      ctx.strokeStyle = "#2D5A1E";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const vx = rand() * w;
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        for (let y = 0; y < h; y += 10) {
          ctx.lineTo(vx + Math.sin(y * 0.1) * 15, y);
        }
        ctx.stroke();
      }
      // Small flowers
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = ["#FFD93D", "#EE4433", "#FFCCDD"][Math.floor(rand() * 3)];
        ctx.fillRect(rand() * w, rand() * h, 3, 3);
      }
    },
    particles: { count: 12, color: "#FFCCDD", vy: 0.3, size: 2 },
  },
  other: {
    bgColor: "#1A2A2A",
    elements: (ctx, w, h, rand) => {
      ctx.fillStyle = "#1A2A2A";
      ctx.fillRect(0, 0, w, h);
      // Water ripples
      ctx.strokeStyle = "#223333";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const rx = rand() * w;
        const ry = h * 0.6 + rand() * (h * 0.3);
        ctx.beginPath();
        ctx.ellipse(rx, ry, 20 + rand() * 30, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    particles: { count: 15, color: "#55AAAA", vy: -0.5, size: 3 },
  },
};

// Category → scene type mapping
const CATEGORY_SCENE: Record<TaskCategory, SceneType> = {
  work: "work",
  creative: "creative",
  study: "study",
  life: "life",
  other: "other",
};

export function PixelBackground({
  scene,
  category,
  className = "",
}: {
  scene?: "village" | "rest";
  category?: TaskCategory;
  className?: string;
}) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const drawnRef = useRef(false);

  const sceneType: SceneType = scene || (category ? CATEGORY_SCENE[category] : "village");
  const config = SCENES[sceneType];

  // Draw static background once
  const drawBg = useCallback(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas || drawnRef.current) return;
    drawnRef.current = true;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, w, h);
    const rand = seededRandom(42);
    config.elements(ctx, w, h, rand);
  }, [config]);

  // Initialize particles
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas || config.particles.count === 0) return;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const rand = seededRandom(123);
    particlesRef.current = Array.from({ length: config.particles.count }, () => ({
      x: rand() * w,
      y: rand() * h,
      vx: (rand() - 0.5) * 0.5,
      vy: config.particles.vy,
      size: config.particles.size,
      opacity: 0.3 + rand() * 0.5,
      opacityDir: rand() > 0.5 ? 0.02 : -0.02,
      color: config.particles.color,
    }));

    let rafId: number;
    let lastTick = performance.now();
    const INTERVAL = 1000 / 8; // 8fps

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (now - lastTick < INTERVAL) return;
      lastTick = now;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opacityDir;
        if (p.opacity > 0.8 || p.opacity < 0.1) p.opacityDir *= -1;

        // Wrap
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [config]);

  useEffect(() => {
    drawBg();
  }, [drawBg]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ zIndex: -1 }}>
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      {config.particles.count > 0 && (
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
}
