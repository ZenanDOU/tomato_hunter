import { useState, useEffect } from "react";
import { HuntBoard } from "./HuntBoard";
import { DailyPlanBoard } from "./DailyPlanBoard";
import { Workshop } from "./Workshop";
import { TomatoFarm } from "../journal/TomatoFarm";
import { HunterProfile } from "../profile/HunterProfile";
import { NARRATIVE, SUMMONING_STORY } from "../../lib/narrative";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";
import { PixelBackground } from "../common/PixelBackground";
import { PixelTransition } from "../common/PixelTransition";
import { audioManager } from "../../lib/audio";
import { SoundToggle } from "../common/SoundToggle";
import { PixelVolumeSlider } from "../common/PixelVolumeSlider";
import { useSettingsStore } from "../../stores/settingsStore";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

type Tab = "plan" | "hunts" | "workshop" | "journal" | "profile";

const LORE_SEEN_KEY = "tomato_hunter_lore_seen";

export function VillageLayout() {
  const [tab, setTab] = useState<Tab>("plan");
  const [showLore, setShowLore] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume } = useSettingsStore();

  useKeyboardShortcuts({
    onEscape: () => {
      if (showLore) setShowLore(false);
      else if (showAudioSettings) setShowAudioSettings(false);
    },
  });

  useEffect(() => {
    if (!localStorage.getItem(LORE_SEEN_KEY)) {
      setShowLore(true);
      localStorage.setItem(LORE_SEEN_KEY, "1");
    }
  }, []);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "plan", label: NARRATIVE.plan, icon: "📋" },
    { key: "hunts", label: "狩猎", icon: "⚔️" },
    { key: "workshop", label: "工坊", icon: "🔨" },
    { key: "journal", label: "农场", icon: "🌱" },
    { key: "profile", label: "档案", icon: "📜" },
  ];

  return (
    <div className="flex flex-col h-screen bg-cloud relative">
      <PixelBackground scene="village" />
      {/* Header — 天空蓝 */}
      <header className="flex items-center gap-2 px-4 py-3 bg-sky border-b-2 border-pixel-black">
        <h1 className="pixel-title text-lg font-bold text-white drop-shadow-[1px_1px_0_#333333]">
          🍅 Tomato Hunter
        </h1>
        <button
          onClick={() => { setShowLore(true); audioManager.playSfx("menu-open"); }}
          className="text-xs text-white/70 hover:text-white"
          title="世界观"
          aria-label="世界观"
        >
          📜
        </button>
        <div className="relative">
          <SoundToggle />
          <button
            onClick={() => { setShowAudioSettings(!showAudioSettings); audioManager.playSfx(showAudioSettings ? "menu-close" : "menu-open"); }}
            className="w-8 h-8 flex items-center justify-center outline-2 outline-pixel-black outline-offset-[-2px] bg-white hover:bg-cloud text-base"
            title="音量设置"
            aria-label="音量设置"
            aria-expanded={showAudioSettings}
          >
            🎚️
          </button>
          {showAudioSettings && (
            <div className="absolute right-0 top-full mt-1 bg-white outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] p-3 z-50 w-48 flex flex-col gap-2" role="dialog" aria-label="音量设置">
              <div className="text-xs text-pixel-black font-bold">BGM</div>
              <PixelVolumeSlider value={bgmVolume} onChange={setBgmVolume} />
              <div className="text-xs text-pixel-black font-bold">SFX</div>
              <PixelVolumeSlider value={sfxVolume} onChange={setSfxVolume} />
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1 text-sm outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] transition-[background-color] duration-[var(--transition-fast,150ms)] ${
                tab === t.key
                  ? "bg-tomato text-white"
                  : "bg-white text-pixel-black hover:bg-sunny"
              }`}
              aria-current={tab === t.key ? "page" : undefined}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 内容区 — 淡蓝（白色卡片浮在上面） */}
      <main className="flex-1 overflow-y-auto p-4 relative">
        <PixelTransition transitionKey={tab}>
          {tab === "hunts" && <HuntBoard />}
          {tab === "plan" && <DailyPlanBoard />}
          {tab === "workshop" && <Workshop />}
          {tab === "journal" && <TomatoFarm />}
          {tab === "profile" && <HunterProfile />}
        </PixelTransition>
      </main>

      {/* Lore 弹窗 */}
      {showLore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="世界观">
          <PixelCard bg="dark" padding="lg" className="max-w-sm w-full flex flex-col gap-4">
            <pre className="pixel-title text-sm whitespace-pre-wrap leading-relaxed text-sunny">
              {SUMMONING_STORY}
            </pre>
            <PixelButton variant="cta" size="lg" onClick={() => { setShowLore(false); audioManager.playSfx("menu-close"); }}>
              ⚔️ 开始战斗
            </PixelButton>
          </PixelCard>
        </div>
      )}

    </div>
  );
}
