# Potato Hunter MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-player gamified Pomodoro desktop app where tasks become monsters to hunt, with GTD-based village management, equipment crafting, and strategy-based growth.

**Architecture:** Tauri v2 desktop shell with React+TypeScript frontend. Rust backend handles timer (monotonic clock), SQLite storage, system tray, and multi-window management. Frontend handles all UI: village (task management), hunt overlay (floating window), settlement, and journal. AI calls (Claude API) are optional with offline fallback.

**Tech Stack:** Tauri v2, Rust, React 18, TypeScript, Zustand, Tailwind CSS, SQLite (tauri-plugin-sql), Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-potato-hunter-design.md`

---

## File Structure

```
potato_hunter/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── src/
│   │   ├── main.rs                  # Entry point
│   │   ├── lib.rs                   # Plugin registration + command handlers
│   │   ├── db.rs                    # SQLite connection + migrations
│   │   ├── models/
│   │   │   ├── mod.rs
│   │   │   ├── task.rs              # Task/Monster CRUD
│   │   │   ├── pomodoro.rs          # Pomodoro records
│   │   │   ├── material.rs          # Material definitions + inventory
│   │   │   ├── equipment.rs         # Equipment templates + crafting
│   │   │   ├── daily_plan.rs        # Daily plan + entries
│   │   │   └── player.rs            # Loadout + inventory aggregation
│   │   ├── timer.rs                 # Timer state machine (prep→focus→review)
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── task_cmd.rs          # Task CRUD commands
│   │   │   ├── timer_cmd.rs         # Timer control commands
│   │   │   ├── plan_cmd.rs          # Daily plan commands
│   │   │   ├── equipment_cmd.rs     # Equipment + crafting commands
│   │   │   └── loot_cmd.rs          # Loot generation commands
│   │   └── monster_gen.rs           # Offline monster name generator
│   └── migrations/
│       └── 001_initial.sql
├── src/
│   ├── main.tsx                     # Main window entry
│   ├── hunt.tsx                     # Hunt overlay window entry
│   ├── App.tsx                      # Main app router
│   ├── HuntApp.tsx                  # Hunt overlay app
│   ├── types/
│   │   └── index.ts                 # All TypeScript types
│   ├── stores/
│   │   ├── taskStore.ts             # Task state + actions
│   │   ├── timerStore.ts            # Timer state from Rust events
│   │   ├── planStore.ts             # Daily plan state
│   │   ├── inventoryStore.ts        # Materials + equipment + loadout
│   │   └── settingsStore.ts         # User preferences
│   ├── hooks/
│   │   └── useTauriEvent.ts         # Listen to Rust events
│   ├── lib/
│   │   ├── commands.ts              # Typed invoke() wrappers
│   │   └── loot.ts                  # Loot table + drop calculation
│   ├── components/
│   │   ├── village/
│   │   │   ├── VillageLayout.tsx    # Main village layout with tabs
│   │   │   ├── Inbox.tsx            # Quick-capture inbox
│   │   │   ├── TaskForm.tsx         # Monster discovery form
│   │   │   ├── HuntList.tsx         # Ready-to-hunt task list
│   │   │   ├── DailyPlanBoard.tsx   # Today's hunt plan + budget
│   │   │   └── Workshop.tsx         # Crafting UI
│   │   ├── hunt/
│   │   │   ├── PrepPhase.tsx        # 2-min preparation
│   │   │   ├── FocusPhase.tsx       # Focus timer + HP bar
│   │   │   └── ReviewPhase.tsx      # 3-min review form
│   │   ├── settlement/
│   │   │   ├── Settlement.tsx       # Post-hunt results
│   │   │   └── RestScreen.tsx       # Break timer + health tips
│   │   ├── journal/
│   │   │   └── Journal.tsx          # Monster journal/图鉴
│   │   └── common/
│   │       ├── ProgressBar.tsx      # Reusable HP/time bar
│   │       └── MonsterIcon.tsx      # Emoji-based monster display
│   └── styles/
│       └── index.css                # Tailwind imports
├── index.html                       # Main window HTML
├── hunt.html                        # Hunt overlay HTML
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## Chunk 1: Project Scaffolding + Database

### Task 1: Initialize Tauri v2 + React project

**Files:**
- Create: all project root config files
- Create: `src-tauri/` scaffold

- [ ] **Step 1: Create Tauri v2 project**

```bash
cd D:/AI_auto/potato_hunter
npm create tauri-app@latest . -- --template react-ts --manager npm
```

Select: TypeScript, React template. If directory not empty, allow overwrite of config files only.

- [ ] **Step 2: Verify project builds**

```bash
cd D:/AI_auto/potato_hunter
npm install
npm run tauri dev
```

Expected: Tauri window opens with default React template.

- [ ] **Step 3: Commit scaffold**

```bash
git init
git add -A
git commit -m "chore: initialize Tauri v2 + React + TypeScript project"
```

### Task 2: Configure Tailwind CSS + Zustand

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.ts`
- Create: `src/styles/index.css`

- [ ] **Step 1: Install dependencies**

```bash
npm install zustand
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Configure Tailwind with Vite plugin**

In `vite.config.ts`, add the Tailwind plugin:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
}));
```

- [ ] **Step 3: Create Tailwind CSS entry**

`src/styles/index.css`:
```css
@import "tailwindcss";
```

Import in `src/main.tsx`:
```typescript
import "./styles/index.css";
```

- [ ] **Step 4: Verify Tailwind works**

Add a Tailwind class to `App.tsx` (e.g., `className="bg-stone-900 text-white min-h-screen"`), run `npm run tauri dev`, confirm styling applies.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/styles/index.css src/main.tsx
git commit -m "chore: add Tailwind CSS v4 + Zustand"
```

### Task 3: Add SQLite plugin + database schema

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Create: `src-tauri/migrations/001_initial.sql`
- Create: `src-tauri/src/db.rs`

- [ ] **Step 1: Add tauri-plugin-sql dependency**

In `src-tauri/Cargo.toml` under `[dependencies]`:
```toml
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- [ ] **Step 2: Write initial migration SQL**

`src-tauri/migrations/001_initial.sql`:
```sql
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
    monster_variant TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'unidentified' CHECK(status IN ('unidentified','ready','hunting','killed','abandoned')),
    total_hp INTEGER NOT NULL DEFAULT 1,
    current_hp INTEGER NOT NULL DEFAULT 1,
    parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    repeat_config TEXT NOT NULL DEFAULT 'none',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

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

CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK(rarity IN ('common','rare','legendary')),
    icon TEXT NOT NULL DEFAULT '🔮'
);

CREATE TABLE IF NOT EXISTS player_materials (
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (material_id)
);

CREATE TABLE IF NOT EXISTS loot_drops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pomodoro_id INTEGER NOT NULL REFERENCES pomodoros(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL DEFAULT 1
);

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

CREATE TABLE IF NOT EXISTS player_equipment (
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (equipment_id)
);

CREATE TABLE IF NOT EXISTS loadout (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    weapon_id INTEGER REFERENCES equipment(id),
    armor_id INTEGER REFERENCES equipment(id),
    items TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS daily_plans (
    date TEXT PRIMARY KEY,
    total_budget INTEGER NOT NULL DEFAULT 8
);

CREATE TABLE IF NOT EXISTS planned_task_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_date TEXT NOT NULL REFERENCES daily_plans(date) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    planned_pomodoros_today INTEGER NOT NULL DEFAULT 1,
    completed_pomodoros_today INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Seed: default loadout row
INSERT OR IGNORE INTO loadout (id, weapon_id, armor_id, items) VALUES (1, NULL, NULL, '[]');

-- Seed: default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('sound_enabled', 'true');

-- Seed: base materials
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

-- Seed: base equipment
INSERT OR IGNORE INTO equipment (name, type, description, effect, recipe, unlocked, is_consumable) VALUES
    ('标准短刀', 'weapon', '默认武器，25分钟标准番茄钟',
     '{"type":"timer","focus_minutes":25,"break_minutes":5,"long_break_minutes":15,"rounds_before_long_break":4}',
     '{}', 1, 0),
    ('长弓', 'weapon', '50分钟长时专注',
     '{"type":"timer","focus_minutes":50,"break_minutes":10,"long_break_minutes":20,"rounds_before_long_break":4}',
     '{"1":5,"6":2}', 0, 0),
    ('匕首', 'weapon', '15分钟快速番茄',
     '{"type":"timer","focus_minutes":15,"break_minutes":3,"long_break_minutes":10,"rounds_before_long_break":4}',
     '{"2":5,"7":2}', 0, 0),
    ('皮甲', 'armor', '默认护甲，基础容错',
     '{"type":"tolerance","max_pause_duration_seconds":180,"allow_brief_interrupt":true,"brief_interrupt_seconds":30}',
     '{}', 1, 0),
    ('重甲', 'armor', '高容错护甲，适合易中断的环境',
     '{"type":"tolerance","max_pause_duration_seconds":180,"allow_brief_interrupt":true,"brief_interrupt_seconds":60}',
     '{"4":5,"9":2}', 0, 0),
    ('烟雾弹', 'item', '消耗品：允许暂停一次番茄钟（上限3分钟）',
     '{"type":"consumable","action":"pause","value":180}',
     '{"5":2}', 1, 1),
    ('时光沙漏', 'item', '消耗品：延长专注5分钟',
     '{"type":"consumable","action":"extend_focus","value":5}',
     '{"5":3}', 1, 1),
    ('猎人直觉', 'item', '消耗品：本次掉落翻倍',
     '{"type":"consumable","action":"bonus_loot","value":2}',
     '{"5":3,"10":1}', 0, 1);

-- Give player starter equipment
INSERT OR IGNORE INTO player_equipment (equipment_id, quantity) VALUES (1, 1), (4, 1), (6, 3);

-- Set default loadout to starter gear
UPDATE loadout SET weapon_id = 1, armor_id = 4 WHERE id = 1;
```

- [ ] **Step 3: Register SQL plugin in lib.rs**

`src-tauri/src/db.rs`:
```rust
use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create initial tables and seed data",
        sql: include_str!("../migrations/001_initial.sql"),
        kind: MigrationKind::Up,
    }]
}
```

Update `src-tauri/src/lib.rs` to register the plugin:
```rust
mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:potato_hunter.db", db::migrations())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4: Build and verify migration runs**

```bash
npm run tauri dev
```

Expected: App opens, SQLite DB file `potato_hunter.db` created in app data directory. No errors in console.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/
git commit -m "feat: add SQLite database with initial schema and seed data"
```

### Task 4: TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write all shared TypeScript types**

`src/types/index.ts`:
```typescript
// === Task / Monster ===

export type TaskCategory = 'work' | 'study' | 'creative' | 'life' | 'other';
export type TaskDifficulty = 'simple' | 'medium' | 'hard' | 'epic' | 'legendary';
export type TaskStatus = 'unidentified' | 'ready' | 'hunting' | 'killed' | 'abandoned';

export interface Task {
  id: number;
  name: string;
  description: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  estimated_pomodoros: number;
  actual_pomodoros: number;
  monster_name: string;
  monster_description: string;
  monster_variant: string;
  status: TaskStatus;
  total_hp: number;
  current_hp: number;
  parent_task_id: number | null;
  repeat_config: string;
  created_at: string;
  completed_at: string | null;
}

export interface TaskFormData {
  name: string;
  description: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  estimated_pomodoros: number;
  repeat_config: string;
}

// === Pomodoro ===

export type PomodoroResult = 'completed' | 'retreated';
export type ReflectionType = 'smooth' | 'difficult' | 'discovery';

export interface Pomodoro {
  id: number;
  task_id: number;
  started_at: string;
  ended_at: string | null;
  result: PomodoroResult | null;
  completion_note: string;
  reflection_type: ReflectionType | null;
  reflection_text: string;
  loadout_snapshot: string;
}

// === Timer ===

export type TimerPhase = 'idle' | 'prep' | 'focus' | 'review' | 'break' | 'long_break';

export interface TimerState {
  phase: TimerPhase;
  remaining_seconds: number;
  total_seconds: number;
  task_id: number | null;
  task_name: string;
  pomodoro_id: number | null;
  rounds_completed: number;
  is_paused: boolean;
}

// === Equipment ===

export type EquipmentType = 'weapon' | 'armor' | 'item';

export interface WeaponEffect {
  type: 'timer';
  focus_minutes: number;
  break_minutes: number;
  long_break_minutes: number;
  rounds_before_long_break: number;
}

export interface ArmorEffect {
  type: 'tolerance';
  max_pause_duration_seconds: number;
  allow_brief_interrupt: boolean;
  brief_interrupt_seconds: number;
}

