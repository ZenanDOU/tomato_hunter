// === Task / Monster ===

export type TaskCategory = "work" | "study" | "creative" | "life" | "other";
export type TaskDifficulty =
  | "simple"
  | "medium"
  | "hard"
  | "epic"
  | "legendary";
export type TaskStatus =
  | "unidentified"
  | "ready"
  | "hunting"
  | "killed"
  | "abandoned"
  | "released";

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
  species_id: string | null;
  status: TaskStatus;
  total_hp: number;
  current_hp: number;
  parent_task_id: number | null;
  repeat_config: string;
  created_at: string;
  completed_at: string | null;
  body_part: string | null;
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

export type PomodoroResult = "completed" | "retreated";
export type ReflectionType = "smooth" | "difficult" | "discovery";

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
  strategy_note: string;
}

// === Timer ===

export type TimerPhase =
  | "idle"
  | "prep"
  | "focus"
  | "review"
  | "break"
  | "long_break"
  | "awaiting_choice"
  | "dagger_rest";

export type TimerMode = "sword" | "dagger" | "hammer";

export interface TimerState {
  phase: TimerPhase;
  remaining_seconds: number;
  total_seconds: number;
  pomodoro_remaining_seconds: number;
  pomodoro_total_seconds: number;
  task_id: number | null;
  task_name: string;
  pomodoro_id: number | null;
  rounds_completed: number;
  is_paused: boolean;
  timer_mode: TimerMode;
  dagger_action_count: number;
  hammer_focus_elapsed: number;
}

// === Equipment ===

export type EquipmentType = "weapon" | "armor" | "item";

export type AudioMode = "silent" | "white-noise" | "interval-alert";

export interface WeaponEffect {
  type: "timer_mode";
  mode: TimerMode;
}

export interface ArmorEffect {
  type: "audio_mode";
  mode: AudioMode;
}

export interface ConsumableEffect {
  type: "consumable";
  action: "pause" | "extend_focus" | "extend_break" | "shorten_focus" | "skip_prep" | "skip_review" | "double_loot" | "fertilizer";
  value?: number;
}

export type EquipmentEffect = WeaponEffect | ArmorEffect | ConsumableEffect;

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  description: string;
  effect: EquipmentEffect;
  recipe: Record<number, number>;
  unlocked: boolean;
  is_consumable: boolean;
  price: number | null;
}

export interface Loadout {
  weapon_id: number | null;
  armor_id: number | null;
  items: number[];
}

// === Materials ===

export type MaterialRarity = "common" | "rare" | "legendary";

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
  removed_completed: number;
  entries: PlannedTaskEntry[];
}

export interface PlannedTaskEntry {
  id: number;
  task_id: number;
  planned_pomodoros_today: number;
  completed_pomodoros_today: number;
  sort_order: number;
}

// === Sprite ===

export type SpriteFrame = number[][]; // 32x32 grid, each cell is palette index (0 = transparent)

export interface SpriteData {
  palette: string[];
  frames: {
    idle: SpriteFrame[];    // 2 frames
    hit: SpriteFrame[];     // 1 frame
    defeat: SpriteFrame[];  // 2 frames
  };
}

export interface LegacySpriteData {
  width: number;
  height: number;
  pixels: string;
  palette: string[];
}

export type SpriteAnimation = "idle" | "hit" | "defeat";

// === Hunter Profile ===

export interface HunterStats {
  totalPomodoros: number;
  totalKills: number;
  speciesDiscovered: number;
  activeDays: number;
  longestStreak: number;
}

export interface MilestoneRecord {
  id: string;
  achieved_at: string;
  notified: number;
}

export interface SpeciesDiscovery {
  speciesId: string;
  firstKillDate: string;
  killCount: number;
}
