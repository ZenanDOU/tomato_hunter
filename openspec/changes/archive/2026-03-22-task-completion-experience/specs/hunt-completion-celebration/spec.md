## ADDED Requirements

### Requirement: Kill confirmation at HP zero
The system SHALL NOT automatically set a task to "killed" when HP reaches 0. Instead, the Settlement screen SHALL present a confirmation UI asking the user whether the monster is truly defeated.

#### Scenario: HP reaches zero during settlement
- **WHEN** a pomodoro completes and damageTask() reduces the monster's current_hp to 0
- **THEN** the Settlement screen SHALL display the loot drops as usual, PLUS a confirmation section with two options: "确认击杀 ⚔️" and "发起追击 🔍"

#### Scenario: User confirms kill at HP zero
- **WHEN** user clicks "确认击杀" on the HP-zero confirmation
- **THEN** the system SHALL set the task status to "killed" with completed_at timestamp, and transition to the celebration view

#### Scenario: Normal settlement when HP > 0
- **WHEN** a pomodoro completes and the monster still has HP remaining (current_hp > 0)
- **THEN** the Settlement screen SHALL display the standard loot view with "怪物受伤" message, unchanged from current behavior

### Requirement: Pursuit mechanic (追击)
The system SHALL allow users to initiate a pursuit when HP reaches 0 but the task is not actually complete. Pursuit consumes a consumable item and allows re-setting the monster's HP.

#### Scenario: User initiates pursuit
- **WHEN** user clicks "发起追击" on the HP-zero confirmation and owns a pursuit scroll (追踪术卷轴)
- **THEN** the system SHALL consume one pursuit scroll and display an HP re-setting interface

#### Scenario: Pursuit without scroll
- **WHEN** user clicks "发起追击" but owns no pursuit scroll
- **THEN** the button SHALL be disabled with tooltip "需要追踪术卷轴"

#### Scenario: HP re-setting constraints
- **WHEN** user sets a new total_hp during pursuit
- **THEN** the new total_hp MUST be greater than actual_pomodoros (damage already dealt), and current_hp SHALL be set to new_total_hp - actual_pomodoros

#### Scenario: After pursuit HP reset
- **WHEN** the new HP is confirmed during pursuit
- **THEN** the task remains in "hunting" status with updated HP values, and the user proceeds to the rest phase or returns to village

### Requirement: Manual kill from DailyPlanBoard
The system SHALL allow users to manually kill any task in the daily plan that has status "hunting" or "ready", regardless of current HP.

#### Scenario: Manual kill button available
- **WHEN** user views a task with status "hunting" or "ready" in the DailyPlanBoard
- **THEN** a "击杀 🗡️" action button SHALL be available on that task entry

#### Scenario: Manual kill confirmation
- **WHEN** user clicks the "击杀" button on a plan entry
- **THEN** a confirmation dialog SHALL appear: "确认击杀 [monster_name]？这个任务完成了吗？"

#### Scenario: Manual kill confirmed
- **WHEN** user confirms the manual kill dialog
- **THEN** the system SHALL set the task status to "killed" with completed_at timestamp, and display a compact celebration animation inline

#### Scenario: Manual kill of task with remaining HP
- **WHEN** user manually kills a task that still has current_hp > 0
- **THEN** the system SHALL record the actual_pomodoros at time of kill (may be less than total_hp), update status to "killed", and the task moves to 已讨伐 section

### Requirement: Monster kill celebration view
The system SHALL display an enhanced celebration view when a monster is killed (via either confirmation or manual kill). The celebration view SHALL include kill statistics and visual effects.

#### Scenario: Celebration view content
- **WHEN** the celebration view is displayed (after kill confirmation in Settlement)
- **THEN** it SHALL show: "🎉 怪物被击败！" header, monster name, task name, a kill statistics card, and the standard loot drops below

#### Scenario: Kill statistics card
- **WHEN** the kill statistics card is displayed
- **THEN** it SHALL show: total pomodoros used (actual_pomodoros), estimated pomodoros (total_hp), and an efficiency label

#### Scenario: Efficiency label - on target
- **WHEN** actual_pomodoros equals total_hp
- **THEN** the efficiency label SHALL display "完美估时 ⚔️" in default text color

#### Scenario: Efficiency label - faster than estimated
- **WHEN** actual_pomodoros is less than total_hp
- **THEN** the efficiency label SHALL display "提前完成！省了 N 个番茄 🎯" in green color, where N = total_hp - actual_pomodoros

#### Scenario: Efficiency label - slower than estimated
- **WHEN** actual_pomodoros is greater than total_hp (possible after pursuit)
- **THEN** the efficiency label SHALL display "多花了 N 个番茄 💪" in neutral warm tone, where N = actual_pomodoros - total_hp

#### Scenario: Parent monster auto-kill celebration
- **WHEN** all child tasks of a split monster are killed, triggering automatic parent kill
- **THEN** the celebration view SHALL display the parent monster's name and aggregate statistics across all child tasks

### Requirement: Celebration visual effects
The system SHALL apply pixel-art-style visual effects to the celebration view.

#### Scenario: Celebration animation
- **WHEN** the celebration view renders
- **THEN** the monster sprite SHALL play a defeat animation (flash and fade), and sparkle particles SHALL appear around the statistics card

#### Scenario: Celebration audio
- **WHEN** the celebration view renders
- **THEN** the system SHALL play the existing "monster-down" sound effect
