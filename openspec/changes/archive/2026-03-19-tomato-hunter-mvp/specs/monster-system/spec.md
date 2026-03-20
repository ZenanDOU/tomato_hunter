## ADDED Requirements

### Requirement: AI monster generation with offline fallback
The system SHALL generate a unique monster name, description, and variant for each task using Claude API when available, falling back to a deterministic offline generator.

#### Scenario: Online monster generation
- **WHEN** user identifies a task and a Claude API key is configured
- **THEN** the system calls Claude API to generate a monster name and description related to the task content, then updates the task

#### Scenario: Offline fallback generation
- **WHEN** the API key is not configured or the API call fails
- **THEN** the system generates a monster name using a deterministic generator: category-specific adjective + noun pools (e.g., "凶猛的齿轮兽" for a work task)

#### Scenario: Rare variant generation
- **WHEN** generating a monster offline
- **THEN** there is a 10% chance the monster is a rare variant (prefixed with "金色"), which yields better loot drops

### Requirement: Difficulty-based monster classification
The system SHALL classify monsters into 5 tiers based on estimated pomodoro count: simple (1-2), medium (3-5), hard (6-10), epic (11-20), legendary (>20).

#### Scenario: Simple task creates small monster
- **WHEN** user sets estimated pomodoros to 1 or 2
- **THEN** the monster is classified as a small monster (simple difficulty)

#### Scenario: Epic task suggests splitting
- **WHEN** user sets estimated pomodoros to 11-20
- **THEN** the system strongly recommends AI-assisted splitting into sub-tasks

### Requirement: Multi-pomodoro HP tracking
The system SHALL track monster HP across multiple pomodoro sessions. Each completed pomodoro reduces HP by 1. The monster is killed when HP reaches 0.

#### Scenario: Partial damage across sessions
- **WHEN** a user completes 2 out of 4 pomodoros for a medium monster
- **THEN** the monster's current_hp shows 2/4 and status remains "hunting"

#### Scenario: Final blow kills monster
- **WHEN** a completed pomodoro reduces current_hp to 0
- **THEN** the task status changes to "killed", completed_at is set, and the monster enters the journal

### Requirement: Task splitting as part destruction
The system SHALL support splitting large tasks into sub-tasks, presented as "breakable parts" of the monster. Each sub-task becomes an independent monster linked to the parent.

#### Scenario: AI-assisted split
- **WHEN** user chooses "AI帮我拆分" for a task with >5 estimated pomodoros
- **THEN** the system generates sub-task suggestions (if AI available) or prompts manual entry

#### Scenario: Manual split
- **WHEN** user chooses "我自己拆分"
- **THEN** the system provides a form to create sub-tasks, each linked to the parent task via parent_task_id
