## 1. Project Scaffolding

- [x] 1.1 Initialize Tauri v2 + React + TypeScript project with `npm create tauri-app`
- [x] 1.2 Install and configure Tailwind CSS v4 (via Vite plugin) + Zustand
- [x] 1.3 Add tauri-plugin-sql (SQLite) + tauri-plugin-notification to Cargo.toml and lib.rs
- [x] 1.4 Create initial SQLite migration (001_initial.sql) with all tables: tasks, pomodoros, materials, player_materials, loot_drops, equipment, player_equipment, loadout, daily_plans, planned_task_entries, settings
- [x] 1.5 Add seed data: base materials (10), starter equipment (8), default loadout, default settings
- [x] 1.6 Create Tauri capabilities file (default.json) with permissions for SQL, notifications, and multi-window
- [x] 1.7 Write all TypeScript type definitions (types/index.ts): Task, Pomodoro, TimerState, Equipment, Material, Loadout, DailyPlan, etc.

## 2. Timer Engine (Rust)

- [x] 2.1 Implement TimerConfig with phase duration calculations: prep=2min fixed, review=3min fixed, focus=total-5 dynamic
- [x] 2.2 Implement TimerEngine state machine: start, pause (with pause_started_at tracking), resume, retreat, advance_phase, snapshot
- [x] 2.3 Write Rust unit tests for phase durations, transitions, long break after N rounds, pause timeout detection
- [x] 2.4 Create timer Tauri commands: start_timer, pause_timer (with has_consumable param), resume_timer, retreat_timer, advance_timer_phase, get_timer_state
- [x] 2.5 Implement tick loop: 1-second background thread emitting timer_tick events, auto-advancing prep→focus and focus→review, detecting pause timeout for auto-retreat
- [x] 2.6 Add system notifications in tick loop at phase transitions (focus→review, pomodoro complete, break ended, pause timeout warning at 2:30)

## 3. Multi-Window Setup

- [x] 3.1 Create hunt.html entry point + hunt.tsx + HuntApp.tsx for the floating window
- [x] 3.2 Configure Vite multi-page build (index.html + hunt.html)
- [x] 3.3 Create open_hunt_window Tauri command: always-on-top, 360x120, no decorations, skip taskbar
- [x] 3.4 Create close_hunt_window Tauri command
- [x] 3.5 Add window close event interception: close_requested → emit event to frontend → pause (if smoke bomb) or retreat
- [x] 3.6 Setup system tray with "显示村庄" and "退出" menu items

## 4. Frontend Core Stores

- [x] 4.1 Create db.ts helper for SQLite connection via @tauri-apps/plugin-sql
- [x] 4.2 Create timerStore (Zustand): timer state from Rust tick events, startHunt (with weapon params), pause, resume, retreat, advancePhase
- [x] 4.3 Create useTauriEvent hook for listening to Rust events
- [x] 4.4 Create lib/commands.ts with typed invoke() wrappers for all Tauri commands
- [x] 4.5 Create taskStore: fetchTasks, createTask, updateTaskStatus, identifyTask, deleteTask, damageTask
- [x] 4.6 Create planStore: fetchTodayPlan, setBudget, addTaskToPlan, removeTaskFromPlan, incrementCompleted
- [x] 4.7 Create inventoryStore: fetchAll, craftEquipment, equipWeapon, equipArmor, useConsumable, getActiveWeaponEffect
- [x] 4.8 Create settingsStore: fetchSettings, toggleSound

## 5. Village UI

- [x] 5.1 Create VillageLayout with tab navigation: 情报(inbox), 猎物(hunts), 今日(plan), 工坊(workshop), 图鉴(journal)
- [x] 5.2 Create Inbox component: list unidentified tasks + "新任务" button
- [x] 5.3 Create TaskForm component: name, description, category selector, difficulty selector, estimated pomodoros, >5 split warning
- [x] 5.4 Create HuntList component: ready/hunting tasks with monster name, HP bar, attack button
- [x] 5.5 Create DailyPlanBoard: budget display/edit, planned tasks with progress, add-to-plan picker, over-budget warning
- [x] 5.6 Create Workshop component: material inventory display, weapons/armor/consumables sections, craft buttons, equip buttons, equipped indicator
- [x] 5.7 Wire App.tsx to render VillageLayout as main view

## 6. Hunt Overlay UI

- [x] 6.1 Create ProgressBar common component (time/HP dual-purpose bar)
- [x] 6.2 Create PrepPhase component: task name, countdown bar, abandon button
- [x] 6.3 Create FocusPhase component: task intent, time/HP bar, pause button (conditionally shown if smoke bomb owned), abandon button
- [x] 6.4 Create ReviewPhase component: completion note (required), reflection type selector (smooth/difficult/discovery), reflection text, submit button
- [x] 6.5 Wire HuntApp to switch between phases based on timer state, handle tick events

## 7. Settlement & Rest

- [x] 7.1 Create loot.ts: generateLoot function with category-based drops, rarity calculation, consecutive bonus, bonus_loot multiplier
- [x] 7.2 Create applyLoot function: insert loot_drops + update player_materials
- [x] 7.3 Create Settlement component: display dropped materials with icons and quantities
- [x] 7.4 Create RestScreen component: break timer, random health tip (memo'd), next task preview from daily plan
- [x] 7.5 Wire full hunt flow in HuntApp: prep → focus → review → (write pomodoro, damage task, generate loot) → settlement → rest → idle

## 8. Monster Generation

- [x] 8.1 Implement Rust offline monster name generator (monster_gen.rs): category-specific adjective + noun pools, 10% rare variant chance
- [x] 8.2 Implement generate_monster Tauri command: try Claude API (Haiku) if API key configured, fallback to offline generator
- [x] 8.3 Add reqwest + rand dependencies to Cargo.toml
- [x] 8.4 Update Inbox identify flow to call generate_monster command instead of inline JS generation

## 9. Crash Recovery & Edge Cases

- [x] 9.1 Write pomodoro row to DB at timer start (ended_at = NULL), not at review end
- [x] 9.2 Update review completion to UPDATE existing pomodoro row instead of INSERT
- [x] 9.3 Create RecoveryDialog component: detect unfinished pomodoros on app launch, offer recover or retreat
- [x] 9.4 Wire RecoveryDialog into App.tsx mount lifecycle
- [x] 9.5 Populate loadout_snapshot field on pomodoro completion with current loadout JSON

## 10. Integration Testing

- [x] 10.1 Full loop test: Create task → Identify → Plan → Hunt → Complete → Loot → Rest → Journal (手动测试)
- [x] 10.2 Equipment flow: Craft weapon → Equip → Start hunt → Verify timer uses weapon config (手动测试)
- [x] 10.3 Pause flow: Use smoke bomb → Pause → Resume within 3 min → Complete (手动测试)
- [x] 10.4 Retreat flow: Abandon hunt → Verify no loot, no HP damage (手动测试)
- [x] 10.5 Daily plan budget: Add tasks exceeding budget → Verify warning (手动测试)
- [x] 10.6 Window management: Hunt overlay opens/closes correctly, main window hides/shows (手动测试)
- [x] 10.7 Crash recovery: Kill app during focus → Relaunch → Verify recovery dialog appears (手动测试)