export interface ConsumableEffect {
  type: 'consumable';
  action: 'pause' | 'extend_focus' | 'skip_prep' | 'bonus_loot';
  value: number;
}

export type EquipmentEffect = WeaponEffect | ArmorEffect | ConsumableEffect;

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  description: string;
  effect: EquipmentEffect;
  recipe: Record<number, number>; // material_id -> quantity
  unlocked: boolean;
  is_consumable: boolean;
}

export interface Loadout {
  weapon_id: number | null;
  armor_id: number | null;
  items: number[]; // equipment_ids
}

// === Materials ===

export type MaterialRarity = 'common' | 'rare' | 'legendary';

export interface Material {
  id: number;
  name: string;
  category: string;
  rarity: MaterialRarity;
  icon: string;
}

export interface LootDrop {
  material: Material;
  quantity: number;
}

// === Daily Plan ===

export interface DailyPlan {
  date: string;
  total_budget: number;
  entries: PlannedTaskEntry[];
}

export interface PlannedTaskEntry {
  id: number;
  task_id: number;
  planned_pomodoros_today: number;
  completed_pomodoros_today: number;
  sort_order: number;
  task?: Task; // joined
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions for all data models"
```

---

## Chunk 2: Rust Timer Engine + Tauri Commands

### Task 5: Timer state machine (Rust)

**Files:**
- Create: `src-tauri/src/timer.rs`
- Test: inline `#[cfg(test)]` module

- [ ] **Step 1: Write timer test**

At the bottom of `src-tauri/src/timer.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_phase_durations() {
        let config = TimerConfig::default();
        assert_eq!(config.prep_seconds, 120);
        assert_eq!(config.review_seconds, 180);
        assert_eq!(config.focus_seconds, 1200); // 25*60 - 120 - 180
    }

    #[test]
    fn test_custom_weapon_phase_durations() {
        let config = TimerConfig::from_focus_minutes(50);
        assert_eq!(config.focus_seconds, 2700); // 50*60 - 120 - 180
    }

    #[test]
    fn test_phase_transitions() {
        let config = TimerConfig::default();
        assert_eq!(config.next_phase(TimerPhase::Prep), TimerPhase::Focus);
        assert_eq!(config.next_phase(TimerPhase::Focus), TimerPhase::Review);
        assert_eq!(config.next_phase(TimerPhase::Review), TimerPhase::Break);
    }

    #[test]
    fn test_long_break_after_rounds() {
        let config = TimerConfig::default();
        assert_eq!(config.break_phase_for_round(3), TimerPhase::Break);
        assert_eq!(config.break_phase_for_round(4), TimerPhase::LongBreak);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd D:/AI_auto/potato_hunter/src-tauri
cargo test
```
Expected: FAIL — module and types not defined.

- [ ] **Step 3: Implement timer module**

`src-tauri/src/timer.rs`:
```rust
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Instant;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerPhase {
    Idle,
    Prep,
    Focus,
    Review,
    Break,
    LongBreak,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerConfig {
    pub prep_seconds: u64,
    pub focus_seconds: u64,
    pub review_seconds: u64,
    pub break_seconds: u64,
    pub long_break_seconds: u64,
    pub rounds_before_long_break: u32,
}

impl Default for TimerConfig {
    fn default() -> Self {
        Self::from_weapon_effect(25, 5, 15, 4)
    }
}

impl TimerConfig {
    pub fn from_focus_minutes(total_minutes: u64) -> Self {
        Self::from_weapon_effect(total_minutes, 5, 15, 4)
    }

    pub fn from_weapon_effect(
        focus_minutes: u64,
        break_minutes: u64,
        long_break_minutes: u64,
        rounds: u32,
    ) -> Self {
        let total_seconds = focus_minutes * 60;
        let prep_seconds = 120; // fixed 2 min
        let review_seconds = 180; // fixed 3 min
        let focus_seconds = total_seconds - prep_seconds - review_seconds;
        Self {
            prep_seconds,
            focus_seconds,
            review_seconds,
            break_seconds: break_minutes * 60,
            long_break_seconds: long_break_minutes * 60,
            rounds_before_long_break: rounds,
        }
    }

    pub fn duration_for_phase(&self, phase: TimerPhase) -> u64 {
        match phase {
            TimerPhase::Idle => 0,
            TimerPhase::Prep => self.prep_seconds,
            TimerPhase::Focus => self.focus_seconds,
            TimerPhase::Review => self.review_seconds,
            TimerPhase::Break => self.break_seconds,
            TimerPhase::LongBreak => self.long_break_seconds,
        }
    }

    pub fn next_phase(&self, current: TimerPhase) -> TimerPhase {
        match current {
            TimerPhase::Idle => TimerPhase::Prep,
            TimerPhase::Prep => TimerPhase::Focus,
            TimerPhase::Focus => TimerPhase::Review,
            TimerPhase::Review => TimerPhase::Break, // caller decides break vs long_break
            TimerPhase::Break => TimerPhase::Idle,
            TimerPhase::LongBreak => TimerPhase::Idle,
        }
    }

    pub fn break_phase_for_round(&self, round: u32) -> TimerPhase {
        if round > 0 && round % self.rounds_before_long_break == 0 {
            TimerPhase::LongBreak
        } else {
            TimerPhase::Break
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TimerSnapshot {
    pub phase: TimerPhase,
    pub remaining_seconds: u64,
    pub total_seconds: u64,
    pub task_id: Option<i64>,
    pub task_name: String,
    pub pomodoro_id: Option<i64>,
    pub rounds_completed: u32,
    pub is_paused: bool,
}

pub struct TimerEngine {
    pub config: TimerConfig,
    pub phase: TimerPhase,
    pub phase_start: Option<Instant>,
    pub elapsed_before_pause: u64,
    pub is_paused: bool,
    pub task_id: Option<i64>,
    pub task_name: String,
    pub pomodoro_id: Option<i64>,
    pub rounds_completed: u32,
}

impl TimerEngine {
    pub fn new() -> Self {
        Self {
            config: TimerConfig::default(),
            phase: TimerPhase::Idle,
            phase_start: None,
            elapsed_before_pause: 0,
            is_paused: false,
            task_id: None,
            task_name: String::new(),
            pomodoro_id: None,
            rounds_completed: 0,
        }
    }

    pub fn start(&mut self, config: TimerConfig, task_id: i64, task_name: String) {
        self.config = config;
        self.phase = TimerPhase::Prep;
        self.phase_start = Some(Instant::now());
        self.elapsed_before_pause = 0;
        self.is_paused = false;
        self.task_id = Some(task_id);
        self.task_name = task_name;
        self.pomodoro_id = None;
        // rounds_completed preserved across pomodoros in a session
    }

    pub fn pause(&mut self) {
        if !self.is_paused {
            if let Some(start) = self.phase_start {
                self.elapsed_before_pause += start.elapsed().as_secs();
            }
            self.is_paused = true;
            self.phase_start = None;
        }
    }

    pub fn resume(&mut self) {
        if self.is_paused {
            self.is_paused = false;
            self.phase_start = Some(Instant::now());
        }
    }

    pub fn retreat(&mut self) {
        self.phase = TimerPhase::Idle;
        self.phase_start = None;
        self.is_paused = false;
        self.elapsed_before_pause = 0;
        self.task_id = None;
        self.task_name.clear();
        self.pomodoro_id = None;
    }

    pub fn elapsed_in_phase(&self) -> u64 {
        let running = if let Some(start) = self.phase_start {
            start.elapsed().as_secs()
        } else {
            0
        };
        self.elapsed_before_pause + running
    }

    pub fn remaining_in_phase(&self) -> u64 {
        let total = self.config.duration_for_phase(self.phase);
        let elapsed = self.elapsed_in_phase();
        total.saturating_sub(elapsed)
    }

    pub fn is_phase_complete(&self) -> bool {
        self.remaining_in_phase() == 0 && self.phase != TimerPhase::Idle
    }

    pub fn advance_phase(&mut self) -> TimerPhase {
        let next = if self.phase == TimerPhase::Review {
            self.rounds_completed += 1;
            self.config.break_phase_for_round(self.rounds_completed)
        } else {
            self.config.next_phase(self.phase)
        };
        self.phase = next;
        self.phase_start = Some(Instant::now());
        self.elapsed_before_pause = 0;
        self.is_paused = false;
        next
    }

    pub fn snapshot(&self) -> TimerSnapshot {
        let total = self.config.duration_for_phase(self.phase);
        TimerSnapshot {
            phase: self.phase,
            remaining_seconds: self.remaining_in_phase(),
            total_seconds: total,
            task_id: self.task_id,
            task_name: self.task_name.clone(),
            pomodoro_id: self.pomodoro_id,
            rounds_completed: self.rounds_completed,
            is_paused: self.is_paused,
        }
    }
}

pub type SharedTimer = Mutex<TimerEngine>;
```

- [ ] **Step 4: Run tests**

```bash
cd D:/AI_auto/potato_hunter/src-tauri
cargo test
```
Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/timer.rs
git commit -m "feat: implement timer state machine with phase transitions"
```

### Task 6: Timer Tauri commands + tick event loop

**Files:**
- Create: `src-tauri/src/commands/mod.rs`
- Create: `src-tauri/src/commands/timer_cmd.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create timer commands**

`src-tauri/src/commands/mod.rs`:
```rust
pub mod timer_cmd;
```

`src-tauri/src/commands/timer_cmd.rs`:
```rust
use crate::timer::{SharedTimer, TimerConfig, TimerPhase, TimerSnapshot};
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub fn start_timer(
    timer: State<'_, SharedTimer>,
    task_id: i64,
    task_name: String,
    focus_minutes: Option<u64>,
    break_minutes: Option<u64>,
    long_break_minutes: Option<u64>,
    rounds_before_long_break: Option<u32>,
) -> Result<TimerSnapshot, String> {
    let config = TimerConfig::from_weapon_effect(
        focus_minutes.unwrap_or(25),
        break_minutes.unwrap_or(5),
        long_break_minutes.unwrap_or(15),
        rounds_before_long_break.unwrap_or(4),
    );
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.start(config, task_id, task_name);
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn pause_timer(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.pause();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn resume_timer(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.resume();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn retreat_timer(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.retreat();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn advance_timer_phase(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.advance_phase();
    Ok(engine.snapshot())
}

#[tauri::command]
pub fn get_timer_state(timer: State<'_, SharedTimer>) -> Result<TimerSnapshot, String> {
    let engine = timer.lock().map_err(|e| e.to_string())?;
    Ok(engine.snapshot())
}

/// Spawns a background thread that emits timer_tick events every second.
pub fn start_tick_loop(app: AppHandle, timer: SharedTimer) {
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(1));
        let snapshot = {
            let engine = timer.lock().unwrap();
            if engine.phase == TimerPhase::Idle {
                continue;
            }
            engine.snapshot()
        };
        let _ = app.emit("timer_tick", &snapshot);
    });
}
```

- [ ] **Step 2: Wire commands into lib.rs**

Update `src-tauri/src/lib.rs`:
```rust
mod commands;
mod db;
mod timer;

use std::sync::Mutex;
use timer::TimerEngine;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let timer = Mutex::new(TimerEngine::new());

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:potato_hunter.db", db::migrations())
                .build(),
        )
        .manage(timer.clone())
        .invoke_handler(tauri::generate_handler![
            commands::timer_cmd::start_timer,
            commands::timer_cmd::pause_timer,
            commands::timer_cmd::resume_timer,
            commands::timer_cmd::retreat_timer,
            commands::timer_cmd::advance_timer_phase,
            commands::timer_cmd::get_timer_state,
        ])
        .setup(move |app| {
            commands::timer_cmd::start_tick_loop(app.handle().clone(), timer.clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Note: `Mutex::new(TimerEngine::new())` needs to be shared. Since `Mutex<TimerEngine>` doesn't implement `Clone`, we need to wrap in `Arc`. Adjust:

```rust
use std::sync::{Arc, Mutex};

pub fn run() {
    let timer = Arc::new(Mutex::new(TimerEngine::new()));

    tauri::Builder::default()
        // ...
        .manage(timer.clone())
        .setup(move |app| {
            commands::timer_cmd::start_tick_loop(app.handle().clone(), timer.clone());
            Ok(())
        })
        // ...
}
```

And update `SharedTimer` type in `timer.rs`:
```rust
pub type SharedTimer = Arc<Mutex<TimerEngine>>;
```

Add `use std::sync::Arc;` to `timer.rs`.

Update command signatures to use `State<'_, SharedTimer>` (which now wraps `Arc<Mutex<TimerEngine>>`).

- [ ] **Step 3: Build and verify**

```bash
npm run tauri dev
```
Expected: Compiles without errors, app opens.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/
git commit -m "feat: add timer Tauri commands with tick event loop"
```

### Task 7: Frontend timer store + event listener

**Files:**
- Create: `src/hooks/useTauriEvent.ts`
- Create: `src/lib/commands.ts`
- Create: `src/stores/timerStore.ts`

- [ ] **Step 1: Create Tauri event hook**

`src/hooks/useTauriEvent.ts`:
```typescript
import { useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export function useTauriEvent<T>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    let unlisten: UnlistenFn;
    listen<T>(event, (e) => handler(e.payload)).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, [event, handler]);
}
```

- [ ] **Step 2: Create typed command wrappers**

`src/lib/commands.ts`:
```typescript
import { invoke } from '@tauri-apps/api/core';
import type { TimerState } from '../types';

