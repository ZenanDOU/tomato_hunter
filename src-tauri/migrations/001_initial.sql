-- Tasks / Monsters
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('work','study','creative','life','other')),
    difficulty TEXT NOT NULL DEFAULT 'simple' CHECK(difficulty IN ('simple','medium','hard','epic','legendary')),
    estimated_pomodoros INTEGER NOT NULL DEFAULT 1,
    actual_pomodoros INTEGER NOT NULL DEFAULT 0,
    monster_name TEXT DEFAULT '',
    monster_description TEXT DEFAULT '',
    monster_variant TEXT DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'unidentified' CHECK(status IN ('unidentified','ready','hunting','killed','abandoned')),
    total_hp INTEGER NOT NULL DEFAULT 1,
    current_hp INTEGER NOT NULL DEFAULT 1,
    parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    repeat_config TEXT NOT NULL DEFAULT 'none',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

-- Pomodoro records
CREATE TABLE IF NOT EXISTS pomodoros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    result TEXT CHECK(result IN ('completed','retreated')),
    completion_note TEXT DEFAULT '',
    reflection_type TEXT CHECK(reflection_type IN ('smooth','difficult','discovery')),
    reflection_text TEXT DEFAULT '',
    loadout_snapshot TEXT DEFAULT '{}'
);

-- Material definitions
CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK(rarity IN ('common','rare','legendary')),
    icon TEXT NOT NULL DEFAULT '🔮'
);

-- Player material inventory
CREATE TABLE IF NOT EXISTS player_materials (
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (material_id)
);

-- Loot drop records
CREATE TABLE IF NOT EXISTS loot_drops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pomodoro_id INTEGER NOT NULL REFERENCES pomodoros(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL DEFAULT 1
);

-- Equipment templates
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('weapon','armor','item')),
    description TEXT DEFAULT '',
    effect TEXT NOT NULL DEFAULT '{}',
    recipe TEXT NOT NULL DEFAULT '{}',
    unlocked INTEGER NOT NULL DEFAULT 0,
    is_consumable INTEGER NOT NULL DEFAULT 0
);

-- Player owned equipment
CREATE TABLE IF NOT EXISTS player_equipment (
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (equipment_id)
);

-- Active loadout (singleton row)
CREATE TABLE IF NOT EXISTS loadout (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    weapon_id INTEGER REFERENCES equipment(id),
    armor_id INTEGER REFERENCES equipment(id),
    items TEXT NOT NULL DEFAULT '[]'
);

-- Daily plans
CREATE TABLE IF NOT EXISTS daily_plans (
    date TEXT PRIMARY KEY,
    total_budget INTEGER NOT NULL DEFAULT 8
);

-- Planned task entries per day
CREATE TABLE IF NOT EXISTS planned_task_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_date TEXT NOT NULL REFERENCES daily_plans(date) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    planned_pomodoros_today INTEGER NOT NULL DEFAULT 1,
    completed_pomodoros_today INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

------------------------------------------------------------
-- Seed: default loadout row
------------------------------------------------------------
INSERT OR IGNORE INTO loadout (id, weapon_id, armor_id, items) VALUES (1, NULL, NULL, '[]');

------------------------------------------------------------
-- Seed: default settings
------------------------------------------------------------
INSERT OR IGNORE INTO settings (key, value) VALUES ('sound_enabled', 'true');

------------------------------------------------------------
-- Seed: base materials (10)
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
    ('虹彩碎片', 'other', 'rare', '🌈');

------------------------------------------------------------
-- Seed: base equipment (8)
------------------------------------------------------------
-- Weapons
INSERT OR IGNORE INTO equipment (name, type, description, effect, recipe, unlocked, is_consumable) VALUES
    ('标准短刀', 'weapon', '默认武器，25分钟标准番茄钟',
     '{"type":"timer","focus_minutes":25,"break_minutes":5,"long_break_minutes":15,"rounds_before_long_break":4}',
     '{}', 1, 0),
    ('长弓', 'weapon', '50分钟长时专注',
     '{"type":"timer","focus_minutes":50,"break_minutes":10,"long_break_minutes":20,"rounds_before_long_break":4}',
     '{"1":5,"6":2}', 0, 0),
    ('匕首', 'weapon', '15分钟快速番茄',
     '{"type":"timer","focus_minutes":15,"break_minutes":3,"long_break_minutes":10,"rounds_before_long_break":4}',
     '{"2":5,"7":2}', 0, 0);

-- Armor
INSERT OR IGNORE INTO equipment (name, type, description, effect, recipe, unlocked, is_consumable) VALUES
    ('皮甲', 'armor', '默认护甲，基础容错',
     '{"type":"tolerance","max_pause_duration_seconds":180,"allow_brief_interrupt":true,"brief_interrupt_seconds":30}',
     '{}', 1, 0),
    ('重甲', 'armor', '高容错护甲，适合易中断的环境',
     '{"type":"tolerance","max_pause_duration_seconds":180,"allow_brief_interrupt":true,"brief_interrupt_seconds":60}',
     '{"4":5,"9":2}', 0, 0);

-- Consumable items
INSERT OR IGNORE INTO equipment (name, type, description, effect, recipe, unlocked, is_consumable) VALUES
    ('烟雾弹', 'item', '消耗品：允许暂停一次番茄钟（上限3分钟）',
     '{"type":"consumable","action":"pause","value":180}',
     '{"5":2}', 1, 1),
    ('时光沙漏', 'item', '消耗品：延长专注5分钟',
     '{"type":"consumable","action":"extend_focus","value":5}',
     '{"5":3}', 1, 1),
    ('猎人直觉', 'item', '消耗品：本次掉落翻倍',
     '{"type":"consumable","action":"bonus_loot","value":2}',
     '{"5":3,"10":1}', 0, 1);

------------------------------------------------------------
-- Seed: starter equipment for player
------------------------------------------------------------
INSERT OR IGNORE INTO player_equipment (equipment_id, quantity) VALUES (1, 1), (4, 1), (6, 3);

-- Set default loadout to starter gear
UPDATE loadout SET weapon_id = 1, armor_id = 4 WHERE id = 1;
