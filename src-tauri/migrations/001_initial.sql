------------------------------------------------------------
-- Tasks / Monsters
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('work','study','creative','life','other')),
    difficulty TEXT NOT NULL DEFAULT 'simple' CHECK(difficulty IN ('simple','medium','hard','epic','legendary')),
    estimated_pomodoros INTEGER NOT NULL DEFAULT 1,
    actual_pomodoros INTEGER NOT NULL DEFAULT 0,
    monster_name TEXT NOT NULL DEFAULT '',
    monster_description TEXT NOT NULL DEFAULT '',
    monster_variant TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'unidentified'
        CHECK(status IN ('unidentified','ready','hunting','killed','abandoned','released')),
    total_hp INTEGER NOT NULL DEFAULT 1,
    current_hp INTEGER NOT NULL DEFAULT 1,
    parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    repeat_config TEXT NOT NULL DEFAULT 'none',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    body_part TEXT,
    species_id TEXT DEFAULT NULL
);

------------------------------------------------------------
-- Pomodoro records
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pomodoros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    result TEXT CHECK(result IN ('completed','retreated')),
    completion_note TEXT DEFAULT '',
    reflection_type TEXT CHECK(reflection_type IN ('smooth','difficult','discovery')),
    reflection_text TEXT DEFAULT '',
    loadout_snapshot TEXT DEFAULT '{}',
    strategy_note TEXT DEFAULT ''
);

------------------------------------------------------------
-- Material definitions
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK(rarity IN ('common','rare','legendary')),
    icon TEXT NOT NULL DEFAULT '🔮'
);

------------------------------------------------------------
-- Player material inventory
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_materials (
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (material_id)
);

------------------------------------------------------------
-- Loot drop records
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loot_drops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pomodoro_id INTEGER NOT NULL REFERENCES pomodoros(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL DEFAULT 1
);

------------------------------------------------------------
-- Equipment templates
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('weapon','armor','item')),
    description TEXT DEFAULT '',
    effect TEXT NOT NULL DEFAULT '{}',
    recipe TEXT NOT NULL DEFAULT '{}',
    unlocked INTEGER NOT NULL DEFAULT 0,
    is_consumable INTEGER NOT NULL DEFAULT 0,
    price INTEGER
);

------------------------------------------------------------
-- Player owned equipment
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_equipment (
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (equipment_id)
);

------------------------------------------------------------
-- Active loadout (singleton row)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loadout (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    weapon_id INTEGER REFERENCES equipment(id),
    armor_id INTEGER REFERENCES equipment(id),
    items TEXT NOT NULL DEFAULT '[]'
);

------------------------------------------------------------
-- Daily plans
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_plans (
    date TEXT PRIMARY KEY,
    total_budget INTEGER NOT NULL DEFAULT 8,
    removed_completed INTEGER NOT NULL DEFAULT 0
);

------------------------------------------------------------
-- Planned task entries per day
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS planned_task_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_date TEXT NOT NULL REFERENCES daily_plans(date) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    planned_pomodoros_today INTEGER NOT NULL DEFAULT 1,
    completed_pomodoros_today INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

------------------------------------------------------------
-- Settings (key-value)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

------------------------------------------------------------
-- Tomato Farm
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tomato_farm (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    tomato_count INTEGER NOT NULL DEFAULT 0,
    essence_balance INTEGER NOT NULL DEFAULT 0,
    fertilizer_remaining_minutes REAL NOT NULL DEFAULT 0,
    is_watered INTEGER NOT NULL DEFAULT 0,
    watering_cooldown_end TEXT
);

------------------------------------------------------------
-- Milestones
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    achieved_at TEXT NOT NULL DEFAULT (datetime('now')),
    notified INTEGER NOT NULL DEFAULT 0
);