// Timer commands
export const startTimer = (params: {
  taskId: number;
  taskName: string;
  focusMinutes?: number;
  breakMinutes?: number;
  longBreakMinutes?: number;
  roundsBeforeLongBreak?: number;
}) =>
  invoke<TimerState>('start_timer', {
    taskId: params.taskId,
    taskName: params.taskName,
    focusMinutes: params.focusMinutes,
    breakMinutes: params.breakMinutes,
    longBreakMinutes: params.longBreakMinutes,
    roundsBeforeLongBreak: params.roundsBeforeLongBreak,
  });

export const pauseTimer = () => invoke<TimerState>('pause_timer');
export const resumeTimer = () => invoke<TimerState>('resume_timer');
export const retreatTimer = () => invoke<TimerState>('retreat_timer');
export const advanceTimerPhase = () => invoke<TimerState>('advance_timer_phase');
export const getTimerState = () => invoke<TimerState>('get_timer_state');
```

- [ ] **Step 3: Create timer Zustand store**

`src/stores/timerStore.ts`:
```typescript
import { create } from 'zustand';
import type { TimerState, TimerPhase } from '../types';
import * as cmd from '../lib/commands';

interface TimerStore {
  timer: TimerState;
  setTimer: (state: TimerState) => void;
  startHunt: (taskId: number, taskName: string, focusMinutes?: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  retreat: () => Promise<void>;
  advancePhase: () => Promise<void>;
}

const initialTimer: TimerState = {
  phase: 'idle',
  remaining_seconds: 0,
  total_seconds: 0,
  task_id: null,
  task_name: '',
  pomodoro_id: null,
  rounds_completed: 0,
  is_paused: false,
};

export const useTimerStore = create<TimerStore>((set) => ({
  timer: initialTimer,
  setTimer: (timer) => set({ timer }),
  startHunt: async (taskId, taskName, focusMinutes) => {
    const timer = await cmd.startTimer({ taskId, taskName, focusMinutes });
    set({ timer });
  },
  pause: async () => {
    const timer = await cmd.pauseTimer();
    set({ timer });
  },
  resume: async () => {
    const timer = await cmd.resumeTimer();
    set({ timer });
  },
  retreat: async () => {
    const timer = await cmd.retreatTimer();
    set({ timer });
  },
  advancePhase: async () => {
    const timer = await cmd.advanceTimerPhase();
    set({ timer });
  },
}));
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/ src/lib/commands.ts src/stores/timerStore.ts
git commit -m "feat: add frontend timer store with Tauri command wrappers"
```

---

## Chunk 3: Multi-Window + Hunt Overlay

### Task 8: Configure Tauri multi-window

**Files:**
- Create: `hunt.html`
- Create: `src/hunt.tsx`
- Create: `src/HuntApp.tsx`
- Modify: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Create hunt.html entry point**

`hunt.html` (in project root next to `index.html`):
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>狩猎中</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/hunt.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create hunt entry + app component**

`src/hunt.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HuntApp } from './HuntApp';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HuntApp />
  </React.StrictMode>
);
```

`src/HuntApp.tsx`:
```typescript
import { useCallback } from 'react';
import { useTimerStore } from './stores/timerStore';
import { useTauriEvent } from './hooks/useTauriEvent';
import type { TimerState } from './types';
import { PrepPhase } from './components/hunt/PrepPhase';
import { FocusPhase } from './components/hunt/FocusPhase';
import { ReviewPhase } from './components/hunt/ReviewPhase';

export function HuntApp() {
  const { timer, setTimer } = useTimerStore();

  const handleTick = useCallback(
    (payload: TimerState) => setTimer(payload),
    [setTimer]
  );
  useTauriEvent('timer_tick', handleTick);

  switch (timer.phase) {
    case 'prep':
      return <PrepPhase timer={timer} />;
    case 'focus':
      return <FocusPhase timer={timer} />;
    case 'review':
      return <ReviewPhase timer={timer} />;
    default:
      return <div className="p-4 text-stone-400">等待狩猎开始...</div>;
  }
}
```

- [ ] **Step 3: Update tauri.conf.json for multi-window**

In `src-tauri/tauri.conf.json`, ensure the `windows` array has only the main window. The hunt window will be created dynamically via Rust commands. Add the hunt.html to the build config if needed.

Add to `vite.config.ts` for multi-page:
```typescript
import { resolve } from "path";

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        hunt: resolve(__dirname, "hunt.html"),
      },
    },
  },
  // ... rest of config
}));
```

- [ ] **Step 4: Add Rust command to open/close hunt window**

Create `src-tauri/src/commands/window_cmd.rs`:
```rust
use tauri::{AppHandle, Manager, WebviewWindowBuilder, WebviewUrl};

#[tauri::command]
pub async fn open_hunt_window(app: AppHandle) -> Result<(), String> {
    // Close existing hunt window if any
    if let Some(w) = app.get_webview_window("hunt") {
        let _ = w.close();
    }

    WebviewWindowBuilder::new(&app, "hunt", WebviewUrl::App("hunt.html".into()))
        .title("狩猎中")
        .inner_size(360.0, 120.0)
        .resizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn close_hunt_window(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("hunt") {
        w.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

Register in `commands/mod.rs`:
```rust
pub mod timer_cmd;
pub mod window_cmd;
```

Add to `lib.rs` handler:
```rust
commands::window_cmd::open_hunt_window,
commands::window_cmd::close_hunt_window,
```

- [ ] **Step 5: Build and verify hunt window opens**

```bash
npm run tauri dev
```
Test by calling `open_hunt_window` from the browser console via `invoke('open_hunt_window')`. Expected: small always-on-top window appears.

- [ ] **Step 6: Commit**

```bash
git add hunt.html src/hunt.tsx src/HuntApp.tsx vite.config.ts src-tauri/src/commands/window_cmd.rs src-tauri/src/commands/mod.rs src-tauri/src/lib.rs
git commit -m "feat: add multi-window support for hunt overlay"
```

### Task 9: Hunt phase UI components

**Files:**
- Create: `src/components/common/ProgressBar.tsx`
- Create: `src/components/hunt/PrepPhase.tsx`
- Create: `src/components/hunt/FocusPhase.tsx`
- Create: `src/components/hunt/ReviewPhase.tsx`

- [ ] **Step 1: ProgressBar component**

`src/components/common/ProgressBar.tsx`:
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const pct = total > 0 ? Math.max(0, Math.min(100, ((total - current) / total) * 100)) : 0;
  return (
    <div className={`w-full bg-stone-700 rounded-full h-3 ${className}`}>
      <div
        className="bg-amber-500 h-3 rounded-full transition-all duration-1000"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 2: PrepPhase component**

`src/components/hunt/PrepPhase.tsx`:
```typescript
import type { TimerState } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { useTimerStore } from '../../stores/timerStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PrepPhase({ timer }: { timer: TimerState }) {
  const { retreat } = useTimerStore();

  return (
    <div className="bg-stone-900 text-white p-4 h-screen flex flex-col justify-center gap-2">
      <div className="text-sm text-amber-400">⚔️ 准备阶段</div>
      <div className="text-base font-bold truncate">{timer.task_name}</div>
      <ProgressBar current={timer.remaining_seconds} total={timer.total_seconds} />
      <div className="flex justify-between items-center">
        <span className="text-sm text-stone-400">{formatTime(timer.remaining_seconds)}</span>
        <button
          onClick={retreat}
          className="text-xs text-stone-500 hover:text-red-400"
        >
          放弃
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: FocusPhase component**

`src/components/hunt/FocusPhase.tsx`:
```typescript
import type { TimerState } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { useTimerStore } from '../../stores/timerStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FocusPhase({ timer }: { timer: TimerState }) {
  const { pause, resume, retreat } = useTimerStore();

  return (
    <div className="bg-stone-900 text-white p-4 h-screen flex flex-col justify-center gap-2">
      <div className="text-base font-bold truncate">🎯 {timer.task_name}</div>
      <ProgressBar current={timer.remaining_seconds} total={timer.total_seconds} />
      <div className="flex justify-between items-center">
        <span className="text-lg font-mono">{formatTime(timer.remaining_seconds)}</span>
        <div className="flex gap-2">
          {timer.is_paused ? (
            <button onClick={resume} className="text-xs px-2 py-1 bg-stone-700 rounded hover:bg-stone-600">
              继续
            </button>
          ) : (
            <button onClick={pause} className="text-xs px-2 py-1 bg-stone-700 rounded hover:bg-stone-600">
              暂停
            </button>
          )}
          <button onClick={retreat} className="text-xs px-2 py-1 text-stone-500 hover:text-red-400">
            放弃
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: ReviewPhase component**

`src/components/hunt/ReviewPhase.tsx`:
```typescript
import { useState } from 'react';
import type { TimerState, ReflectionType } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ReviewData {
  completionNote: string;
  reflectionType: ReflectionType | null;
  reflectionText: string;
}

export function ReviewPhase({ timer }: { timer: TimerState }) {
  const [review, setReview] = useState<ReviewData>({
    completionNote: '',
    reflectionType: null,
    reflectionText: '',
  });

  const reflectionOptions: { value: ReflectionType; label: string }[] = [
    { value: 'smooth', label: '很顺利，我做对了什么？' },
    { value: 'difficult', label: '遇到困难，下次如何改进？' },
    { value: 'discovery', label: '有新的想法或发现？' },
  ];

  return (
    <div className="bg-stone-900 text-white p-4 min-h-screen flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-amber-400">📝 回顾阶段</span>
        <span className="text-sm text-stone-400">{formatTime(timer.remaining_seconds)}</span>
      </div>
      <ProgressBar current={timer.remaining_seconds} total={timer.total_seconds} />

      <label className="text-sm">
        ✅ 你完成了什么？<span className="text-red-400">*</span>
      </label>
      <textarea
        value={review.completionNote}
        onChange={(e) => setReview({ ...review, completionNote: e.target.value })}
        className="bg-stone-800 rounded p-2 text-sm resize-none h-16"
        placeholder="简要描述本次完成的内容..."
      />

      <label className="text-sm">💡 反思（选填）</label>
      <div className="flex flex-col gap-1">
        {reflectionOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              setReview({
                ...review,
                reflectionType: review.reflectionType === opt.value ? null : opt.value,
              })
            }
            className={`text-left text-xs px-2 py-1 rounded ${
              review.reflectionType === opt.value
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {review.reflectionType && (
        <textarea
          value={review.reflectionText}
          onChange={(e) => setReview({ ...review, reflectionText: e.target.value })}
          className="bg-stone-800 rounded p-2 text-sm resize-none h-12"
          placeholder="写下你的想法..."
        />
      )}

      <button
        disabled={!review.completionNote.trim()}
        className="mt-auto bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded py-2 text-sm font-bold"
      >
        完成复盘，领取奖励
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add hunt overlay UI components (prep, focus, review phases)"
```

---

## Chunk 4: Village - Task Management

### Task 10: Task CRUD via tauri-plugin-sql

Since we use `tauri-plugin-sql`, the frontend can execute SQL directly without Rust commands for basic CRUD. This keeps things simple for MVP.

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/stores/taskStore.ts`

- [ ] **Step 1: Create DB helper**

`src/lib/db.ts`:
```typescript
import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:potato_hunter.db');
  }
  return db;
}
```

- [ ] **Step 2: Install frontend SQL plugin package**

```bash
npm install @tauri-apps/plugin-sql
```

- [ ] **Step 3: Create task store**

`src/stores/taskStore.ts`:
```typescript
import { create } from 'zustand';
import type { Task, TaskFormData, TaskStatus } from '../types';
import { getDb } from '../lib/db';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
  identifyTask: (id: number, monsterName: string, monsterDesc: string) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  damageTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    const db = await getDb();
    const tasks = await db.select<Task[]>('SELECT * FROM tasks ORDER BY created_at DESC');
    set({ tasks, loading: false });
  },

  createTask: async (data) => {
    const db = await getDb();
    const hp = data.estimated_pomodoros;
    const result = await db.execute(
      `INSERT INTO tasks (name, description, category, difficulty, estimated_pomodoros, total_hp, current_hp, repeat_config)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [data.name, data.description, data.category, data.difficulty, data.estimated_pomodoros, hp, hp, data.repeat_config]
    );
    const tasks = await db.select<Task[]>('SELECT * FROM tasks WHERE id = $1', [result.lastInsertId]);
    await get().fetchTasks();
    return tasks[0];
  },

  updateTaskStatus: async (id, status) => {
    const db = await getDb();
    const completedAt = status === 'killed' ? new Date().toISOString() : null;
    await db.execute(
      'UPDATE tasks SET status = $1, completed_at = $2 WHERE id = $3',
      [status, completedAt, id]
    );
    await get().fetchTasks();
  },

  identifyTask: async (id, monsterName, monsterDesc) => {
    const db = await getDb();
    await db.execute(
      `UPDATE tasks SET monster_name = $1, monster_description = $2, status = 'ready' WHERE id = $3`,
      [monsterName, monsterDesc, id]
    );
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    const db = await getDb();
    await db.execute('DELETE FROM tasks WHERE id = $1', [id]);
    await get().fetchTasks();
  },

  damageTask: async (id) => {
    const db = await getDb();
    await db.execute(
      `UPDATE tasks SET current_hp = MAX(0, current_hp - 1), actual_pomodoros = actual_pomodoros + 1 WHERE id = $1`,
      [id]
    );
    // Check if killed
    const rows = await db.select<Task[]>('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows[0] && rows[0].current_hp <= 0) {
      await db.execute(
        `UPDATE tasks SET status = 'killed', completed_at = $1 WHERE id = $2`,
        [new Date().toISOString(), id]
      );
    }
    await get().fetchTasks();
  },
}));
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.ts src/stores/taskStore.ts package.json package-lock.json
git commit -m "feat: add task store with SQLite CRUD operations"
```

### Task 11: Village UI - Inbox + TaskForm + HuntList

**Files:**
- Create: `src/components/village/VillageLayout.tsx`
- Create: `src/components/village/Inbox.tsx`
- Create: `src/components/village/TaskForm.tsx`
- Create: `src/components/village/HuntList.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: VillageLayout with tabs**

`src/components/village/VillageLayout.tsx`:
```typescript
import { useState } from 'react';
import { Inbox } from './Inbox';
import { HuntList } from './HuntList';
import { DailyPlanBoard } from './DailyPlanBoard';

type Tab = 'inbox' | 'hunts' | 'plan';

export function VillageLayout() {
  const [tab, setTab] = useState<Tab>('plan');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'inbox', label: '情报', icon: '📨' },
    { key: 'hunts', label: '猎物', icon: '🐺' },
    { key: 'plan', label: '今日', icon: '📋' },
  ];

  return (
    <div className="flex flex-col h-screen bg-stone-900 text-white">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-stone-700">
        <h1 className="text-lg font-bold">🏕️ 村庄</h1>
        <div className="flex gap-1 ml-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1 rounded text-sm ${
                tab === t.key ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'inbox' && <Inbox />}
        {tab === 'hunts' && <HuntList />}
        {tab === 'plan' && <DailyPlanBoard />}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Inbox component**

`src/components/village/Inbox.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { TaskForm } from './TaskForm';
import type { Task } from '../../types';

export function Inbox() {
  const { tasks, fetchTasks } = useTaskStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const inboxTasks = tasks.filter((t) => t.status === 'unidentified');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">📨 未确认情报</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1 rounded"
        >
          + 新任务
        </button>
      </div>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      {inboxTasks.length === 0 && !showForm && (
        <p className="text-stone-500 text-sm">没有待鉴定的情报</p>
      )}

      {inboxTasks.map((task) => (
        <InboxItem key={task.id} task={task} />
      ))}
    </div>
  );
}

