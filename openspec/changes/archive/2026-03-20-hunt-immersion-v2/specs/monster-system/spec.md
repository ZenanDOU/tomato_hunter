## MODIFIED Requirements

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
