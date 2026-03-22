## ADDED Requirements

### Requirement: Milestone definition registry
The system SHALL define milestones as a TypeScript constant array. Each milestone has: id (string), name (display name), description (what it represents), icon (emoji), and a check function that determines whether the milestone is achieved given current stats.

#### Scenario: Milestone definition structure
- **WHEN** the milestone registry is loaded
- **THEN** each milestone contains id, name, description, icon, and an async check function `(db) => Promise<{ achieved: boolean; progress?: { current: number; target: number } }>`

#### Scenario: Adding a new milestone
- **WHEN** a developer adds a new milestone to the registry
- **THEN** the system automatically detects it for all users on next settlement, including retroactive detection for existing data

### Requirement: Initial milestone set
The system SHALL include the following milestones at launch:

| ID | Name | Condition |
|---|---|---|
| first-kill | 初猎达成 | 击杀 1 只怪物 |
| pomodoro-10 | 番茄收集者 | 完成 10 个番茄钟 |
| first-craft | 入门铁匠 | 锻造第 1 件装备 |
| species-5 | 生态观察者 | 发现 5 种怪物 |
| kill-10 | 熟练猎手 | 击杀 10 只怪物 |
| perfect-day | 完美狩猎日 | 单日完成全部每日计划 |
| streak-7 | 不懈追踪者 | 连续 7 天有击杀 |
| pomodoro-50 | 半百番茄 | 完成 50 个番茄钟 |
| species-10 | 野外博物学家 | 发现 10 种怪物 |
| all-equipment | 大师铁匠 | 锻造全部可锻造装备 |
| species-15 | 生态学家 | 发现全部 15 种怪物 |
| pomodoro-100 | 百战猎人 | 完成 100 个番茄钟 |
| kill-50 | 传奇猎手 | 击杀 50 只怪物 |

#### Scenario: Milestone conditions verified
- **WHEN** the "kill-10" milestone check runs with 10 killed tasks in the database
- **THEN** the check returns `{ achieved: true }`

#### Scenario: Milestone progress for partial completion
- **WHEN** the "pomodoro-50" milestone check runs with 32 completed pomodoros
- **THEN** the check returns `{ achieved: false, progress: { current: 32, target: 50 } }`

### Requirement: Milestone persistence
The system SHALL store achieved milestones in a `milestones` database table with columns: id (TEXT PRIMARY KEY, matching milestone definition id), achieved_at (TEXT, ISO timestamp), notified (INTEGER, 0 or 1).

#### Scenario: Milestone recorded on achievement
- **WHEN** a milestone is detected as achieved for the first time
- **THEN** a row is inserted into the milestones table with the current timestamp and notified=0

#### Scenario: Duplicate achievement ignored
- **WHEN** a milestone check returns achieved but the milestone already exists in the table
- **THEN** no duplicate row is inserted

### Requirement: Milestone detection at settlement
The system SHALL run milestone detection after each pomodoro completion, during the settlement phase. Detection iterates all milestone definitions, checks each against the database, and records any newly achieved milestones.

#### Scenario: Detection after pomodoro completion
- **WHEN** a pomodoro completes and loot is distributed
- **THEN** the milestone detection runs and checks all unachieved milestones

#### Scenario: Multiple milestones achieved simultaneously
- **WHEN** a single pomodoro completion triggers both "pomodoro-10" and "first-kill"
- **THEN** both milestones are recorded and both notifications are queued

### Requirement: Milestone notification popup
The system SHALL display a pixel-styled notification card for each newly achieved milestone during the settlement phase. The card shows the milestone icon, name, and description. Multiple milestones display sequentially (one at a time with a confirm button).

#### Scenario: Single milestone notification
- **WHEN** one new milestone is achieved after a pomodoro
- **THEN** a notification card appears after loot display (and after species discovery if applicable) showing the milestone icon, name, and description

#### Scenario: Notification marks as shown
- **WHEN** the user dismisses the milestone notification
- **THEN** the milestone's notified field is set to 1 in the database

#### Scenario: Notification not re-shown
- **WHEN** a milestone has notified=1
- **THEN** the notification is never shown again (milestone appears directly in achieved list on profile tab)

### Requirement: Retroactive milestone calculation on migration
The system SHALL retroactively detect all achievable milestones from existing data when the milestones table is first created. Retroactively achieved milestones are inserted with notified=1 to avoid flooding the user with past achievement popups.

#### Scenario: Existing user with 30 pomodoros upgrades
- **WHEN** the migration runs and the user has 30 completed pomodoros and 5 kills
- **THEN** milestones "first-kill", "pomodoro-10", "kill-10" (if applicable), and any other matching milestones are inserted with notified=1

#### Scenario: New user has no retroactive milestones
- **WHEN** the migration runs and the user has no pomodoro history
- **THEN** no milestone rows are inserted