function InboxItem({ task }: { task: Task }) {
  const { identifyTask } = useTaskStore();

  const handleIdentify = async () => {
    // MVP: simple offline name generation
    const adjectives = ['凶猛的', '狡猾的', '迅捷的', '顽固的', '沉默的'];
    const nouns: Record<string, string> = {
      work: '齿轮兽', study: '书卷龙', creative: '墨灵', life: '绿藤怪', other: '影魔',
    };
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[task.category] || '影魔';
    const name = `${adj}${noun}`;
    const desc = `由「${task.name}」孕育而生的怪物`;
    await identifyTask(task.id, name, desc);
  };

  return (
    <div className="bg-stone-800 rounded p-3 flex justify-between items-center">
      <div>
        <div className="font-bold text-sm">{task.name}</div>
        <div className="text-xs text-stone-400">{task.category} · {task.estimated_pomodoros} 番茄</div>
      </div>
      <button
        onClick={handleIdentify}
        className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded"
      >
        🔍 鉴定
      </button>
    </div>
  );
}
```

- [ ] **Step 3: TaskForm component**

`src/components/village/TaskForm.tsx`:
```typescript
import { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskCategory, TaskDifficulty, TaskFormData } from '../../types';

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'work', label: '工作' },
  { value: 'study', label: '学习' },
  { value: 'creative', label: '创作' },
  { value: 'life', label: '生活' },
  { value: 'other', label: '其他' },
];

const DIFFICULTIES: { value: TaskDifficulty; label: string; range: string; icon: string }[] = [
  { value: 'simple', label: '简单', range: '1-2 番茄', icon: '🦎' },
  { value: 'medium', label: '中等', range: '3-5 番茄', icon: '🐺' },
  { value: 'hard', label: '困难', range: '6-10 番茄', icon: '🐻' },
  { value: 'epic', label: '史诗', range: '11-20 番茄', icon: '🐉' },
  { value: 'legendary', label: '传说', range: '>20 番茄', icon: '👹' },
];

export function TaskForm({ onClose }: { onClose: () => void }) {
  const { createTask } = useTaskStore();
  const [form, setForm] = useState<TaskFormData>({
    name: '',
    description: '',
    category: 'work',
    difficulty: 'simple',
    estimated_pomodoros: 1,
    repeat_config: 'none',
  });

  const showSplitWarning = form.estimated_pomodoros > 5;

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await createTask(form);
    onClose();
  };

  return (
    <div className="bg-stone-800 rounded p-4 flex flex-col gap-3">
      <h3 className="font-bold text-sm">📝 发现新怪物</h3>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="任务名称 *"
        className="bg-stone-700 rounded px-3 py-2 text-sm"
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="任务描述（选填）"
        className="bg-stone-700 rounded px-3 py-2 text-sm resize-none h-16"
      />

      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setForm({ ...form, category: c.value })}
            className={`text-xs px-2 py-1 rounded ${
              form.category === c.value ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            onClick={() => setForm({ ...form, difficulty: d.value })}
            className={`text-left text-xs px-2 py-1 rounded flex justify-between ${
              form.difficulty === d.value ? 'bg-amber-600/20 text-amber-400' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }`}
          >
            <span>{d.icon} {d.label}（{d.range}）</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-stone-400">预估番茄数</label>
        <input
          type="number"
          min={1}
          value={form.estimated_pomodoros}
          onChange={(e) => setForm({ ...form, estimated_pomodoros: Math.max(1, parseInt(e.target.value) || 1) })}
          className="bg-stone-700 rounded px-2 py-1 w-16 text-sm text-center"
        />
      </div>

      {showSplitWarning && (
        <div className="bg-amber-900/30 border border-amber-600/30 rounded p-2 text-xs text-amber-400">
          ⚠️ 这个怪物太强大了！建议拆分成小任务以便逐个击破
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-300 px-3 py-1">
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          className="text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 px-3 py-1 rounded"
        >
          生成怪物
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: HuntList component**

`src/components/village/HuntList.tsx`:
```typescript
import { useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useTimerStore } from '../../stores/timerStore';
import { invoke } from '@tauri-apps/api/core';
import type { Task } from '../../types';

export function HuntList() {
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const readyTasks = tasks.filter((t) => t.status === 'ready' || t.status === 'hunting');

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold">🐺 猎物清单</h2>
      {readyTasks.length === 0 && (
        <p className="text-stone-500 text-sm">没有待狩猎的猎物，去情报栏鉴定一些吧</p>
      )}
      {readyTasks.map((task) => (
        <HuntItem key={task.id} task={task} />
      ))}
    </div>
  );
}

function HuntItem({ task }: { task: Task }) {
  const { startHunt } = useTimerStore();
  const hpPct = task.total_hp > 0 ? (task.current_hp / task.total_hp) * 100 : 100;

  const handleStartHunt = async () => {
    await startHunt(task.id, task.monster_name || task.name);
    await invoke('open_hunt_window');
  };

  return (
    <div className="bg-stone-800 rounded p-3 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-sm">{task.monster_name || task.name}</div>
          <div className="text-xs text-stone-400">{task.name}</div>
        </div>
        <button
          onClick={handleStartHunt}
          className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
        >
          ⚔️ 出击
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-stone-700 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${hpPct}%` }} />
        </div>
        <span className="text-xs text-stone-400">
          {task.current_hp}/{task.total_hp} HP
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create placeholder DailyPlanBoard**

`src/components/village/DailyPlanBoard.tsx`:
```typescript
export function DailyPlanBoard() {
  return (
    <div className="text-stone-500 text-sm">
      📋 今日狩猎计划（即将实现）
    </div>
  );
}
```

- [ ] **Step 6: Wire VillageLayout into App.tsx**

`src/App.tsx`:
```typescript
import { VillageLayout } from './components/village/VillageLayout';

export default function App() {
  return <VillageLayout />;
}
```

- [ ] **Step 7: Build and verify end-to-end**

```bash
npm run tauri dev
```
Expected: Village opens with tabs. Can create a task, identify it (generates monster name), see it in hunt list, click "出击" opens hunt overlay window.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add village UI with inbox, task form, and hunt list"
```

---

## Chunk 5: Daily Plan + Full Hunt Flow

### Task 12: Daily plan store + UI

**Files:**
- Create: `src/stores/planStore.ts`
- Modify: `src/components/village/DailyPlanBoard.tsx`

- [ ] **Step 1: Plan store**

`src/stores/planStore.ts`:
```typescript
import { create } from 'zustand';
import type { DailyPlan, PlannedTaskEntry, Task } from '../types';
import { getDb } from '../lib/db';

interface PlanStore {
  plan: DailyPlan | null;
  loading: boolean;
  fetchTodayPlan: () => Promise<void>;
  setBudget: (budget: number) => Promise<void>;
  addTaskToPlan: (taskId: number, pomodoros: number) => Promise<void>;
  removeTaskFromPlan: (entryId: number) => Promise<void>;
  incrementCompleted: (taskId: number) => Promise<void>;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plan: null,
  loading: false,

  fetchTodayPlan: async () => {
    set({ loading: true });
    const db = await getDb();
    const date = todayStr();

    // Ensure plan exists
    await db.execute(
      'INSERT OR IGNORE INTO daily_plans (date, total_budget) VALUES ($1, 8)',
      [date]
    );

    const plans = await db.select<{ date: string; total_budget: number }[]>(
      'SELECT * FROM daily_plans WHERE date = $1', [date]
    );

    const entries = await db.select<(PlannedTaskEntry & Task)[]>(
      `SELECT e.*, t.name, t.monster_name, t.monster_description, t.category, t.difficulty,
              t.estimated_pomodoros, t.actual_pomodoros, t.status, t.current_hp, t.total_hp
       FROM planned_task_entries e
       JOIN tasks t ON t.id = e.task_id
       WHERE e.plan_date = $1
       ORDER BY e.sort_order`,
      [date]
    );

    set({
      plan: {
        date: plans[0].date,
        total_budget: plans[0].total_budget,
        entries,
      },
      loading: false,
    });
  },

  setBudget: async (budget) => {
    const db = await getDb();
    await db.execute('UPDATE daily_plans SET total_budget = $1 WHERE date = $2', [budget, todayStr()]);
    await get().fetchTodayPlan();
  },

  addTaskToPlan: async (taskId, pomodoros) => {
    const db = await getDb();
    const date = todayStr();
    const entries = await db.select<{ sort_order: number }[]>(
      'SELECT sort_order FROM planned_task_entries WHERE plan_date = $1 ORDER BY sort_order DESC LIMIT 1',
      [date]
    );
    const nextOrder = entries.length > 0 ? entries[0].sort_order + 1 : 0;
    await db.execute(
      `INSERT INTO planned_task_entries (plan_date, task_id, planned_pomodoros_today, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [date, taskId, pomodoros, nextOrder]
    );
    await get().fetchTodayPlan();
  },

  removeTaskFromPlan: async (entryId) => {
    const db = await getDb();
    await db.execute('DELETE FROM planned_task_entries WHERE id = $1', [entryId]);
    await get().fetchTodayPlan();
  },

  incrementCompleted: async (taskId) => {
    const db = await getDb();
    await db.execute(
      `UPDATE planned_task_entries SET completed_pomodoros_today = completed_pomodoros_today + 1
       WHERE plan_date = $1 AND task_id = $2`,
      [todayStr(), taskId]
    );
    await get().fetchTodayPlan();
  },
}));
```

- [ ] **Step 2: Implement DailyPlanBoard**

`src/components/village/DailyPlanBoard.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { usePlanStore } from '../../stores/planStore';
import { useTaskStore } from '../../stores/taskStore';
import { useTimerStore } from '../../stores/timerStore';
import { invoke } from '@tauri-apps/api/core';
import { ProgressBar } from '../common/ProgressBar';

