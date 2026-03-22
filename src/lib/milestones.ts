import type { HunterStats } from "../types";

export interface MilestoneDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: HunterStats & { craftedCount: number; perfectDays: number; streakDays: number }) => {
    achieved: boolean;
    progress?: { current: number; target: number };
  };
}

export const MILESTONES: MilestoneDefinition[] = [
  {
    id: "first-kill",
    name: "初猎达成",
    description: "击杀第一只怪物",
    icon: "⚔️",
    check: (s) => ({
      achieved: s.totalKills >= 1,
      progress: { current: Math.min(s.totalKills, 1), target: 1 },
    }),
  },
  {
    id: "pomodoro-10",
    name: "番茄收集者",
    description: "完成 10 个番茄钟",
    icon: "🍅",
    check: (s) => ({
      achieved: s.totalPomodoros >= 10,
      progress: { current: Math.min(s.totalPomodoros, 10), target: 10 },
    }),
  },
  {
    id: "first-craft",
    name: "入门铁匠",
    description: "锻造第一件装备",
    icon: "🔨",
    check: (s) => ({
      achieved: s.craftedCount >= 1,
      progress: { current: Math.min(s.craftedCount, 1), target: 1 },
    }),
  },
  {
    id: "species-5",
    name: "生态观察者",
    description: "发现 5 种怪物",
    icon: "🔬",
    check: (s) => ({
      achieved: s.speciesDiscovered >= 5,
      progress: { current: Math.min(s.speciesDiscovered, 5), target: 5 },
    }),
  },
  {
    id: "kill-10",
    name: "熟练猎手",
    description: "击杀 10 只怪物",
    icon: "🗡️",
    check: (s) => ({
      achieved: s.totalKills >= 10,
      progress: { current: Math.min(s.totalKills, 10), target: 10 },
    }),
  },
  {
    id: "perfect-day",
    name: "完美狩猎日",
    description: "单日完成全部每日计划",
    icon: "🌟",
    check: (s) => ({
      achieved: s.perfectDays >= 1,
      progress: { current: Math.min(s.perfectDays, 1), target: 1 },
    }),
  },
  {
    id: "streak-7",
    name: "不懈追踪者",
    description: "连续 7 天有击杀",
    icon: "🔥",
    check: (s) => ({
      achieved: s.streakDays >= 7,
      progress: { current: Math.min(s.streakDays, 7), target: 7 },
    }),
  },
  {
    id: "pomodoro-50",
    name: "半百番茄",
    description: "完成 50 个番茄钟",
    icon: "🏆",
    check: (s) => ({
      achieved: s.totalPomodoros >= 50,
      progress: { current: Math.min(s.totalPomodoros, 50), target: 50 },
    }),
  },
  {
    id: "species-10",
    name: "野外博物学家",
    description: "发现 10 种怪物",
    icon: "📖",
    check: (s) => ({
      achieved: s.speciesDiscovered >= 10,
      progress: { current: Math.min(s.speciesDiscovered, 10), target: 10 },
    }),
  },
  {
    id: "all-equipment",
    name: "大师铁匠",
    description: "锻造全部可锻造装备",
    icon: "⚒️",
    check: (s) => ({
      achieved: s.craftedCount >= 4,
      progress: { current: Math.min(s.craftedCount, 4), target: 4 },
    }),
  },
  {
    id: "species-15",
    name: "生态学家",
    description: "发现全部 15 种怪物",
    icon: "🧬",
    check: (s) => ({
      achieved: s.speciesDiscovered >= 15,
      progress: { current: Math.min(s.speciesDiscovered, 15), target: 15 },
    }),
  },
  {
    id: "pomodoro-100",
    name: "百战猎人",
    description: "完成 100 个番茄钟",
    icon: "👑",
    check: (s) => ({
      achieved: s.totalPomodoros >= 100,
      progress: { current: Math.min(s.totalPomodoros, 100), target: 100 },
    }),
  },
  {
    id: "kill-50",
    name: "传奇猎手",
    description: "击杀 50 只怪物",
    icon: "🐉",
    check: (s) => ({
      achieved: s.totalKills >= 50,
      progress: { current: Math.min(s.totalKills, 50), target: 50 },
    }),
  },
];
