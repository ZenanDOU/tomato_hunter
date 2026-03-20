## ADDED Requirements

### Requirement: AI monster generation with procrastination monster narrative
The system SHALL generate procrastination-themed monster names and battle descriptions for each task. Monsters are independent enemies that occupy the tomato farm. Names SHALL include task-relevant keywords and match a species from the built-in bestiary.

#### Scenario: Online monster generation
- **WHEN** user identifies a task (侦查敌情) and a Claude API key is configured
- **THEN** the system calls Claude API with a prompt that includes the task name, category, and available species list, generating a task-relevant monster name and description

#### Scenario: Offline fallback generation with task relevance
- **WHEN** the API key is not configured or the API call fails
- **THEN** the system generates using: task keyword extraction + procrastination adjective + species suffix from bestiary (e.g., "拖延的·报告蟒" for task "写季度报告")

#### Scenario: Species selection from bestiary
- **WHEN** generating a monster (online or offline)
- **THEN** the system selects a species from the bestiary matching the task's category, and uses that species' emoji as the monster's visual

#### Scenario: Rare variant generation
- **WHEN** generating a monster offline
- **THEN** there is a 10% chance the monster is a rare "金色" variant with better drops

### Requirement: Difficulty-based monster classification
The system SHALL classify monsters into 5 tiers based on estimated pomodoro count: simple (1-2), medium (3-5), hard (6-10), epic (11-20), legendary (>20).

#### Scenario: Simple task creates small monster
- **WHEN** user sets estimated pomodoros to 1 or 2
- **THEN** the monster is classified as a small monster (simple difficulty)

#### Scenario: Epic task suggests splitting
- **WHEN** user sets estimated pomodoros to 11-20
- **THEN** the system strongly recommends AI-assisted splitting into sub-tasks

### Requirement: Multi-pomodoro HP tracking (bug fix)
The system SHALL correctly track HP across multiple pomodoro sessions with proper status transitions.

#### Scenario: First damage transitions to hunting
- **WHEN** a user completes the first pomodoro for a "ready" monster and HP > 0
- **THEN** the task status changes from "ready" to "hunting"

#### Scenario: HP persists across app restart
- **WHEN** a user completes 1 pomodoro for a 3-HP monster, closes the app, and reopens
- **THEN** the HP correctly shows 2/3

#### Scenario: Final hit defeats the monster
- **WHEN** a completed pomodoro reduces HP to 0
- **THEN** the task status changes to "killed", completed_at is set

### Requirement: Task splitting as part destruction
The system SHALL support splitting large tasks into sub-tasks, presented as "breakable parts" of the monster. Each sub-task becomes an independent monster linked to the parent.

#### Scenario: AI-assisted split
- **WHEN** user chooses "AI帮我拆分" for a task with >5 estimated pomodoros
- **THEN** the system generates sub-task suggestions (if AI available) or prompts manual entry

#### Scenario: Manual split
- **WHEN** user chooses "我自己拆分"
- **THEN** the system provides a form to create sub-tasks, each linked to the parent task via parent_task_id

### Requirement: Settlement rewards — fixed rescued tomato + random drops
The system SHALL award exactly 1 rescued tomato (获救番茄 🍅, material_id=11) as a guaranteed fixed reward for each completed pomodoro, plus random material drops from the existing loot system.

#### Scenario: Every completed pomodoro rescues one tomato
- **WHEN** a pomodoro completes successfully
- **THEN** the loot includes 1x 获救番茄 plus category-specific random drops

#### Scenario: Full defeat settlement
- **WHEN** the final pomodoro reduces HP to 0
- **THEN** the settlement screen shows: "⚔️ 怪物被击败了！" + "🍅 拯救了一颗番茄！" + war trophies list

#### Scenario: Partial defeat settlement
- **WHEN** a pomodoro completes but HP is still > 0
- **THEN** the settlement screen shows: "怪物受到重创，但还没倒下！" + "继续战斗！" + war trophies list

### Requirement: Retreat message
- **WHEN** user retreats from a hunt
- **THEN** the button text shows "撤退" (not "放弃")