export function DailyPlanBoard() {
  const { plan, fetchTodayPlan, setBudget, addTaskToPlan, removeTaskFromPlan } = usePlanStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { startHunt } = useTimerStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchTodayPlan();
    fetchTasks();
  }, [fetchTodayPlan, fetchTasks]);

  if (!plan) return <div className="text-stone-500 text-sm">加载中...</div>;

  const allocated = plan.entries.reduce((sum, e) => sum + e.planned_pomodoros_today, 0);
  const readyTasks = tasks.filter(
    (t) => (t.status === 'ready' || t.status === 'hunting') && !plan.entries.some((e) => e.task_id === t.id)
  );

  const handleStartHunt = async (taskId: number, name: string) => {
    await startHunt(taskId, name);
    await invoke('open_hunt_window');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">📋 今日狩猎计划</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className={allocated > plan.total_budget ? 'text-red-400' : 'text-stone-400'}>
            已分配 {allocated}/{plan.total_budget} 番茄
          </span>
          <input
            type="number"
            min={1}
            value={plan.total_budget}
            onChange={(e) => setBudget(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-stone-700 rounded px-2 py-1 w-12 text-center text-xs"
          />
        </div>
      </div>

      {allocated > plan.total_budget && (
        <div className="bg-red-900/30 border border-red-600/30 rounded p-2 text-xs text-red-400">
          ⚠️ 今天的猎物太多了，体力不够！
        </div>
      )}

      {plan.entries.map((entry: any) => (
        <div key={entry.id} className="bg-stone-800 rounded p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-sm">{entry.monster_name || entry.name}</div>
              <div className="text-xs text-stone-400">{entry.name}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartHunt(entry.task_id, entry.monster_name || entry.name)}
                className="bg-red-700 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ⚔️
              </button>
              <button
                onClick={() => removeTaskFromPlan(entry.id)}
                className="text-stone-500 hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <ProgressBar
              current={entry.planned_pomodoros_today - entry.completed_pomodoros_today}
              total={entry.planned_pomodoros_today}
              className="flex-1"
            />
            <span>{entry.completed_pomodoros_today}/{entry.planned_pomodoros_today}</span>
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowAdd(!showAdd)}
        className="text-xs text-stone-400 hover:text-amber-400"
      >
        + 添加猎物到今日计划
      </button>

      {showAdd && (
        <div className="bg-stone-800 rounded p-3 flex flex-col gap-2">
          {readyTasks.length === 0 ? (
            <p className="text-xs text-stone-500">没有可添加的猎物</p>
          ) : (
            readyTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  addTaskToPlan(t.id, Math.min(t.current_hp, plan.total_budget - allocated));
                  setShowAdd(false);
                }}
                className="text-left text-xs bg-stone-700 hover:bg-stone-600 rounded px-2 py-1"
              >
                {t.monster_name || t.name} ({t.current_hp} HP)
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/planStore.ts src/components/village/DailyPlanBoard.tsx
git commit -m "feat: add daily plan with budget tracking and task allocation"
```

### Task 13: Wire full hunt → settlement flow

**Files:**
- Create: `src/components/settlement/Settlement.tsx`
- Create: `src/components/settlement/RestScreen.tsx`
- Create: `src/lib/loot.ts`
- Modify: `src/HuntApp.tsx`

- [ ] **Step 1: Loot calculation**

`src/lib/loot.ts`:
```typescript
import type { TaskCategory, LootDrop } from '../types';
import { getDb } from './db';

// Material IDs from seed data:
// 1=墨水碎片(creative), 2=齿轮零件(work), 3=知识结晶(study), 4=生活纤维(life), 5=通用碎片(other)
// 6=灵感精华(creative,rare), 7=精密齿轮(work,rare), 8=智慧宝石(study,rare), 9=生命露珠(life,rare), 10=虹彩碎片(other,rare)

const CATEGORY_MATERIAL: Record<TaskCategory, { common: number; rare: number }> = {
  creative: { common: 1, rare: 6 },
  work: { common: 2, rare: 7 },
  study: { common: 3, rare: 8 },
  life: { common: 4, rare: 9 },
  other: { common: 5, rare: 10 },
};

export async function generateLoot(
  category: TaskCategory,
  consecutiveCount: number,
  bonusMultiplier: number = 1
): Promise<{ materialId: number; quantity: number }[]> {
  const drops: { materialId: number; quantity: number }[] = [];
  const pool = CATEGORY_MATERIAL[category];

  // Guaranteed common drop
  const commonQty = Math.ceil((1 + Math.floor(consecutiveCount / 3)) * bonusMultiplier);
  drops.push({ materialId: pool.common, quantity: commonQty });

  // Universal common drop
  drops.push({ materialId: 5, quantity: Math.ceil(1 * bonusMultiplier) });

  // Rare drop: 20% base + 5% per consecutive
  const rareChance = Math.min(0.5, 0.2 + consecutiveCount * 0.05);
  if (Math.random() < rareChance) {
    drops.push({ materialId: pool.rare, quantity: Math.ceil(1 * bonusMultiplier) });
  }

  return drops;
}

export async function applyLoot(
  pomodoroId: number,
  drops: { materialId: number; quantity: number }[]
): Promise<void> {
  const db = await getDb();
  for (const drop of drops) {
    await db.execute(
      'INSERT INTO loot_drops (pomodoro_id, material_id, quantity) VALUES ($1, $2, $3)',
      [pomodoroId, drop.materialId, drop.quantity]
    );
    await db.execute(
      `INSERT INTO player_materials (material_id, quantity) VALUES ($1, $2)
       ON CONFLICT(material_id) DO UPDATE SET quantity = quantity + $2`,
      [drop.materialId, drop.quantity]
    );
  }
}
```

- [ ] **Step 2: Settlement screen**

`src/components/settlement/Settlement.tsx`:
```typescript
import { useEffect, useState } from 'react';
import type { Material } from '../../types';
import { getDb } from '../../lib/db';

interface SettlementProps {
  drops: { materialId: number; quantity: number }[];
  onContinue: () => void;
}

export function Settlement({ drops, onContinue }: SettlementProps) {
  const [materials, setMaterials] = useState<Map<number, Material>>(new Map());

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const mats = await db.select<Material[]>('SELECT * FROM materials');
      setMaterials(new Map(mats.map((m) => [m.id, m])));
    })();
  }, []);

  return (
    <div className="bg-stone-900 text-white p-4 min-h-screen flex flex-col gap-4">
      <h2 className="text-lg font-bold">🏆 狩猎成果</h2>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-stone-400">你获得了：</p>
        {drops.map((drop, i) => {
          const mat = materials.get(drop.materialId);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>{mat?.icon || '🔮'}</span>
              <span>{mat?.name || '未知素材'}</span>
              <span className="text-amber-400">x{drop.quantity}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="mt-auto bg-amber-600 hover:bg-amber-500 text-white rounded py-2 text-sm font-bold"
      >
        继续
      </button>
    </div>
  );
}
```

- [ ] **Step 3: RestScreen**

`src/components/settlement/RestScreen.tsx`:
```typescript
import { useCallback } from 'react';
import { useTimerStore } from '../../stores/timerStore';
import { useTauriEvent } from '../../hooks/useTauriEvent';
import type { TimerState } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const HEALTH_TIPS = [
  '起身走动，喝杯水 💧',
  '眺望远方，放松眼睛 👀',
  '做几个深呼吸 🌬️',
  '简单拉伸一下 🧘',
  '活动一下手腕和肩膀 💪',
];

export function RestScreen() {
  const { timer, setTimer, advancePhase } = useTimerStore();

  const handleTick = useCallback(
    (payload: TimerState) => setTimer(payload),
    [setTimer]
  );
  useTauriEvent('timer_tick', handleTick);

  const tip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
  const isLongBreak = timer.phase === 'long_break';

  return (
    <div className="bg-stone-900 text-white p-4 min-h-screen flex flex-col gap-4">
      <h2 className="text-lg font-bold">🌿 {isLongBreak ? '长休息' : '休息时间'}</h2>

      <ProgressBar current={timer.remaining_seconds} total={timer.total_seconds} />
      <span className="text-2xl font-mono text-center">{formatTime(timer.remaining_seconds)}</span>

      <div className="bg-stone-800 rounded p-3 text-sm">
        <p className="text-stone-400 mb-1">💪 建议活动：</p>
        <p>{tip}</p>
      </div>

      <button
        onClick={advancePhase}
        className="mt-auto bg-amber-600 hover:bg-amber-500 text-white rounded py-2 text-sm font-bold"
      >
        准备好了，继续下一个
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Update HuntApp to handle full flow**

Replace `src/HuntApp.tsx`:
```typescript
import { useCallback, useState } from 'react';
import { useTimerStore } from './stores/timerStore';
import { useTaskStore } from './stores/taskStore';
import { usePlanStore } from './stores/planStore';
import { useTauriEvent } from './hooks/useTauriEvent';
import { generateLoot, applyLoot } from './lib/loot';
import { getDb } from './lib/db';
import type { TimerState, TaskCategory } from './types';
import { PrepPhase } from './components/hunt/PrepPhase';
import { FocusPhase } from './components/hunt/FocusPhase';
import { ReviewPhase } from './components/hunt/ReviewPhase';
import { Settlement } from './components/settlement/Settlement';
import { RestScreen } from './components/settlement/RestScreen';

type FlowPhase = 'hunting' | 'settlement' | 'rest';

export function HuntApp() {
  const { timer, setTimer, advancePhase } = useTimerStore();
  const { damageTask, fetchTasks } = useTaskStore();
  const { incrementCompleted } = usePlanStore();
  const [flowPhase, setFlowPhase] = useState<FlowPhase>('hunting');
  const [drops, setDrops] = useState<{ materialId: number; quantity: number }[]>([]);

  const handleTick = useCallback(
    (payload: TimerState) => setTimer(payload),
    [setTimer]
  );
  useTauriEvent('timer_tick', handleTick);

  const handleReviewComplete = async (note: string, reflType: string | null, reflText: string) => {
    if (!timer.task_id) return;

    // Record pomodoro in DB
    const db = await getDb();
    const result = await db.execute(
      `INSERT INTO pomodoros (task_id, started_at, ended_at, result, completion_note, reflection_type, reflection_text, loadout_snapshot)
       VALUES ($1, $2, $3, 'completed', $4, $5, $6, '{}')`,
      [timer.task_id, new Date().toISOString(), new Date().toISOString(), note, reflType, reflText]
    );

    // Damage the monster
    await damageTask(timer.task_id);
    await incrementCompleted(timer.task_id);

    // Generate loot
    const taskRows = await db.select<{ category: TaskCategory }[]>(
      'SELECT category FROM tasks WHERE id = $1', [timer.task_id]
    );
    const category = taskRows[0]?.category || 'other';
    const lootDrops = await generateLoot(category, timer.rounds_completed);
    await applyLoot(result.lastInsertId, lootDrops);

    setDrops(lootDrops);

    // Advance timer to break phase
    await advancePhase();
    setFlowPhase('settlement');
  };

  const handleSettlementDone = () => {
    setFlowPhase('rest');
  };

  const handleRestDone = () => {
    setFlowPhase('hunting');
    setDrops([]);
  };

  if (flowPhase === 'settlement') {
    return <Settlement drops={drops} onContinue={handleSettlementDone} />;
  }

  if (flowPhase === 'rest' && (timer.phase === 'break' || timer.phase === 'long_break')) {
    return <RestScreen />;
  }

  // Hunting phases
  switch (timer.phase) {
    case 'prep':
      return <PrepPhase timer={timer} />;
    case 'focus':
      return <FocusPhase timer={timer} />;
    case 'review':
      return <ReviewPhase timer={timer} onComplete={handleReviewComplete} />;
    default:
      return <div className="bg-stone-900 text-stone-400 p-4">等待狩猎开始...</div>;
  }
}
```

Note: `ReviewPhase` needs to accept `onComplete` prop. Update its interface:

In `src/components/hunt/ReviewPhase.tsx`, change the props and add the handler:
```typescript
interface ReviewPhaseProps {
  timer: TimerState;
  onComplete?: (note: string, reflType: string | null, reflText: string) => void;
}

export function ReviewPhase({ timer, onComplete }: ReviewPhaseProps) {
  // ... existing state ...

  const handleSubmit = () => {
    if (!review.completionNote.trim()) return;
    onComplete?.(review.completionNote, review.reflectionType, review.reflectionText);
  };

  // ... existing JSX, but change the submit button:
  // onClick={handleSubmit}
}
```

- [ ] **Step 5: Build and test full loop**

```bash
npm run tauri dev
```
Expected flow: Create task → Identify → Add to plan → Start hunt → Prep → Focus → Review (fill note) → Settlement (see loot) → Rest → Back to idle.

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: wire full hunt→settlement→rest flow with loot generation"
```

---

## Chunk 6: Equipment, Crafting & Loadout

### Task 14: Inventory + equipment store

**Files:**
- Create: `src/stores/inventoryStore.ts`

- [ ] **Step 1: Create inventory store**

`src/stores/inventoryStore.ts`:
```typescript
import { create } from 'zustand';
import type { Equipment, Material, Loadout, EquipmentEffect } from '../types';
import { getDb } from '../lib/db';

interface InventoryStore {
  materials: { material: Material; quantity: number }[];
  ownedEquipment: { equipment: Equipment; quantity: number }[];
  allEquipment: Equipment[];
  loadout: Loadout;
  fetchAll: () => Promise<void>;
  craftEquipment: (equipmentId: number) => Promise<boolean>;
  equipWeapon: (id: number | null) => Promise<void>;
  equipArmor: (id: number | null) => Promise<void>;
  useConsumable: (equipmentId: number) => Promise<boolean>;
  getActiveWeaponEffect: () => EquipmentEffect | null;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  materials: [],
  ownedEquipment: [],
  allEquipment: [],
  loadout: { weapon_id: null, armor_id: null, items: [] },

  fetchAll: async () => {
    const db = await getDb();

    const mats = await db.select<(Material & { quantity: number })[]>(
      `SELECT m.*, COALESCE(pm.quantity, 0) as quantity
       FROM materials m LEFT JOIN player_materials pm ON pm.material_id = m.id`
    );

    const equips = await db.select<(Equipment & { owned_qty: number })[]>(
      `SELECT e.*, COALESCE(pe.quantity, 0) as owned_qty
       FROM equipment e LEFT JOIN player_equipment pe ON pe.equipment_id = e.id`
    );

    const loadoutRows = await db.select<{ weapon_id: number | null; armor_id: number | null; items: string }[]>(
      'SELECT * FROM loadout WHERE id = 1'
    );

    const parsedEquips = equips.map((e) => ({
      equipment: {
        ...e,
        effect: JSON.parse(e.effect as unknown as string) as EquipmentEffect,
        recipe: JSON.parse(e.recipe as unknown as string) as Record<number, number>,
        unlocked: Boolean(e.unlocked),
        is_consumable: Boolean(e.is_consumable),
      },
      quantity: e.owned_qty,
    }));

    set({
      materials: mats.map((m) => ({ material: m, quantity: m.quantity })),
      ownedEquipment: parsedEquips.filter((e) => e.quantity > 0),
      allEquipment: parsedEquips.map((e) => e.equipment),
      loadout: loadoutRows[0]
        ? {
            weapon_id: loadoutRows[0].weapon_id,
            armor_id: loadoutRows[0].armor_id,
            items: JSON.parse(loadoutRows[0].items),
          }
        : { weapon_id: null, armor_id: null, items: [] },
    });
  },

  craftEquipment: async (equipmentId) => {
    const db = await getDb();
    const equip = get().allEquipment.find((e) => e.id === equipmentId);
    if (!equip || !equip.unlocked) return false;

    // Check materials
    for (const [matId, needed] of Object.entries(equip.recipe)) {
      const inv = get().materials.find((m) => m.material.id === Number(matId));
      if (!inv || inv.quantity < needed) return false;
    }

    // Deduct materials
    for (const [matId, needed] of Object.entries(equip.recipe)) {
      await db.execute(
        'UPDATE player_materials SET quantity = quantity - $1 WHERE material_id = $2',
        [needed, Number(matId)]
      );
    }

    // Add equipment
    await db.execute(
      `INSERT INTO player_equipment (equipment_id, quantity) VALUES ($1, 1)
       ON CONFLICT(equipment_id) DO UPDATE SET quantity = quantity + 1`,
      [equipmentId]
    );

    await get().fetchAll();
    return true;
  },

  equipWeapon: async (id) => {
    const db = await getDb();
    await db.execute('UPDATE loadout SET weapon_id = $1 WHERE id = 1', [id]);
    await get().fetchAll();
  },

  equipArmor: async (id) => {
    const db = await getDb();
    await db.execute('UPDATE loadout SET armor_id = $1 WHERE id = 1', [id]);
    await get().fetchAll();
  },

  useConsumable: async (equipmentId) => {
    const owned = get().ownedEquipment.find((e) => e.equipment.id === equipmentId);
    if (!owned || owned.quantity <= 0) return false;
    const db = await getDb();
    await db.execute(
      'UPDATE player_equipment SET quantity = quantity - 1 WHERE equipment_id = $1',
      [equipmentId]
    );
    await get().fetchAll();
    return true;
  },

  getActiveWeaponEffect: () => {
    const { loadout, allEquipment } = get();
    if (!loadout.weapon_id) return null;
    const weapon = allEquipment.find((e) => e.id === loadout.weapon_id);
    return weapon?.effect || null;
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/inventoryStore.ts
git commit -m "feat: add inventory store with crafting and loadout management"
```

### Task 15: Workshop UI

**Files:**
- Create: `src/components/village/Workshop.tsx`
- Modify: `src/components/village/VillageLayout.tsx`

- [ ] **Step 1: Workshop component**

`src/components/village/Workshop.tsx`:
```typescript
import { useEffect } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';

export function Workshop() {
  const { materials, ownedEquipment, allEquipment, loadout, fetchAll, craftEquipment, equipWeapon, equipArmor } =
    useInventoryStore();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const weapons = allEquipment.filter((e) => e.type === 'weapon');
  const armors = allEquipment.filter((e) => e.type === 'armor');
  const items = allEquipment.filter((e) => e.type === 'item');

  const getMaterialQty = (id: number) => materials.find((m) => m.material.id === id)?.quantity || 0;
  const getOwnedQty = (id: number) => ownedEquipment.find((e) => e.equipment.id === id)?.quantity || 0;

  const canCraft = (equip: typeof allEquipment[0]) => {
    if (!equip.unlocked) return false;
    return Object.entries(equip.recipe).every(
      ([matId, needed]) => getMaterialQty(Number(matId)) >= (needed as number)
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-bold">🔨 工坊</h2>

      {/* Materials inventory */}
      <div>
        <h3 className="text-sm font-bold text-stone-400 mb-2">素材库存</h3>
        <div className="flex flex-wrap gap-2">
          {materials.filter((m) => m.quantity > 0).map((m) => (
            <div key={m.material.id} className="bg-stone-800 rounded px-2 py-1 text-xs flex items-center gap-1">
              <span>{m.material.icon}</span>
              <span>{m.material.name}</span>
              <span className="text-amber-400">x{m.quantity}</span>
            </div>
          ))}
          {materials.every((m) => m.quantity === 0) && (
            <span className="text-xs text-stone-500">还没有素材，完成狩猎来获取！</span>
          )}
        </div>
      </div>

      {/* Weapons */}
      <EquipmentSection
        title="⚔️ 武器"
        items={weapons}
        equippedId={loadout.weapon_id}
        onEquip={equipWeapon}
        onCraft={craftEquipment}
        canCraft={canCraft}
        getOwnedQty={getOwnedQty}
        getMaterialQty={getMaterialQty}
        allMaterials={materials}
      />

      {/* Armor */}
      <EquipmentSection
        title="🛡️ 护甲"
        items={armors}
        equippedId={loadout.armor_id}
        onEquip={equipArmor}
        onCraft={craftEquipment}
        canCraft={canCraft}
        getOwnedQty={getOwnedQty}
        getMaterialQty={getMaterialQty}
        allMaterials={materials}
      />

      {/* Consumables */}
      <div>
        <h3 className="text-sm font-bold text-stone-400 mb-2">🧪 道具</h3>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="bg-stone-800 rounded p-2 flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{item.name}</div>
                <div className="text-xs text-stone-400">{item.description}</div>
                <div className="text-xs text-amber-400">持有: {getOwnedQty(item.id)}</div>
              </div>
              {item.unlocked && canCraft(item) && (
                <button
                  onClick={() => craftEquipment(item.id)}
                  className="text-xs bg-amber-600 hover:bg-amber-500 px-2 py-1 rounded"
                >
                  制作
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquipmentSection({
  title, items, equippedId, onEquip, onCraft, canCraft, getOwnedQty, getMaterialQty, allMaterials,
}: {
  title: string;
  items: any[];
  equippedId: number | null;
  onEquip: (id: number | null) => Promise<void>;
  onCraft: (id: number) => Promise<boolean>;
  canCraft: (equip: any) => boolean;
  getOwnedQty: (id: number) => number;
  getMaterialQty: (id: number) => number;
  allMaterials: any[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-stone-400 mb-2">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const owned = getOwnedQty(item.id) > 0;
          const equipped = equippedId === item.id;
          return (
            <div
              key={item.id}
              className={`bg-stone-800 rounded p-2 flex justify-between items-center ${
                equipped ? 'ring-1 ring-amber-500' : ''
              }`}
            >
              <div>
                <div className="text-sm font-bold">
                  {item.name} {equipped && <span className="text-amber-400 text-xs">装备中</span>}
                </div>
                <div className="text-xs text-stone-400">{item.description}</div>
              </div>
              {owned && !equipped && (
                <button
                  onClick={() => onEquip(item.id)}
                  className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded"
                >
                  装备
                </button>
              )}
              {!owned && item.unlocked && canCraft(item) && (
                <button
                  onClick={() => onCraft(item.id)}
                  className="text-xs bg-amber-600 hover:bg-amber-500 px-2 py-1 rounded"
                >
                  制作
                </button>
              )}
              {!owned && !canCraft(item) && (
                <span className="text-xs text-stone-600">{item.unlocked ? '素材不足' : '🔒'}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add workshop tab to VillageLayout**

In `src/components/village/VillageLayout.tsx`, add tab and import:

```typescript
import { Workshop } from './Workshop';

// Add to tabs array:
{ key: 'workshop', label: '工坊', icon: '🔨' },

// Add to render:
{tab === 'workshop' && <Workshop />}
```

Update `Tab` type: `type Tab = 'inbox' | 'hunts' | 'plan' | 'workshop';`

- [ ] **Step 3: Commit**

```bash
git add src/components/village/ src/stores/inventoryStore.ts
git commit -m "feat: add workshop UI with crafting and loadout management"
```

---

## Chunk 7: Monster Journal + Polish

### Task 16: Monster Journal (图鉴)

**Files:**
- Create: `src/components/journal/Journal.tsx`
- Modify: `src/components/village/VillageLayout.tsx`

- [ ] **Step 1: Journal component**

`src/components/journal/Journal.tsx`:
```typescript
import { useEffect, useState } from 'react';
import type { Task, Pomodoro } from '../../types';
import { getDb } from '../../lib/db';

interface JournalEntry {
  task: Task;
  pomodoros: Pomodoro[];
}

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const tasks = await db.select<Task[]>(
        `SELECT * FROM tasks WHERE status = 'killed' ORDER BY completed_at DESC`
      );
      const result: JournalEntry[] = [];
      for (const task of tasks) {
        const pomodoros = await db.select<Pomodoro[]>(
          'SELECT * FROM pomodoros WHERE task_id = $1 ORDER BY started_at', [task.id]
        );
        result.push({ task, pomodoros });
      }
      setEntries(result);
    })();
  }, []);

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setSelected(null)} className="text-xs text-stone-400 hover:text-white self-start">
          ← 返回图鉴
        </button>
        <div className="bg-stone-800 rounded p-4">
          <h2 className="text-lg font-bold">{selected.task.monster_name}</h2>
          <p className="text-sm text-stone-400">{selected.task.name}</p>
          <p className="text-xs text-stone-500 mt-1">{selected.task.monster_description}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-stone-700 rounded p-2">
              <span className="text-stone-400">预估番茄</span>
              <span className="block text-lg font-bold">{selected.task.estimated_pomodoros}</span>
            </div>
            <div className="bg-stone-700 rounded p-2">
              <span className="text-stone-400">实际番茄</span>
              <span className="block text-lg font-bold">{selected.task.actual_pomodoros}</span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-stone-400">狩猎记录</h3>
        {selected.pomodoros.map((p) => (
          <div key={p.id} className="bg-stone-800 rounded p-3 text-sm">
            <div className="font-bold">{p.completion_note || '（无记录）'}</div>
            {p.reflection_text && (
              <div className="text-xs text-stone-400 mt-1">💡 {p.reflection_text}</div>
            )}
            <div className="text-xs text-stone-500 mt-1">{p.started_at}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold">📖 狩猎图鉴</h2>
      {entries.length === 0 && (
        <p className="text-stone-500 text-sm">还没有击杀记录，完成一次狩猎吧！</p>
      )}
      {entries.map((entry) => (
        <button
          key={entry.task.id}
          onClick={() => setSelected(entry)}
          className="bg-stone-800 rounded p-3 text-left hover:bg-stone-700"
        >
          <div className="font-bold text-sm">{entry.task.monster_name}</div>
          <div className="text-xs text-stone-400">
            {entry.task.name} · {entry.task.actual_pomodoros}/{entry.task.estimated_pomodoros} 番茄
            · {entry.task.completed_at?.slice(0, 10)}
          </div>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add journal tab to VillageLayout**

Add to tabs: `{ key: 'journal', label: '图鉴', icon: '📖' }`

Add to render: `{tab === 'journal' && <Journal />}`

Update `Tab` type: `type Tab = 'inbox' | 'hunts' | 'plan' | 'workshop' | 'journal';`

- [ ] **Step 3: Commit**

```bash
git add src/components/journal/ src/components/village/VillageLayout.tsx
git commit -m "feat: add monster journal with hunt history and statistics"
```

### Task 17: System tray + notifications

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Add tray plugin**

In `Cargo.toml`:
```toml
tauri-plugin-notification = "2"
```

- [ ] **Step 2: Setup system tray in lib.rs**

Add to `lib.rs` setup:
```rust
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

// Inside .setup(|app| { ... })
let show = MenuItemBuilder::with_id("show", "显示村庄").build(app)?;
let quit = MenuItemBuilder::with_id("quit", "退出").build(app)?;
let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

TrayIconBuilder::new()
    .menu(&menu)
    .on_menu_event(move |app, event| {
        match event.id().as_ref() {
            "show" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "quit" => app.exit(0),
            _ => {}
        }
    })
    .build(app)?;
```

Also register notification plugin:
```rust
.plugin(tauri_plugin_notification::init())
```

- [ ] **Step 3: Build and verify tray icon appears**

```bash
npm run tauri dev
```
Expected: System tray icon appears, right-click shows menu.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/
git commit -m "feat: add system tray and notification plugin"
```

### Task 18: Settings store

**Files:**
- Create: `src/stores/settingsStore.ts`

- [ ] **Step 1: Settings store**

`src/stores/settingsStore.ts`:
```typescript
import { create } from 'zustand';
import { getDb } from '../lib/db';

interface SettingsStore {
  soundEnabled: boolean;
  fetchSettings: () => Promise<void>;
  toggleSound: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,

  fetchSettings: async () => {
    const db = await getDb();
    const rows = await db.select<{ key: string; value: string }[]>(
      "SELECT * FROM settings WHERE key = 'sound_enabled'"
    );
    set({ soundEnabled: rows[0]?.value !== 'false' });
  },

  toggleSound: async () => {
    const db = await getDb();
    const newVal = !get().soundEnabled;
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('sound_enabled', $1)",
      [String(newVal)]
    );
    set({ soundEnabled: newVal });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/settingsStore.ts
git commit -m "feat: add settings store for user preferences"
```

---

## Chunk 8: Critical Missing Mechanics

### Task 19: Pause requires consumable + 3-min auto-retreat

The spec requires: pause consumes a smoke bomb item, max 3 min, auto-retreat on timeout, no pause button if no item.

**Files:**
- Modify: `src-tauri/src/timer.rs`
- Modify: `src-tauri/src/commands/timer_cmd.rs`
- Modify: `src/components/hunt/FocusPhase.tsx`
- Modify: `src/stores/timerStore.ts`

- [ ] **Step 1: Add pause tracking to TimerEngine**

In `src-tauri/src/timer.rs`, add to `TimerEngine`:
```rust
pub pause_started_at: Option<Instant>,
pub max_pause_seconds: u64, // from armor effect, default 180
```

Update `pause()`:
```rust
pub fn pause(&mut self) -> bool {
    if self.is_paused { return false; }
    if let Some(start) = self.phase_start {
        self.elapsed_before_pause += start.elapsed().as_secs();
    }
    self.is_paused = true;
    self.pause_started_at = Some(Instant::now());
    self.phase_start = None;
    true
}
```

Add `pause_elapsed()`:
```rust
pub fn pause_elapsed(&self) -> u64 {
    self.pause_started_at.map(|s| s.elapsed().as_secs()).unwrap_or(0)
}

pub fn is_pause_expired(&self) -> bool {
    self.is_paused && self.pause_elapsed() >= self.max_pause_seconds
}
```

- [ ] **Step 2: Update tick loop to auto-retreat on pause timeout**

In `start_tick_loop`, after getting snapshot:
```rust
// Check pause timeout
{
    let engine = timer.lock().unwrap();
    if engine.is_pause_expired() {
        drop(engine);
        let mut engine = timer.lock().unwrap();
        engine.retreat();
        let snapshot = engine.snapshot();
        let _ = app.emit("timer_tick", &snapshot);
        let _ = app.emit("pause_timeout_retreat", &());
        continue;
    }
}
```

- [ ] **Step 3: Update `pause_timer` command to require consumable validation**

In `timer_cmd.rs`, update `pause_timer`:
```rust
#[tauri::command]
pub fn pause_timer(
    timer: State<'_, SharedTimer>,
    has_consumable: bool,
) -> Result<TimerSnapshot, String> {
    if !has_consumable {
        return Err("没有暂停道具（烟雾弹），无法暂停".to_string());
    }
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.pause();
    Ok(engine.snapshot())
}
```

- [ ] **Step 4: Update frontend pause flow**

In `src/stores/timerStore.ts`, update `pause`:
```typescript
pause: async () => {
    // Consume smoke bomb via inventory store before calling backend
    const timer = await cmd.pauseTimer(true);
    set({ timer });
},
```

In `src/lib/commands.ts`, update:
```typescript
export const pauseTimer = (hasConsumable: boolean) =>
  invoke<TimerState>('pause_timer', { hasConsumable });
```

In `src/components/hunt/FocusPhase.tsx`:
- Import `useInventoryStore`
- Check if player owns smoke bomb (equipment_id = 6)
- If no smoke bomb: hide pause button, show only retreat
- On pause click: call `useConsumable(6)` first, then `pause()`

```typescript
const { ownedEquipment, useConsumable, fetchAll } = useInventoryStore();
const hasSmokeBoomb = ownedEquipment.some(e => e.equipment.id === 6 && e.quantity > 0);

// In JSX: only show pause button if hasSmokeBoomb
{hasSmokeBoomb ? (
  <button onClick={async () => { await useConsumable(6); await pause(); }} ...>暂停</button>
) : null}
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/timer.rs src-tauri/src/commands/timer_cmd.rs src/components/hunt/FocusPhase.tsx src/stores/timerStore.ts src/lib/commands.ts
git commit -m "feat: pause requires smoke bomb consumable with 3-min auto-retreat"
```

### Task 20: Crash recovery

The spec requires: pomodoro record written at start, recover on relaunch.

**Files:**
- Modify: `src-tauri/src/commands/timer_cmd.rs`
- Modify: `src-tauri/src/lib.rs`
- Create: `src/components/common/RecoveryDialog.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write pomodoro row at timer start (not at review end)**

In `timer_cmd.rs`, update `start_timer` to accept a DB handle and insert the pomodoro:
```rust
#[tauri::command]
pub async fn start_timer(
    timer: State<'_, SharedTimer>,
    app: AppHandle,
    task_id: i64,
    task_name: String,
    focus_minutes: Option<u64>,
    break_minutes: Option<u64>,
    long_break_minutes: Option<u64>,
    rounds_before_long_break: Option<u32>,
) -> Result<TimerSnapshot, String> {
    // Create pomodoro record in DB via SQL plugin
    let db = app.state::<tauri_plugin_sql::Pool>();
    // Insert pomodoro with started_at, ended_at = NULL
    // Store the pomodoro_id in the timer engine

    let config = TimerConfig::from_weapon_effect(
        focus_minutes.unwrap_or(25),
        break_minutes.unwrap_or(5),
        long_break_minutes.unwrap_or(15),
        rounds_before_long_break.unwrap_or(4),
    );
    let mut engine = timer.lock().map_err(|e| e.to_string())?;
    engine.start(config, task_id, task_name);
    // engine.pomodoro_id = Some(inserted_id);
    Ok(engine.snapshot())
}
```

Note: The exact SQL plugin API from Rust depends on `tauri-plugin-sql` internals. An alternative approach: have the **frontend** create the pomodoro row before calling `start_timer`, and pass the `pomodoro_id` to the command. This is simpler:

Frontend flow:
```typescript
// In startHunt:
const db = await getDb();
const result = await db.execute(
  `INSERT INTO pomodoros (task_id, started_at) VALUES ($1, $2)`,
  [taskId, new Date().toISOString()]
);
const pomodoroId = result.lastInsertId;
const timer = await cmd.startTimer({ taskId, taskName, pomodoroId, ... });
```

Update `start_timer` command to accept and store `pomodoro_id`.

- [ ] **Step 2: Add recovery check on app launch**

In `src/App.tsx`, on mount check for unfinished pomodoros:
```typescript
useEffect(() => {
  (async () => {
    const db = await getDb();
    const unfinished = await db.select<Pomodoro[]>(
      `SELECT * FROM pomodoros WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1`
    );
    if (unfinished.length > 0) {
      setRecoveryPomodoro(unfinished[0]);
    }
  })();
}, []);
```

- [ ] **Step 3: RecoveryDialog component**

`src/components/common/RecoveryDialog.tsx`:
```typescript
import type { Pomodoro } from '../../types';
import { getDb } from '../../lib/db';

interface Props {
  pomodoro: Pomodoro;
  onRecover: () => void;
  onRetreat: () => void;
}

export function RecoveryDialog({ pomodoro, onRecover, onRetreat }: Props) {
  const handleRetreat = async () => {
    const db = await getDb();
    await db.execute(
      `UPDATE pomodoros SET ended_at = $1, result = 'retreated' WHERE id = $2`,
      [new Date().toISOString(), pomodoro.id]
    );
    onRetreat();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-lg p-6 max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-amber-400">🔄 检测到未完成的狩猎</h2>
        <p className="text-sm text-stone-300">
          上次的番茄钟（任务 #{pomodoro.task_id}）未正常结束。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRecover}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white rounded py-2 text-sm"
          >
            恢复狩猎
          </button>
          <button
            onClick={handleRetreat}
            className="flex-1 bg-stone-700 hover:bg-stone-600 text-white rounded py-2 text-sm"
          >
            安全撤退
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update review completion to set ended_at**

In `HuntApp.tsx` `handleReviewComplete`, change from INSERT to UPDATE:
```typescript
await db.execute(
  `UPDATE pomodoros SET ended_at = $1, result = 'completed', completion_note = $2,
   reflection_type = $3, reflection_text = $4, loadout_snapshot = $5
   WHERE id = $6`,
  [new Date().toISOString(), note, reflType, reflText, loadoutJson, timer.pomodoro_id]
);
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/ src/components/common/RecoveryDialog.tsx src/App.tsx src/HuntApp.tsx
git commit -m "feat: add crash recovery for unfinished pomodoros"
```

### Task 21: Window close = pause (not abandon)

**Files:**
- Modify: `src-tauri/src/commands/window_cmd.rs`

- [ ] **Step 1: Intercept hunt window close event**

In `window_cmd.rs`, add close-requested handler when creating the hunt window:

```rust
use tauri::Listener;

// After building the hunt window:
let timer_clone = app.state::<SharedTimer>().inner().clone();
let app_clone = app.clone();
if let Some(hunt_win) = app.get_webview_window("hunt") {
    hunt_win.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            // Trigger pause via event
            let _ = app_clone.emit("hunt_window_close_requested", &());
        }
    });
}
```

- [ ] **Step 2: Frontend handles close event**

In `HuntApp.tsx`, listen for the close event:
```typescript
useTauriEvent('hunt_window_close_requested', async () => {
  // If has smoke bomb, pause; otherwise retreat
  const { ownedEquipment, useConsumable } = useInventoryStore.getState();
  const hasSmokeBomb = ownedEquipment.some(e => e.equipment.id === 6 && e.quantity > 0);
  if (hasSmokeBomb) {
    await useConsumable(6);
    await useTimerStore.getState().pause();
  } else {
    await useTimerStore.getState().retreat();
    await invoke('close_hunt_window');
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/commands/window_cmd.rs src/HuntApp.tsx
git commit -m "feat: window close triggers pause or retreat, not silent abandon"
```

---

## Chunk 9: Important Fixes

### Task 22: Auto-advance phases + weapon config on hunt start

**Files:**
- Modify: `src-tauri/src/commands/timer_cmd.rs` (tick loop)
- Modify: `src/components/village/HuntList.tsx`
- Modify: `src/components/village/DailyPlanBoard.tsx`
- Modify: `src/stores/timerStore.ts`

- [ ] **Step 1: Auto-advance in tick loop**

In the `start_tick_loop` function, after emitting `timer_tick`, add:
```rust
// Auto-advance when phase completes
{
    let engine = timer.lock().unwrap();
    if engine.is_phase_complete() {
        let phase = engine.phase;
        drop(engine);

        // Don't auto-advance from Review (user must submit review form)
        // Don't auto-advance from Break/LongBreak (user clicks "continue")
        if phase == TimerPhase::Prep || phase == TimerPhase::Focus {
            let mut engine = timer.lock().unwrap();
            let new_phase = engine.advance_phase();
            let snapshot = engine.snapshot();
            let _ = app.emit("timer_tick", &snapshot);
            let _ = app.emit("phase_changed", &new_phase);
        }
    }
}
```

- [ ] **Step 2: Pass weapon config when starting hunt**

In `src/stores/timerStore.ts`, update `startHunt` to accept weapon params:
```typescript
startHunt: async (taskId, taskName, weaponEffect?) => {
    const timer = await cmd.startTimer({
      taskId,
      taskName,
      focusMinutes: weaponEffect?.focus_minutes,
      breakMinutes: weaponEffect?.break_minutes,
      longBreakMinutes: weaponEffect?.long_break_minutes,
      roundsBeforeLongBreak: weaponEffect?.rounds_before_long_break,
    });
    set({ timer });
},
```

In `HuntList.tsx` and `DailyPlanBoard.tsx`, read loadout before starting:
```typescript
import { useInventoryStore } from '../../stores/inventoryStore';

const { getActiveWeaponEffect, fetchAll } = useInventoryStore();

const handleStartHunt = async () => {
    await fetchAll();
    const weaponEffect = getActiveWeaponEffect();
    const params = weaponEffect?.type === 'timer' ? weaponEffect : undefined;
    await startHunt(task.id, task.monster_name || task.name, params);
    await invoke('open_hunt_window');
};
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/commands/timer_cmd.rs src/stores/timerStore.ts src/components/village/HuntList.tsx src/components/village/DailyPlanBoard.tsx
git commit -m "feat: auto-advance timer phases + use weapon config for hunt"
```

### Task 23: Notification emissions at phase transitions

**Files:**
- Modify: `src-tauri/src/commands/timer_cmd.rs`
- Create: `src/hooks/useNotifications.ts`

- [ ] **Step 1: Emit notification events from tick loop**

In the auto-advance block of the tick loop, after phase changes:
```rust
use tauri_plugin_notification::NotificationExt;

// After advancing from Focus -> Review:
if phase == TimerPhase::Focus {
    let _ = app.notification()
        .builder()
        .title("专注阶段结束")
        .body("进入回顾阶段，记录你的成果")
        .show();
}
```

Add similar notifications for:
- Pomodoro complete (after review -> break): "狩猎完成！进入休息"
- Break ended: "休息结束，准备下一场狩猎"
- Pause timeout warning (at 2:30 of 3:00): "暂停即将超时，30秒后自动撤退"

- [ ] **Step 2: Frontend notification hook for phase_changed events**

`src/hooks/useNotifications.ts`:
```typescript
import { useTauriEvent } from './useTauriEvent';
import { useCallback } from 'react';

export function usePhaseNotifications() {
  const handlePhaseChange = useCallback((phase: string) => {
    // Play sound if enabled (via HTML Audio)
    if (phase === 'break' || phase === 'long_break') {
      const audio = new Audio('/sounds/complete.mp3');
      audio.play().catch(() => {});
    }
  }, []);

  useTauriEvent('phase_changed', handlePhaseChange);
}
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/commands/timer_cmd.rs src/hooks/useNotifications.ts
git commit -m "feat: add system notifications at phase transitions"
```

### Task 24: Monster generation (Rust offline + Claude API)

**Files:**
- Create: `src-tauri/src/monster_gen.rs`
- Create: `src-tauri/src/commands/monster_cmd.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/components/village/Inbox.tsx`

- [ ] **Step 1: Offline monster name generator (Rust)**

`src-tauri/src/monster_gen.rs`:
```rust
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MonsterInfo {
    pub name: String,
    pub description: String,
    pub variant: String,
}

const ADJECTIVES: &[&str] = &[
    "凶猛的", "狡猾的", "迅捷的", "顽固的", "沉默的",
    "燃烧的", "冰冻的", "暗影", "雷鸣", "钢铁",
    "古老的", "幽灵", "狂暴的", "优雅的", "巨型",
];

const NOUNS: &[(&str, &[&str])] = &[
    ("work", &["齿轮兽", "铁甲蜂", "文件蛾", "会议蟒", "流程蝎"]),
    ("study", &["书卷龙", "墨水蛙", "知识鹰", "论文狼", "公式蛇"]),
    ("creative", &["墨灵", "灵感蝶", "色彩狐", "旋律鸟", "故事熊"]),
    ("life", &["绿藤怪", "尘埃兔", "时光龟", "杂务鼠", "日常猫"]),
    ("other", &["影魔", "混沌虫", "迷雾鸦", "未知兽", "虚空鱼"]),
];

pub fn generate_offline(category: &str, task_name: &str) -> MonsterInfo {
    let mut rng = rand::thread_rng();
    let adj = ADJECTIVES[rng.gen_range(0..ADJECTIVES.len())];

    let nouns = NOUNS.iter()
        .find(|(cat, _)| *cat == category)
        .map(|(_, n)| *n)
        .unwrap_or(NOUNS[4].1);
    let noun = nouns[rng.gen_range(0..nouns.len())];

    // Rare variant: 10% chance
    let variant = if rng.gen_range(0..10) == 0 { "rare".to_string() } else { "normal".to_string() };
    let prefix = if variant == "rare" { "金色" } else { "" };

    MonsterInfo {
        name: format!("{}{}{}", prefix, adj, noun),
        description: format!("由「{}」孕育而生的怪物", task_name),
        variant,
    }
}
```

Add `rand` to `Cargo.toml`:
```toml
rand = "0.8"
```

- [ ] **Step 2: Monster generation command with optional AI**

`src-tauri/src/commands/monster_cmd.rs`:
```rust
use crate::monster_gen;
use serde::Deserialize;
use tauri::State;

#[derive(Deserialize)]
pub struct GenerateMonsterParams {
    pub category: String,
    pub task_name: String,
    pub task_description: String,
    pub api_key: Option<String>,
}

#[tauri::command]
pub async fn generate_monster(params: GenerateMonsterParams) -> Result<monster_gen::MonsterInfo, String> {
    // Try AI generation if API key provided
    if let Some(key) = &params.api_key {
        if !key.is_empty() {
            match generate_with_ai(key, &params).await {
                Ok(info) => return Ok(info),
                Err(_) => {} // Fall through to offline
            }
        }
    }

    // Offline fallback
    Ok(monster_gen::generate_offline(&params.category, &params.task_name))
}

async fn generate_with_ai(api_key: &str, params: &GenerateMonsterParams) -> Result<monster_gen::MonsterInfo, String> {
    let client = reqwest::Client::new();
    let prompt = format!(
        "为以下任务生成一个怪物猎人风格的怪物。任务名称：{}，分类：{}，描述：{}。\n\n请用JSON格式回复：{{\"name\": \"怪物名\", \"description\": \"一句话描述\"}}",
        params.task_name, params.category, params.task_description
    );

    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&serde_json::json!({
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 200,
            "messages": [{"role": "user", "content": prompt}]
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let text = body["content"][0]["text"].as_str().unwrap_or("{}");

    // Try parse JSON from response
    if let Ok(info) = serde_json::from_str::<serde_json::Value>(text) {
        Ok(monster_gen::MonsterInfo {
            name: info["name"].as_str().unwrap_or("神秘怪物").to_string(),
            description: info["description"].as_str().unwrap_or("未知起源的怪物").to_string(),
            variant: "normal".to_string(),
        })
    } else {
        Err("Failed to parse AI response".to_string())
    }
}
```

Add `reqwest` to `Cargo.toml`:
```toml
reqwest = { version = "0.12", features = ["json"] }
```

Register in `commands/mod.rs` and `lib.rs`.

- [ ] **Step 3: Update Inbox.tsx to use the Tauri command**

Replace inline name generation with:
```typescript
import { invoke } from '@tauri-apps/api/core';

const handleIdentify = async () => {
    const settings = await db.select<{value: string}[]>("SELECT value FROM settings WHERE key = 'ai_api_key'");
    const apiKey = settings[0]?.value || '';

    const monster = await invoke<{ name: string; description: string; variant: string }>('generate_monster', {
      params: { category: task.category, taskName: task.name, taskDescription: task.description, apiKey }
    });
    await identifyTask(task.id, monster.name, monster.description);
};
```

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/monster_gen.rs src-tauri/src/commands/monster_cmd.rs src-tauri/Cargo.toml src/components/village/Inbox.tsx
git commit -m "feat: add monster generation with Claude API + offline fallback"
```

### Task 25: Loadout snapshot + rest screen preview + Tauri capabilities

**Files:**
- Modify: `src/HuntApp.tsx`
- Modify: `src/components/settlement/RestScreen.tsx`
- Create: `src-tauri/capabilities/default.json`

- [ ] **Step 1: Populate loadout snapshot on review completion**

In `HuntApp.tsx` `handleReviewComplete`, read current loadout:
```typescript
const loadoutRows = await db.select<{ weapon_id: number|null, armor_id: number|null, items: string }[]>(
  'SELECT * FROM loadout WHERE id = 1'
);
const loadoutJson = JSON.stringify(loadoutRows[0] || {});
// Use loadoutJson in the UPDATE query
```

- [ ] **Step 2: Add next task preview to RestScreen**

In `RestScreen.tsx`, add:
```typescript
import { usePlanStore } from '../../stores/planStore';

// Inside component:
const { plan } = usePlanStore();
const nextEntry = plan?.entries.find(e => e.completed_pomodoros_today < e.planned_pomodoros_today);
```

Show in JSX:
```tsx
{nextEntry && (
  <div className="bg-stone-800 rounded p-3 text-sm">
    <p className="text-stone-400">下一个番茄：</p>
    <p className="font-bold">{nextEntry.monster_name || nextEntry.name}</p>
  </div>
)}
```

- [ ] **Step 3: Create Tauri capabilities file**

`src-tauri/capabilities/default.json`:
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for Potato Hunter",
  "windows": ["main", "hunt"],
  "permissions": [
    "core:default",
    "core:window:default",
    "core:window:allow-create",
    "core:window:allow-close",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-set-focus",
    "sql:default",
    "sql:allow-load",
    "sql:allow-select",
    "sql:allow-execute",
    "notification:default",
    "notification:allow-notify",
    "notification:allow-request-permission"
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add src/HuntApp.tsx src/components/settlement/RestScreen.tsx src-tauri/capabilities/default.json
git commit -m "feat: add loadout snapshot, rest preview, and Tauri capabilities"
```

---

## Post-Plan: Integration Testing

After all chunks are implemented:

- [ ] Full loop test: Create task → Identify → Plan → Hunt → Complete → Loot → Rest → Journal
- [ ] Equipment flow: Craft weapon → Equip → Start hunt → Verify timer uses weapon config
- [ ] Pause flow: Use smoke bomb → Pause → Resume within 3 min → Complete
- [ ] Retreat flow: Abandon hunt → Verify no loot, no HP damage
- [ ] Daily plan budget: Add tasks exceeding budget → Verify warning
- [ ] Window management: Hunt overlay opens/closes, main window hides/shows
- [ ] System tray: Right-click → Show village, Quit
