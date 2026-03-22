import { synthEngine } from './SynthEngine';

let listenersBound = false;

/**
 * Bind window focus/blur listeners to suspend/resume AudioContext.
 * Call once after synthEngine.init().
 */
export function bindLifecycleListeners(): void {
  if (listenersBound) return;
  listenersBound = true;

  window.addEventListener('blur', () => {
    synthEngine.suspend();
  });

  window.addEventListener('focus', () => {
    if (synthEngine.enabled) {
      synthEngine.resume();
    }
  });
}

/**
 * Ensure AudioContext is initialized on first user interaction.
 * Attach to document, removes itself after first trigger.
 */
export function bindInitOnInteraction(onInit?: () => void): void {
  const handler = () => {
    if (!synthEngine.initialized) {
      synthEngine.init();
      bindLifecycleListeners();
      onInit?.();
    }
    document.removeEventListener('click', handler);
    document.removeEventListener('keydown', handler);
  };
  document.addEventListener('click', handler, { once: false });
  document.addEventListener('keydown', handler, { once: false });
}
