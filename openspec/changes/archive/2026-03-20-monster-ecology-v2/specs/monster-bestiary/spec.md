## MODIFIED Requirements

### Requirement: Built-in monster species library
The system SHALL maintain a built-in library of 15 monster species organized into 5 families (3 tiers each). Each species includes: id, name, family, habitat, category, tier, difficulties, emoji, fixed traits, species-specific body parts, description templates, and visual description for pixel art.

#### Scenario: Species selection by category and difficulty
- **WHEN** a task is identified
- **THEN** the system selects a species matching the task's category, with the tier appropriate for the task's difficulty (juvenile for simple/medium, adult for hard/epic, king for legendary)

#### Scenario: Task-relevant naming
- **WHEN** generating a monster name
- **THEN** the name includes the task keyword and species name (e.g., "报告·钢铁蟒")

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
