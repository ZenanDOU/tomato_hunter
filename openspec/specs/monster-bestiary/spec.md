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
The system SHALL display monster species visuals using `getSpriteData(speciesId)` to look up pixel sprite data from the centralized SPRITE_DATA map. When sprite data exists, the system MUST use the PixelSprite component to render animated pixel art. When no sprite data exists, the system MUST fall back to enlarged emoji with CSS `image-rendering: pixelated` effect (`.monster-sprite` class).

#### Scenario: Monster sprite in discovery card
- **WHEN** the discovery card is displayed
- **THEN** the species emoji is rendered at large size (48-64px) with pixelated rendering

#### Scenario: Monster sprite in hunt list
- **WHEN** a monster is shown in the hunt list
- **THEN** the species emoji is displayed next to the monster name

#### Scenario: Monster sprite in bestiary thumbnail
- **WHEN** a discovered monster is displayed in the bestiary collection
- **THEN** the system uses `getSpriteData(speciesId)` to look up the pixel sprite and renders it with PixelSprite at idle animation, scale=2

#### Scenario: Monster sprite in bestiary detail
- **WHEN** a discovered monster's detail panel is expanded in the bestiary
- **THEN** the system uses `getSpriteData(speciesId)` to look up the pixel sprite and renders it with PixelSprite at idle animation, scale=3

#### Scenario: Monster sprite fallback to emoji
- **WHEN** a monster has no pixel sprite data in SPRITE_DATA
- **THEN** the bestiary thumbnail and detail panel fall back to emoji display

### Requirement: Bestiary collection view by family
The system SHALL provide a bestiary collection view that organizes all 15 species by their 5 ecological families. Each family section shows the family name, habitat, and a row of 3 species (prey → predator → apex). This view is embedded within the hunter profile tab.

#### Scenario: All families displayed
- **WHEN** the bestiary collection view renders
- **THEN** all 5 families are shown: 锈蚀机械兽, 枯彩幻灵, 蛀典书灵, 荒野蔓生兽, 迷雾幻形体

#### Scenario: Species within family ordered by tier
- **WHEN** a family section renders
- **THEN** species are ordered left-to-right: prey (幼年), predator (成年), apex (王级)

### Requirement: Species discovery state from task history
The system SHALL determine species discovery state by querying tasks with status='killed' using the `species_id` column. A species is "discovered" if at least one task with matching `species_id` has been killed. First discovery date is the earliest `completed_at` among those tasks. The `species_id` column SHALL store the BESTIARY species ID (e.g., "work-gear-bug"), set during task identification via `selectSpecies()`.

#### Scenario: Species discovered via killed task
- **WHEN** a task with species_id="work-gear-bug" and status="killed" exists
- **THEN** the species "齿轮虫" is marked as discovered in the bestiary

#### Scenario: Species not discovered if only hunting
- **WHEN** a task with species_id="work-gear-bug" exists but status is "hunting" (not killed)
- **THEN** the species remains undiscovered in the bestiary

#### Scenario: Kill count aggregation
- **WHEN** multiple killed tasks share species_id="work-gear-bug"
- **THEN** the bestiary shows the total count of killed tasks for that species

#### Scenario: Species ID set during identification
- **WHEN** a task is identified and discovery is confirmed
- **THEN** the task's `species_id` column is set to the BESTIARY species ID returned by `selectSpecies(category, taskName, difficulty)`

#### Scenario: Existing tasks backfill species_id
- **WHEN** the app starts and there exist killed tasks with species_id IS NULL
- **THEN** the system computes species_id from each task's category, name, and difficulty using `selectSpecies()` and updates the column
