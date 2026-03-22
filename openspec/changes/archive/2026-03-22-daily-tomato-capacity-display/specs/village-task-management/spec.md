## MODIFIED Requirements

### Requirement: Daily plan with pomodoro budget
The system SHALL use bright village styling (pixel borders, warm colors) for the daily plan board instead of dark colors. The daily plan SHALL organize entries into three sections (进行中, 待战, 已讨伐) based on task status instead of a flat list. The daily plan SHALL provide a manual kill action for tasks.

#### Scenario: Set daily budget
- **WHEN** user sets the daily pomodoro budget to N
- **THEN** the system stores the budget and displays it as the anchor for the energy progress bar and capacity dashboard

#### Scenario: Add task to daily plan
- **WHEN** user adds a task from the hunt list to the daily plan
- **THEN** the system creates a planned entry with the task and specified pomodoro allocation, and updates t4 (remaining task demand) accordingly

#### Scenario: Over-budget warning
- **WHEN** remaining task demand (t4) exceeds remaining energy (t3)
- **THEN** the system SHALL display a graduated overload warning (orange for mild, red for severe) instead of the previous static allocated-vs-budget comparison

#### Scenario: Track daily completion
- **WHEN** a pomodoro is completed for a task in the daily plan
- **THEN** the system increments the completed_pomodoros_today counter for that plan entry, updates t2, t3, and t4 in the capacity dashboard

#### Scenario: Killed task moves to 已讨伐 section
- **WHEN** a task in the daily plan reaches status "killed"
- **THEN** the task SHALL automatically appear in the 已讨伐 section and no longer occupy the 待战 or 进行中 section, and its pomodoros SHALL be excluded from t4 calculation

#### Scenario: Plan entries grouped by task status
- **WHEN** user views the daily plan
- **THEN** entries SHALL be grouped into sections: 进行中 (hunting), 待战 (ready), 已讨伐 (killed), with each section rendered in order from top to bottom

#### Scenario: Manual kill from plan board
- **WHEN** user clicks "击杀" on a task with status "hunting" or "ready" in the daily plan
- **THEN** a confirmation dialog appears, and upon confirmation the task status is set to "killed" with celebration feedback
