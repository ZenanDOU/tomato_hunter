## ADDED Requirements

### Requirement: Defeated monsters enter Tomato Sanctuary
The system SHALL record every defeated monster in the Tomato Sanctuary (番茄收容所), displaying the rescued tomato with its battle story.

#### Scenario: Defeated monster enters sanctuary
- **WHEN** a monster's HP reaches 0
- **THEN** the task appears in the sanctuary with: a 🍅 emoji, the monster name, task name, attribute tags, monster description, and completion timestamp

#### Scenario: View sanctuary list
- **WHEN** user navigates to the 🍅 收容所 tab
- **THEN** the system displays all defeated monsters sorted by completion date descending, each entry prefixed with 🍅 emoji, showing monster name, task name, actual vs estimated pomodoros, and date

### Requirement: Journal entry shows hunt history
The system SHALL display detailed hunt history for each journal entry, including every pomodoro session's completion notes and reflections.

#### Scenario: View journal entry detail
- **WHEN** user clicks a journal entry
- **THEN** the system shows: monster info, estimated vs actual pomodoro comparison, and a chronological list of all pomodoro sessions with their completion notes, reflection types, and reflection texts

### Requirement: Estimated vs actual efficiency insight
The system SHALL display the comparison between estimated and actual pomodoro counts for each killed monster, providing implicit efficiency feedback.

#### Scenario: Task took more pomodoros than estimated
- **WHEN** a task estimated 3 pomodoros but actually took 5
- **THEN** the journal entry displays "预估: 3 / 实际: 5" allowing the user to recognize estimation patterns

#### Scenario: Task completed within estimate
- **WHEN** a task estimated 4 pomodoros and took 3
- **THEN** the journal entry displays "预估: 4 / 实际: 3"

### Requirement: Loadout snapshot in journal
The system SHALL record the equipment loadout used for each pomodoro session, visible in the journal entry detail.

#### Scenario: View loadout for past hunt
- **WHEN** user views a journal entry's pomodoro detail
- **THEN** each pomodoro record shows the weapon and armor that were equipped during that session

### Requirement: Tomato wall collection display
The system SHALL display rescued tomatoes as a visual emoji grid (tomato wall) at the top of the sanctuary.

#### Scenario: View tomato wall
- **WHEN** user opens the sanctuary
- **THEN** the top section shows a grid of 🍅 emojis (count = player's "获救番茄" material quantity, capped at 50 visible with "+N" overflow) and text "已拯救 N 颗番茄"

### Requirement: Sanctuary entry detail with battle records
The system SHALL display the full battle journey for each sanctuary entry.

#### Scenario: View battle journey detail
- **WHEN** user clicks a sanctuary entry
- **THEN** the system shows: monster info with attribute tags, monster description ("被囚禁时"), each pomodoro session with completion notes and reflections (labeled as "战斗记录"), and estimated vs actual comparison
