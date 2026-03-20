## ADDED Requirements

### Requirement: Built-in monster species library
The system SHALL maintain a built-in library of 15 monster species organized into 5 families (3 tiers each). Each species includes: id, name, family, habitat, category, tier, difficulties, emoji, fixed traits, species-specific body parts, description templates, and visual description for pixel art.

#### Scenario: Species selection by category and difficulty
- **WHEN** a task is identified
- **THEN** the system selects a species matching the task's category, with the tier appropriate for the task's difficulty (juvenile for simple/medium, adult for hard/epic, king for legendary)

#### Scenario: Task-relevant naming
- **WHEN** generating a monster name
- **THEN** the name includes the task keyword and species name (e.g., "报告·钢铁蟒")

### Requirement: Task-relevant monster naming
The system SHALL generate monster names that include task-related keywords. The name format is "[拖延形容词]·[任务关键词][种族后缀]" (e.g., 任务"写季度报告" → "拖延的·报告蟒").

#### Scenario: Offline name includes task keyword
- **WHEN** a task named "背单词" is identified offline
- **THEN** the monster name includes "单词" and a species suffix from the study category (e.g., "走神的·单词龙")

#### Scenario: Fallback when keyword extraction fails
- **WHEN** a task name is too short or generic to extract keywords
- **THEN** the system falls back to using the full task name with a species suffix

### Requirement: Monster discovery card with ecology info
The system SHALL display family, tier, habitat, and traits on the monster discovery card.

#### Scenario: Discovery card shows ecology
- **WHEN** the discovery card is displayed after identification
- **THEN** it shows: species emoji, monster name, family name, tier label, habitat, traits, and story description

### Requirement: Hunt list detail panel
The system SHALL support clicking a monster card in the hunt list to expand an accordion detail panel showing: task description, monster story, family/tier/habitat info, traits, body part structure (if splittable), and an attack button.

#### Scenario: Expand monster details
- **WHEN** user clicks a monster card in the hunt list
- **THEN** the card expands to show full details including task description, monster narrative, species info, and action buttons

#### Scenario: Collapse details
- **WHEN** user clicks the expanded card header again
- **THEN** the detail panel collapses back to the compact view

### Requirement: Monster sprite display
The system SHALL display monster species visuals using enlarged emoji with CSS `image-rendering: pixelated` effect (`.monster-sprite` class). Each species maps to a specific emoji.

#### Scenario: Monster sprite in discovery card
- **WHEN** the discovery card is displayed
- **THEN** the species emoji is rendered at large size (48-64px) with pixelated rendering

#### Scenario: Monster sprite in hunt list
- **WHEN** a monster is shown in the hunt list
- **THEN** the species emoji is displayed next to the monster name
