## MODIFIED Requirements

### Requirement: Hunt overlay floating window
The system SHALL display the active hunt in an always-on-top floating window showing: real task name (primary), monster name + current body part (if split), time progress bar, pomodoro progress (N/M), and control buttons.

#### Scenario: Focus phase shows task info
- **WHEN** user is in the focus phase
- **THEN** the window displays: real task name as primary heading, monster name as secondary, time remaining, and pomodoro progress "番茄 N/M"

#### Scenario: Focus phase shows body part for split tasks
- **WHEN** user is hunting a sub-task from a split monster
- **THEN** the window additionally shows the body part icon and name (e.g., "💪 身体 · 写报告主体内容")

#### Scenario: Floating window closes on hunt end
- **WHEN** the pomodoro review phase completes or user retreats
- **THEN** the floating window closes and the main village window becomes visible

### Requirement: Review phase requires completion note
The system SHALL require users to fill in a completion note ("你完成了什么？") before finishing a pomodoro. Reflection is optional with three guided prompts.

#### Scenario: Submit review with completion note
- **WHEN** user fills in the completion note and clicks submit
- **THEN** the system records the note, marks the pomodoro as completed, damages the monster's HP by 1, and triggers loot generation

#### Scenario: Cannot submit without completion note
- **WHEN** the completion note field is empty
- **THEN** the submit button is disabled
