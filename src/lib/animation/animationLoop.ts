type TickCallback = (deltaMs: number) => void;

interface Registration {
  callback: TickCallback;
  fpsTarget: number;
  lastTick: number;
}

let registrations: Registration[] = [];
let rafId: number | null = null;

function loop(now: number) {
  rafId = requestAnimationFrame(loop);

  for (const reg of registrations) {
    const interval = 1000 / reg.fpsTarget;
    const elapsed = now - reg.lastTick;
    if (elapsed >= interval) {
      reg.lastTick = now - (elapsed % interval);
      reg.callback(elapsed);
    }
  }
}

/**
 * Register a callback to be called at the target FPS.
 * Returns an unregister function.
 */
export function registerAnimation(callback: TickCallback, fpsTarget: number): () => void {
  const reg: Registration = { callback, fpsTarget, lastTick: performance.now() };
  registrations.push(reg);

  // Start loop if first registration
  if (registrations.length === 1 && rafId === null) {
    rafId = requestAnimationFrame(loop);
  }

  return () => {
    registrations = registrations.filter((r) => r !== reg);
    if (registrations.length === 0 && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
