import { useEffect } from "react";

export interface KeyboardShortcutConfig {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
}

function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea";
}

export function useKeyboardShortcuts(config: KeyboardShortcutConfig) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          config.onEscape?.();
          break;
        case "Enter":
          if (!isTextInput(e.target)) {
            config.onEnter?.();
          }
          break;
        case " ":
          if (!isTextInput(e.target)) {
            e.preventDefault();
            config.onSpace?.();
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [config.onEscape, config.onEnter, config.onSpace]);
}
