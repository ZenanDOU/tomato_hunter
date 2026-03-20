## ADDED Requirements

### Requirement: Pomodoro group display for large monsters
The system SHALL display a pomodoro group breakdown for monsters with >4 planned pomodoros in the daily plan. Each group contains up to 4 pomodoros, with a long break between groups.

#### Scenario: 6-pomodoro monster shows 2 groups
- **WHEN** user views a 6-pomodoro monster in the daily plan
- **THEN** the plan shows "第1组 4🍅 休 第2组 2🍅"

#### Scenario: 3-pomodoro monster shows no groups
- **WHEN** user views a 3-pomodoro monster in the daily plan
- **THEN** no group breakdown is shown

### Requirement: Hunt order sort with arrow buttons
The system SHALL allow users to reorder planned tasks using ▲/▼ buttons, persisting the sort order via `sort_order` field.

#### Scenario: Move task up
- **WHEN** user clicks ▲ on a planned task
- **THEN** the task swaps sort_order with the task above it and the list re-renders

#### Scenario: Order persists across refresh
- **WHEN** user reorders tasks and refreshes the app
- **THEN** the daily plan displays tasks in the user-set order

### Requirement: Time estimate display
The system SHALL show total estimated time based on allocated pomodoros × active weapon's focus duration.

#### Scenario: View time estimate
- **WHEN** user views the daily plan with 8 allocated pomodoros and a 25-min weapon
- **THEN** the header shows "3h20m" next to the pomodoro count

### Requirement: Difficulty auto-sets estimated pomodoros
The system SHALL set the estimated pomodoros input to the difficulty range's starting value when user selects a difficulty in the task form.

#### Scenario: Select medium difficulty
- **WHEN** user clicks "中等 (3-5 番茄)" in the task creation form
- **THEN** the estimated_pomodoros input automatically changes to 3

## MODIFIED Requirements

### Requirement: Daily plan with pomodoro budget
The system SHALL use bright village styling (pixel borders, warm colors) for the daily plan board instead of dark colors.

#### Scenario: Over-budget warning
- **WHEN** allocated pomodoros exceeds the daily budget
- **THEN** displays warning with light red styling (bg-red-100, text-red-600)
