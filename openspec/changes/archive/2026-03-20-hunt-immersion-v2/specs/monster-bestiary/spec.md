## ADDED Requirements

### Requirement: Built-in monster species library
The system SHALL maintain a built-in library of monster species (`src/lib/bestiary.ts`) with 5 species per task category, each with: id, name suffix, category, difficulty range, emoji icon, and description templates.

#### Scenario: Species available for each category
- **WHEN** a task of any category is identified
- **THEN** the system has at least 5 monster species available for that category (e.g., work: 齿轮兽, 报表蛙, 会议蟒, 邮件鸦, 加班狼)

### Requirement: Task-relevant monster naming
The system SHALL generate monster names that include task-related keywords. The name format is "[拖延形容词]·[任务关键词][种族后缀]" (e.g., 任务"写季度报告" → "拖延的·报告蟒").

#### Scenario: Offline name includes task keyword
- **WHEN** a task named "背单词" is identified offline
- **THEN** the monster name includes "单词" and a species suffix from the study category (e.g., "走神的·单词龙")

#### Scenario: Fallback when keyword extraction fails
- **WHEN** a task name is too short or generic to extract keywords
- **THEN** the system falls back to using the full task name with a species suffix

### Requirement: Monster discovery card on identification
The system SHALL display a modal "monster discovery card" after identifying a task, showing: large emoji/pixel art, monster name, difficulty and HP, attribute tags, and a narrative description relating the monster to the task.

#### Scenario: Discovery card appears after identification
- **WHEN** user clicks "侦查敌情" and monster is generated
- **THEN** a modal card appears showing the monster's emoji (large), name, difficulty, HP, attributes, and a story description
- **AND** the card has a "加入讨伐清单" button to dismiss

#### Scenario: Description relates to the task
- **WHEN** the discovery card is shown
- **THEN** the narrative description mentions the task content (e.g., "这只报告蟒从你迟迟不动笔的季度报告中诞生...")

### Requirement: Monster sprite display
The system SHALL display monster species visuals using enlarged emoji with CSS `image-rendering: pixelated` effect (`.monster-sprite` class). Each species maps to a specific emoji.

#### Scenario: Monster sprite in discovery card
- **WHEN** the discovery card is displayed
- **THEN** the species emoji is rendered at large size (48-64px) with pixelated rendering

#### Scenario: Monster sprite in hunt list
- **WHEN** a monster is shown in the hunt list
- **THEN** the species emoji is displayed next to the monster name