------------------------------------------------------------
-- Indexes
------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pomodoros_task_id ON pomodoros(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoros_ended ON pomodoros(ended_at);
CREATE INDEX IF NOT EXISTS idx_loot_pomodoro ON loot_drops(pomodoro_id);
CREATE INDEX IF NOT EXISTS idx_planned_entries_date ON planned_task_entries(plan_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_species_id ON tasks(species_id);

------------------------------------------------------------
-- Seed: default loadout row
------------------------------------------------------------
INSERT OR IGNORE INTO loadout (id, weapon_id, armor_id, items) VALUES (1, NULL, NULL, '[]');

------------------------------------------------------------
-- Seed: default settings
------------------------------------------------------------
INSERT OR IGNORE INTO settings (key, value) VALUES ('sound_enabled', 'true');

------------------------------------------------------------
-- Seed: default farm
------------------------------------------------------------
INSERT OR IGNORE INTO tomato_farm (id, tomato_count, essence_balance, fertilizer_remaining_minutes, is_watered)
VALUES (1, 0, 0, 0, 0);

------------------------------------------------------------
-- Seed: materials (11)
------------------------------------------------------------
INSERT OR IGNORE INTO materials (name, category, rarity, icon) VALUES
    ('墨水碎片', 'creative', 'common', '🖋️'),
    ('齿轮零件', 'work', 'common', '⚙️'),
    ('知识结晶', 'study', 'common', '📖'),
    ('生活纤维', 'life', 'common', '🌿'),
    ('通用碎片', 'other', 'common', '🔮'),
    ('灵感精华', 'creative', 'rare', '✨'),
    ('精密齿轮', 'work', 'rare', '🔩'),
    ('智慧宝石', 'study', 'rare', '💎'),
    ('生命露珠', 'life', 'rare', '💧'),
    ('虹彩碎片', 'other', 'rare', '🌈'),
    ('获救番茄', 'special', 'common', '🍅');

------------------------------------------------------------
-- Seed: equipment (14) — 3 weapons + 3 armor + 8 consumables
------------------------------------------------------------

-- Weapons (IDs 1-3)
INSERT INTO equipment (id, name, type, description, effect, recipe, unlocked, is_consumable, price) VALUES
    (1, '手剑', 'weapon', '默认武器。2分钟策略+20分钟专注+3分钟复盘=25分钟，连续时5分钟休息，每4轮15分钟长休息',
     '{"type":"timer_mode","mode":"sword"}',
     '{}', 1, 0, NULL),
    (2, '匕首', 'weapon', '15分钟无限循环。每轮选择行动或休息，番茄=ceil(行动次数/2)',
     '{"type":"timer_mode","mode":"dagger"}',
     '{"2":5,"7":1}', 0, 0, NULL),
    (3, '重锤', 'weapon', '50分钟长专注。3分钟策略+44分钟专注+3分钟复盘。25分后撤退得1番茄，完成得2番茄，不可连续',
     '{"type":"timer_mode","mode":"hammer"}',
     '{"3":8,"8":2}', 0, 0, NULL);

-- Armor (IDs 4-6)
INSERT INTO equipment (id, name, type, description, effect, recipe, unlocked, is_consumable, price) VALUES
    (4, '棉甲', 'armor', '默认护甲。专注阶段全程安静',
     '{"type":"audio_mode","mode":"silent"}',
     '{}', 1, 0, NULL),
    (5, '皮甲', 'armor', '专注阶段播放白噪音，帮助进入心流',
     '{"type":"audio_mode","mode":"white-noise"}',
     '{"4":5,"9":1}', 0, 0, NULL),
    (6, '重甲', 'armor', '专注阶段每3分钟音效报时，提醒保持专注',
     '{"type":"audio_mode","mode":"interval-alert"}',
     '{"1":5,"6":1,"5":3}', 0, 0, NULL);

-- Consumables (IDs 7-14)
INSERT INTO equipment (id, name, type, description, effect, recipe, unlocked, is_consumable, price) VALUES
    (7, '烟雾弹', 'item', '允许暂停一次番茄钟（上限3分钟）',
     '{"type":"consumable","action":"pause","value":180}',
     '{}', 1, 1, 15),
    (8, '持久药水', 'item', '延长专注+3分钟（复盘阶段使用）',
     '{"type":"consumable","action":"extend_focus","value":3}',
     '{}', 1, 1, 10),
    (9, '温泉券', 'item', '延长休息+2分钟（休息阶段使用）',
     '{"type":"consumable","action":"extend_break","value":2}',
     '{}', 1, 1, 8),
    (10, '疾风符咒', 'item', '缩短本次专注-5分钟（专注阶段使用）',
     '{"type":"consumable","action":"shorten_focus","value":5}',
     '{}', 1, 1, 20),
    (11, '猎人直觉', 'item', '跳过策略制定阶段',
     '{"type":"consumable","action":"skip_prep"}',
     '{}', 1, 1, 12),
    (12, '战场速记', 'item', '跳过复盘阶段',
     '{"type":"consumable","action":"skip_review"}',
     '{}', 1, 1, 12),
    (13, '幸运护符', 'item', '下次狩猎素材掉落翻倍',
     '{"type":"consumable","action":"double_loot","value":2}',
     '{}', 1, 1, 30),
    (14, '丰收祈愿', 'item', '农场产出翻倍60分钟（仅计专注时间）',
     '{"type":"consumable","action":"fertilizer","value":60}',
     '{}', 1, 1, 25);

------------------------------------------------------------
-- Seed: starter equipment for player (sword + cotton armor)
------------------------------------------------------------
INSERT OR IGNORE INTO player_equipment (equipment_id, quantity) VALUES (1, 1), (4, 1);

-- Set default loadout
UPDATE loadout SET weapon_id = 1, armor_id = 4 WHERE id = 1;
