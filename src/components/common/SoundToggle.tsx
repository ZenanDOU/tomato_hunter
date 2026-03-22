import { useSettingsStore } from "../../stores/settingsStore";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { soundEnabled, toggleSound } = useSettingsStore();

  return (
    <button
      onClick={toggleSound}
      className={`w-8 h-8 flex items-center justify-center outline-2 outline-pixel-black outline-offset-[-2px] bg-white hover:bg-cloud active:bg-[#CCDDEE] cursor-pointer text-base ${className}`}
      title={soundEnabled ? "关闭音效" : "开启音效"}
      aria-label={soundEnabled ? "关闭音效" : "开启音效"}
      aria-pressed={soundEnabled}
    >
      {soundEnabled ? "🔊" : "🔇"}
    </button>
  );
}
