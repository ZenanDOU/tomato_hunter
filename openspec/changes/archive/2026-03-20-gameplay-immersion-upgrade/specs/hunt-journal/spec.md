## MODIFIED Requirements

### Requirement: Defeated monsters enter Tomato Sanctuary
The system SHALL record every defeated monster in the Tomato Sanctuary (番茄收容所), displaying the rescued tomato with its battle story.

#### Scenario: Defeated monster enters sanctuary
- **WHEN** a monster's HP reaches 0
- **THEN** the task appears in the sanctuary with: a 🍅 emoji, the monster name, task name, attribute tags, monster description, and completion timestamp

#### Scenario: View sanctuary list
- **WHEN** user navigates to the 🍅 收容所 tab
- **THEN** the system displays all defeated monsters sorted by completion date descending, each entry prefixed with 🍅 emoji, showing monster name, task name, actual vs estimated pomodoros, and date

## ADDED Requirements

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
