// 世界观叙事系统 — 召唤勇者 × 拖延怪物 × 拯救番茄

/** UI 文案映射：旧术语 → 新叙事术语 */
export const NARRATIVE = {
  // Tab / Section 标题
  inbox: "侦查",
  inboxTitle: "🔍 未侦查的敌情",
  inboxEmpty: "没有待侦查的敌情",
  huntList: "讨伐",
  huntListTitle: "⚔️ 讨伐清单",
  huntListEmpty: "没有待讨伐的怪物，去侦查一些敌情吧",
  plan: "今日",
  planTitle: "📋 今日讨伐计划",
  journal: "收容所",
  journalTitle: "🍅 番茄收容所",
  journalEmpty: "还没有拯救记录，完成一次讨伐吧！",
  journalBack: "← 返回收容所",
  journalRecords: "战斗记录",

  // 操作按钮
  identify: "🔍 侦查敌情",
  sortie: "⚔️ 出击",
  retreat: "撤退",
  addToPlan: "+ 添加怪物到今日计划",
  noAddable: "没有可添加的怪物",

  // 结算文案
  settlementTitle: "🏆 战斗胜利！",
  settlementYouGot: "战利品：",
  settlementContinue: "继续",

  // 动态结算叙事
  monsterDefeated: "⚔️ 怪物被击败了！",
  tomatoRescued: "🍅 拯救了一颗番茄！",
  monsterHurt: "怪物受到重创，但还没倒下！",
  keepFighting: "继续战斗！",
  retreatMessage: "怪物太强了，暂时撤退！",
  retreatTomato: "被囚禁的番茄还在等着你回来...",

  // 番茄钟阶段
  prepPhase: "⚔️ 准备出击",
  reviewPhase: "📝 回顾阶段",
  reviewComplete: "完成复盘，领取战利品",

  // 其他
  overBudget: "⚠️ 今天的怪物太多了，体力不够！",
  waitingHunt: "等待出击...",
} as const;

/** 怪物描述生成 — 用于离线 fallback */
export const MONSTER_DESCRIPTIONS = [
  "这只拖延怪物从未完成的任务中诞生，正在囚禁农场的番茄",
  "一只由拖延情绪凝聚而成的怪物，它占据了番茄田的一角",
  "这个讨厌的家伙趁你不注意时溜进了农场，抓走了几颗番茄",
  "从虚空中降临的拖延怪物，它用懒散之力封印了番茄",
  "一只以拖延为食的怪物，它正贪婪地吞噬着番茄的能量",
] as const;

/** 首次进入的召唤故事 */
export const SUMMONING_STORY = `🍅 番茄农场告急！

拖延怪物大军从虚空降临，
占领了这片富饶的番茄农场。
番茄们被囚禁，光芒逐渐黯淡...

你，被农场最后的力量召唤而来。
拿起武器，击败怪物，拯救番茄！`;
