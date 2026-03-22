import type { TaskCategory, TaskDifficulty, SpriteData, LegacySpriteData } from "../types";

export interface MonsterSpecies {
  id: string;
  name: string;
  family: string;
  habitat: string;
  category: TaskCategory;
  tier: "prey" | "predator" | "apex";
  difficulties: TaskDifficulty[];
  emoji: string;
  traits: { icon: string; name: string; desc: string }[];
  bodyParts: { key: string; icon: string; label: string; hint: string }[];
  descTemplates: string[];
  visualDesc: string;
  spriteData?: SpriteData | LegacySpriteData;
}

const PROCRASTINATION_ADJECTIVES = [
  "拖延的", "贪睡的", "刷手机的", "发呆的", "犹豫的",
  "懒散的", "磨蹭的", "走神的", "摸鱼的", "逃避的",
  "纠结的", "焦虑的", "敷衍的", "分心的", "浮躁的",
];

export const BESTIARY: MonsterSpecies[] = [
  // ========== 齿轮工坊废墟 (work) ==========
  {
    id: "work-gear-bug",
    name: "齿轮虫",
    family: "锈蚀机械兽",
    habitat: "齿轮工坊废墟",
    category: "work",
    tier: "prey",
    difficulties: ["simple", "medium"],
    emoji: "⚙️",
    traits: [
      { icon: "⚙️", name: "卡壳", desc: "启动困难" },
    ],
    bodyParts: [
      { key: "shell", icon: "🔩", label: "甲壳", hint: "外围准备" },
      { key: "core", icon: "⚙️", label: "内核", hint: "核心工作" },
      { key: "legs", icon: "🦿", label: "足节", hint: "收尾细节" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}从{task}的锈蚀齿轮间爬出，卡壳的齿轮封印着番茄",
    ],
    visualDesc: "小型机械甲虫，生锈的金属甲壳，齿轮状的腿节",
  },
  {
    id: "work-iron-centipede",
    name: "铁甲蜈蚣",
    family: "锈蚀机械兽",
    habitat: "齿轮工坊废墟",
    category: "work",
    tier: "predator",
    difficulties: ["hard", "epic"],
    emoji: "🐛",
    traits: [
      { icon: "🔗", name: "缠绕", desc: "流程繁琐" },
      { icon: "🛡️", name: "硬壳", desc: "难以突破" },
    ],
    bodyParts: [
      { key: "head", icon: "🐛", label: "头节", hint: "起步攻坚" },
      { key: "segments", icon: "🔗", label: "体节", hint: "主体推进" },
      { key: "tail", icon: "🎯", label: "尾钳", hint: "收口检查" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的管道中穿行，繁琐的体节缠住了番茄",
    ],
    visualDesc: "多节铁甲蜈蚣，金属链式体节，锋利的尾钳",
  },
  {
    id: "work-forge-python",
    name: "锻炉蟒",
    family: "锈蚀机械兽",
    habitat: "齿轮工坊废墟",
    category: "work",
    tier: "apex",
    difficulties: ["legendary"],
    emoji: "🐍",
    traits: [
      { icon: "🔥", name: "灼压", desc: "持续消耗" },
      { icon: "💤", name: "绞杀", desc: "拖到窒息" },
    ],
    bodyParts: [
      { key: "head", icon: "🐍", label: "蛇首", hint: "核心难点" },
      { key: "body", icon: "🔗", label: "蛇躯", hint: "主体执行" },
      { key: "tail", icon: "🎯", label: "蛇尾", hint: "收尾交付" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "传说中的{adj}{name}盘踞在{task}的废炉深处，灼热的压力令番茄窒息",
    ],
    visualDesc: "盘踞在废弃锻炉中的巨蟒，身体散发灼热光芒",
  },

  // ========== 枯竭画廊 (creative) ==========
  {
    id: "creative-ink-bug",
    name: "墨点虫",
    family: "枯彩幻灵",
    habitat: "枯竭画廊",
    category: "creative",
    tier: "prey",
    difficulties: ["simple", "medium"],
    emoji: "🖋️",
    traits: [
      { icon: "🖋️", name: "涂抹", desc: "思路模糊" },
    ],
    bodyParts: [
      { key: "sac", icon: "💧", label: "墨囊", hint: "素材收集" },
      { key: "limbs", icon: "🖋️", label: "触肢", hint: "动手执行" },
      { key: "eyes", icon: "👁️", label: "复眼", hint: "审视检查" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的干涸画布上游荡，模糊的墨迹封印着番茄",
    ],
    visualDesc: "微小的墨色甲虫，身体滴淌着干涸的墨水",
  },
  {
    id: "creative-muse-moth",
    name: "灵感蛾",
    family: "枯彩幻灵",
    habitat: "枯竭画廊",
    category: "creative",
    tier: "predator",
    difficulties: ["hard", "epic"],
    emoji: "🦋",
    traits: [
      { icon: "🦋", name: "飘忽", desc: "灵感稍纵即逝" },
      { icon: "✨", name: "趋光", desc: "完美主义" },
    ],
    bodyParts: [
      { key: "wings", icon: "🪶", label: "双翼", hint: "创意发散" },
      { key: "thorax", icon: "🫀", label: "胸腔", hint: "核心制作" },
      { key: "antenna", icon: "📡", label: "触角", hint: "感知调整" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的灵感之光旁飘忽不定，让番茄无法落地",
    ],
    visualDesc: "翅膀泛着荧光的大蛾，被创意之光吸引的夜行者",
  },
  {
    id: "creative-canvas-phoenix",
    name: "画境凤",
    family: "枯彩幻灵",
    habitat: "枯竭画廊",
    category: "creative",
    tier: "apex",
    difficulties: ["legendary"],
    emoji: "🔥",
    traits: [
      { icon: "🔥", name: "焚稿", desc: "推倒重来" },
      { icon: "🌈", name: "涅槃", desc: "完美主义的无限循环" },
    ],
    bodyParts: [
      { key: "crest", icon: "👑", label: "凤冠", hint: "构思设计" },
      { key: "wings", icon: "🔥", label: "焰翼", hint: "主体创作" },
      { key: "tail", icon: "🪶", label: "尾羽", hint: "精修打磨" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "传说中的{adj}{name}从{task}的废弃画作中涅槃重生，焚稿之火与完美主义的执念吞噬着番茄",
    ],
    visualDesc: "从废弃画作中燃起的火鸟，身体由褪色颜料和火焰构成，尾羽散落着颜料碎片",
  },

  // ========== 遗忘图书馆 (study) ==========
  {
    id: "study-book-louse",
    name: "书虱",
    family: "蛀典书灵",
    habitat: "遗忘图书馆",
    category: "study",
    tier: "prey",
    difficulties: ["simple", "medium"],
    emoji: "📖",
    traits: [
      { icon: "📖", name: "蛀蚀", desc: "遗忘流失" },
    ],
    bodyParts: [
      { key: "mouth", icon: "📄", label: "口器", hint: "信息收集" },
      { key: "abdomen", icon: "📦", label: "腹部", hint: "理解消化" },
      { key: "eggs", icon: "🦠", label: "卵囊", hint: "输出整理" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的书页间蛀蚀，被遗忘的知识封印着番茄",
    ],
    visualDesc: "微小的灰白色寄生虫，在泛黄的书页间蠕动",
  },
  {
    id: "study-thesis-wolf",
    name: "论文狼",
    family: "蛀典书灵",
    habitat: "遗忘图书馆",
    category: "study",
    tier: "predator",
    difficulties: ["hard", "epic"],
    emoji: "🐺",
    traits: [
      { icon: "🐺", name: "围猎", desc: "多线并发" },
      { icon: "🦷", name: "撕咬", desc: "截止逼近" },
    ],
    bodyParts: [
      { key: "fangs", icon: "🦷", label: "利齿", hint: "切入重点" },
      { key: "chest", icon: "🛡️", label: "胸甲", hint: "主体论述" },
      { key: "hind", icon: "🐾", label: "后腿", hint: "总结收尾" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一群{adj}{name}在{task}的书架间围猎，逼近的截止日撕咬着番茄",
    ],
    visualDesc: "灰色的群居狼，毛发间夹带着论文碎片",
  },
  {
    id: "study-archive-owl",
    name: "封典巨鸮",
    family: "蛀典书灵",
    habitat: "遗忘图书馆",
    category: "study",
    tier: "apex",
    difficulties: ["legendary"],
    emoji: "🦉",
    traits: [
      { icon: "🦉", name: "凝视", desc: "畏难情绪" },
      { icon: "📚", name: "封印", desc: "知识壁垒" },
    ],
    bodyParts: [
      { key: "eyes", icon: "🦉", label: "鸮目", hint: "研究框架" },
      { key: "wings", icon: "📖", label: "书翼", hint: "深度钻研" },
      { key: "talons", icon: "🔒", label: "封爪", hint: "知识凝练" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "传说中的{adj}{name}盘踞在{task}的禁书区，凝视的威压与知识壁垒封印着番茄",
    ],
    visualDesc: "远古巨型猫头鹰守护者，羽翼由书页和知识符文构成，双目散发冷光",
  },

  // ========== 荒废花园 (life) ==========
  {
    id: "life-weed-mouse",
    name: "杂草鼠",
    family: "荒野蔓生兽",
    habitat: "荒废花园",
    category: "life",
    tier: "prey",
    difficulties: ["simple", "medium"],
    emoji: "🌿",
    traits: [
      { icon: "🌿", name: "蔓生", desc: "越拖越多" },
    ],
    bodyParts: [
      { key: "teeth", icon: "🐭", label: "尖齿", hint: "理清头绪" },
      { key: "fur", icon: "🧶", label: "毛身", hint: "动手执行" },
      { key: "tail", icon: "🐾", label: "长尾", hint: "扫尾整理" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的杂草间筑巢，越拖越多的杂务缠住了番茄",
    ],
    visualDesc: "在杂草间筑巢的小型啮齿类，毛发间缠绕着藤蔓",
  },
  {
    id: "life-vine-frog",
    name: "藤蔓蛙",
    family: "荒野蔓生兽",
    habitat: "荒废花园",
    category: "life",
    tier: "predator",
    difficulties: ["hard", "epic"],
    emoji: "🐸",
    traits: [
      { icon: "👅", name: "黏缠", desc: "注意力陷阱" },
      { icon: "🫧", name: "膨胀", desc: "范围蔓延" },
    ],
    bodyParts: [
      { key: "tongue", icon: "👅", label: "长舌", hint: "拉取资源" },
      { key: "sac", icon: "🫧", label: "气囊", hint: "处理消化" },
      { key: "legs", icon: "🦵", label: "弹腿", hint: "快速完成" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的藤蔓间伏击，黏缠的舌头和膨胀的气囊困住了番茄",
    ],
    visualDesc: "藤蔓覆盖的伏击型蛙类，舌头上长满了黏性藤蔓",
  },
  {
    id: "life-ancient-bear",
    name: "古树熊",
    family: "荒野蔓生兽",
    habitat: "荒废花园",
    category: "life",
    tier: "apex",
    difficulties: ["legendary"],
    emoji: "🐻",
    traits: [
      { icon: "🐻", name: "沉重", desc: "体力门槛" },
      { icon: "🌳", name: "扎根", desc: "惯性难改" },
    ],
    bodyParts: [
      { key: "paw", icon: "🐻", label: "熊掌", hint: "重击突破" },
      { key: "hide", icon: "🛡️", label: "厚皮", hint: "稳步推进" },
      { key: "spine", icon: "🦴", label: "脊柱", hint: "支撑坚持" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "传说中的{adj}{name}与{task}中最古老的树融为一体，沉重的身躯压住了所有番茄",
    ],
    visualDesc: "与古树融为一体的巨型熊，树皮覆盖着厚重的身躯",
  },

  // ========== 迷雾沼泽 (other) ==========
  {
    id: "other-mist-bug",
    name: "迷雾虫",
    family: "迷雾幻形体",
    habitat: "迷雾沼泽",
    category: "other",
    tier: "prey",
    difficulties: ["simple", "medium"],
    emoji: "👻",
    traits: [
      { icon: "👻", name: "模糊", desc: "目标不清" },
    ],
    bodyParts: [
      { key: "light", icon: "💡", label: "发光体", hint: "明确目标" },
      { key: "core", icon: "🌫️", label: "雾核", hint: "核心执行" },
      { key: "wings", icon: "🦟", label: "翅膜", hint: "快速收束" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}在{task}的迷雾中聚散不定，模糊的目标封印着番茄",
    ],
    visualDesc: "在雾气中聚散的发光虫群，忽明忽暗难以捉摸",
  },
  {
    id: "other-void-crow",
    name: "虚空鸦",
    family: "迷雾幻形体",
    habitat: "迷雾沼泽",
    category: "other",
    tier: "predator",
    difficulties: ["hard", "epic"],
    emoji: "🦇",
    traits: [
      { icon: "🦇", name: "闪避", desc: "逃避心理" },
      { icon: "🌑", name: "吞噬", desc: "动力消耗" },
    ],
    bodyParts: [
      { key: "wings", icon: "🪶", label: "暗翼", hint: "信息侦察" },
      { key: "beak", icon: "💀", label: "鸦喙", hint: "精准打击" },
      { key: "claws", icon: "🦶", label: "利爪", hint: "抓取成果" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "一只{adj}{name}穿行于{task}的雾层间，逃避的阴影吞噬着番茄的动力",
    ],
    visualDesc: "暗影飞行者，漆黑的羽翼穿行于迷雾之间",
  },
  {
    id: "other-abyss-jellyfish",
    name: "深渊水母",
    family: "迷雾幻形体",
    habitat: "迷雾沼泽",
    category: "other",
    tier: "apex",
    difficulties: ["legendary"],
    emoji: "🪼",
    traits: [
      { icon: "🪼", name: "缠绕", desc: "完全失控" },
      { icon: "🌀", name: "扭曲", desc: "认知偏差" },
    ],
    bodyParts: [
      { key: "bell", icon: "🪼", label: "伞盖", hint: "理清方向" },
      { key: "core", icon: "🌀", label: "核心", hint: "核心攻坚" },
      { key: "tentacles", icon: "🫧", label: "触须", hint: "凝聚成果" },
    ],
    descTemplates: [
      "这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄",
      "传说中的{adj}{name}是{task}迷雾的源头，缠绕的触须与扭曲的光吞噬着所有番茄",
    ],
    visualDesc: "迷雾深处的半透明巨型水母，伞盖由漩涡构成，触须散发扭曲的光",
  },
];

/** Map difficulty to food chain tier */
function difficultyToTier(difficulty: TaskDifficulty): "prey" | "predator" | "apex" {
  switch (difficulty) {
    case "simple":
    case "medium":
      return "prey";
    case "hard":
    case "epic":
      return "predator";
    case "legendary":
      return "apex";
  }
}

/** Simple hash from string */
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Select a species from bestiary by category, difficulty (tier), and task name (deterministic).
 * Filters by category and matching tier, then picks deterministically based on task name hash.
 * Falls back to category-only pool if no tier match found.
 */
export function selectSpecies(
  category: TaskCategory,
  taskName: string,
  difficulty?: TaskDifficulty
): MonsterSpecies {
  const categoryPool = BESTIARY.filter((s) => s.category === category);

  if (difficulty) {
    const tier = difficultyToTier(difficulty);
    const tierPool = categoryPool.filter((s) => s.tier === tier);
    if (tierPool.length > 0) {
      const idx = strHash(taskName) % tierPool.length;
      return tierPool[idx];
    }
  }

  // Fallback: filter by difficulty inclusion (old behavior compat)
  const diffPool = difficulty
    ? categoryPool.filter((s) => s.difficulties.includes(difficulty))
    : categoryPool;
  const pool = diffPool.length > 0 ? diffPool : categoryPool;
  const idx = strHash(taskName) % pool.length;
  return pool[idx];
}

/** Extract task keyword (first 2-4 meaningful chars) */
function extractKeyword(taskName: string): string {
  // Remove common prefixes
  const cleaned = taskName
    .replace(/^(完成|写|做|整理|准备|处理|学习|复习|背|看|读|开|搞|弄)/, "")
    .trim();
  const base = cleaned || taskName;
  // Take first 2-4 chars
  return base.slice(0, Math.min(4, Math.max(2, base.length)));
}

/** Generate a task-relevant monster name: "任务关键词·种族名" */
export function generateRelevantName(
  taskName: string,
  category: TaskCategory,
  difficulty?: TaskDifficulty
): { name: string; species: MonsterSpecies } {
  const species = selectSpecies(category, taskName, difficulty);
  const keyword = extractKeyword(taskName);
  const name = `${keyword}·${species.name}`;
  return { name, species };
}

/** Generate a narrative description from species templates */
export function generateDescription(
  species: MonsterSpecies,
  taskName: string
): string {
  const adjIdx = strHash(taskName + "desc") % PROCRASTINATION_ADJECTIVES.length;
  const adj = PROCRASTINATION_ADJECTIVES[adjIdx];
  const tplIdx = strHash(taskName + "tpl") % species.descTemplates.length;
  const template = species.descTemplates[tplIdx];

  // Build trait_desc from species traits
  const traitDesc = species.traits.map((t) => `${t.icon} ${t.name}`).join("与");

  return template
    .replace("{adj}", adj)
    .replace("{name}", species.name)
    .replace("{habitat}", species.habitat)
    .replace("{trait_desc}", traitDesc)
    .replace("{task}", taskName);
}
