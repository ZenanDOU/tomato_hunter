use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MonsterInfo {
    pub name: String,
    pub description: String,
    pub variant: String,
}

// 拖延主题形容词
const ADJECTIVES: &[&str] = &[
    "拖延的", "贪睡的", "刷手机的", "发呆的", "犹豫的",
    "懒散的", "磨蹭的", "走神的", "摸鱼的", "逃避的",
    "纠结的", "焦虑的", "敷衍的", "分心的", "浮躁的",
];

// 5 栖息地 × 3 食物链层级 = 15 种族
// (category, tier_index, name, habitat)
const SPECIES: &[(&str, usize, &str, &str)] = &[
    // work - 齿轮工坊废墟
    ("work", 0, "齿轮虫", "齿轮工坊废墟"),
    ("work", 1, "铁甲蜈蚣", "齿轮工坊废墟"),
    ("work", 2, "锻炉蟒", "齿轮工坊废墟"),
    // creative - 枯竭画廊
    ("creative", 0, "墨点虫", "枯竭画廊"),
    ("creative", 1, "灵感蛾", "枯竭画廊"),
    ("creative", 2, "画境龙", "枯竭画廊"),
    // study - 遗忘图书馆
    ("study", 0, "书虱", "遗忘图书馆"),
    ("study", 1, "论文狼", "遗忘图书馆"),
    ("study", 2, "知识龙", "遗忘图书馆"),
    // life - 荒废花园
    ("life", 0, "杂草鼠", "荒废花园"),
    ("life", 1, "藤蔓蛙", "荒废花园"),
    ("life", 2, "古树熊", "荒废花园"),
    // other - 迷雾沼泽
    ("other", 0, "迷雾虫", "迷雾沼泽"),
    ("other", 1, "虚空鸦", "迷雾沼泽"),
    ("other", 2, "混沌龙", "迷雾沼泽"),
];

// 描述模板
const DESCRIPTION_TEMPLATES: &[&str] = &[
    "这只{adj}{name}栖息在{habitat}，从你拖延的{task}中汲取力量，囚禁了农场的番茄",
    "一只{adj}{name}从{habitat}深处现身，它被未完成的{task}所召唤",
    "{habitat}中的{adj}{name}闻到了{task}中拖延的气息，正在囚禁附近的番茄",
    "这只{adj}{name}在{habitat}中伏击，用拖延之力封印了{task}里的番茄",
    "从{task}的拖延情绪中诞生的{adj}{name}，盘踞在{habitat}，番茄在它脚下瑟瑟发抖",
];

/// Difficulty string to food chain tier index
fn difficulty_to_tier(difficulty: &str) -> usize {
    match difficulty {
        "simple" | "medium" => 0,
        "hard" | "epic" => 1,
        "legendary" => 2,
        _ => 0,
    }
}

/// Extract keyword from task name
fn extract_keyword(task_name: &str) -> &str {
    let prefixes = ["完成", "写", "做", "整理", "准备", "处理", "学习", "复习", "背", "看", "读", "开", "搞", "弄"];
    let mut name = task_name;
    for prefix in prefixes {
        if let Some(rest) = name.strip_prefix(prefix) {
            if !rest.is_empty() {
                name = rest;
                break;
            }
        }
    }
    let end = name.char_indices()
        .take(4)
        .last()
        .map(|(i, c)| i + c.len_utf8())
        .unwrap_or(name.len());
    &name[..end]
}

pub fn generate_offline(category: &str, task_name: &str, difficulty: &str) -> MonsterInfo {
    let mut rng = rand::thread_rng();
    let adj = ADJECTIVES[rng.gen_range(0..ADJECTIVES.len())];
    let tier = difficulty_to_tier(difficulty);

    // Find matching species
    let species = SPECIES
        .iter()
        .find(|(cat, t, _, _)| *cat == category && *t == tier)
        .unwrap_or(&SPECIES[0]);

    let species_name = species.2;
    let habitat = species.3;

    // Rare variant: 10% chance
    let variant = if rng.gen_range(0..10) == 0 { "rare" } else { "normal" };
    let prefix = if variant == "rare" { "金色" } else { "" };

    // Name: "prefix keyword·species_name"
    let keyword = extract_keyword(task_name);
    let name = format!("{}{}·{}", prefix, keyword, species_name);

    // Description from template
    let template = DESCRIPTION_TEMPLATES[rng.gen_range(0..DESCRIPTION_TEMPLATES.len())];
    let description = template
        .replace("{adj}", adj)
        .replace("{name}", species_name)
        .replace("{habitat}", habitat)
        .replace("{task}", task_name);

    MonsterInfo {
        name,
        description,
        variant: variant.to_string(),
    }
}
