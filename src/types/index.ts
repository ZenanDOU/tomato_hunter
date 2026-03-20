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
  | "abandoned";

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
  | "long_break";

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
}

// === Equipment ===

export type EquipmentType = "weapon" | "armor" | "item";

export interface WeaponEffect {
  type: "timer";
  focus_minutes: number;
  break_minutes: number;
  long_break_minutes: number;
  rounds_before_long_break: number;
}

export interface ArmorEffect {
  type: "tolerance";
  max_pause_duration_seconds: number;
  allow_brief_interrupt: boolean;
  brief_interrupt_seconds: number;
}

export interface ConsumableEffect {
  type: "consumable";
  action: "pause" | "extend_focus" | "skip_prep" | "bonus_loot";
  value: number;
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
  entries: PlannedTaskEntry[];
}

export interface PlannedTaskEntry {
  id: number;
  task_id: number;
  planned_pomodoros_today: number;
  completed_pomodoros_today: number;
  sort_order: number;
  // joined fields from task
  name?: string;
  monster_name?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  current_hp?: number;
  total_hp?: number;
}
