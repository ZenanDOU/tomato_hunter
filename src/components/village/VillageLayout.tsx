import { useState, useEffect } from "react";
import { Inbox } from "./Inbox";
import { HuntList } from "./HuntList";
import { DailyPlanBoard } from "./DailyPlanBoard";
import { Workshop } from "./Workshop";
import { TomatoSanctuary } from "../journal/TomatoSanctuary";
import { NARRATIVE, SUMMONING_STORY } from "../../lib/narrative";
import { PixelButton } from "../common/PixelButton";
import { PixelCard } from "../common/PixelCard";

type Tab = "inbox" | "hunts" | "plan" | "workshop" | "journal";

const LORE_SEEN_KEY = "tomato_hunter_lore_seen";

export function VillageLayout() {
  const [tab, setTab] = useState<Tab>("plan");
  const [showLore, setShowLore] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LORE_SEEN_KEY)) {
      setShowLore(true);
      localStorage.setItem(LORE_SEEN_KEY, "1");
    }
  }, []);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "inbox", label: NARRATIVE.inbox, icon: "🔍" },
    { key: "hunts", label: NARRATIVE.huntList, icon: "⚔️" },
    { key: "plan", label: NARRATIVE.plan, icon: "📋" },
    { key: "workshop", label: "工坊", icon: "🔨" },
    { key: "journal", label: NARRATIVE.journal, icon: "🍅" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#DDEEFF]">
      {/* Header — 天空蓝 */}
      <header className="flex items-center gap-2 px-4 py-3 bg-[#55BBEE] border-b-2 border-[#333333]">
        <h1 className="pixel-title text-lg font-bold text-white drop-shadow-[1px_1px_0_#333333]">
          🍅 Tomato Hunter
        </h1>
        <button
          onClick={() => setShowLore(true)}
          className="text-xs text-white/70 hover:text-white"
          title="世界观"
        >
          📜
        </button>
        <div className="flex gap-1 ml-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1 text-sm outline-2 outline-[#333333] outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] ${
                tab === t.key
                  ? "bg-[#EE4433] text-white"
                  : "bg-white text-[#333333] hover:bg-[#FFD93D]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 内容区 — 淡蓝（白色卡片浮在上面） */}
      <main className="flex-1 overflow-y-auto p-4">
        {tab === "inbox" && <Inbox />}
        {tab === "hunts" && <HuntList />}
        {tab === "plan" && <DailyPlanBoard />}
        {tab === "workshop" && <Workshop />}
        {tab === "journal" && <TomatoSanctuary />}
      </main>

      {/* Lore 弹窗 */}
      {showLore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PixelCard bg="dark" padding="lg" className="max-w-sm w-full flex flex-col gap-4">
            <pre className="pixel-title text-sm whitespace-pre-wrap leading-relaxed text-[#FFD93D]">
              {SUMMONING_STORY}
            </pre>
            <PixelButton variant="cta" size="lg" onClick={() => setShowLore(false)}>
              ⚔️ 开始战斗
            </PixelButton>
          </PixelCard>
        </div>
      )}
    </div>
  );
}
