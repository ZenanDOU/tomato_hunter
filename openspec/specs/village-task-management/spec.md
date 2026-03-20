## ADDED Requirements

### Requirement: GTD inbox for quick task capture
The system SHALL provide an inbox ("未确认情报") where users can quickly capture tasks without needing to evaluate difficulty or assign pomodoro counts.

#### Scenario: Quick-capture a new task
- **WHEN** user clicks "新任务" in the inbox view and enters a task name
- **THEN** the system creates a task with status "unidentified" and the provided name

#### Scenario: View inbox items
- **WHEN** user navigates to the inbox tab
- **THEN** the system displays all tasks with status "unidentified", sorted by creation time descending

### Requirement: Task identification (monster discovery)
The system SHALL allow users to evaluate inbox tasks by providing difficulty, estimated pomodoros, and category, transforming them into identified monsters ready for hunting.

#### Scenario: Identify a task with full details
- **WHEN** user fills in task name, category (work/study/creative/life/other), difficulty (simple/medium/hard/epic/legendary), and estimated pomodoro count, then clicks "生成怪物"
- **THEN** the system updates the task status to "ready", generates a monster name and description, and sets total_hp equal to estimated_pomodoros

#### Scenario: Large task split warning
- **WHEN** user sets estimated pomodoros to more than 5
- **THEN** the system displays a warning "这个怪物太强大了！建议拆分" with options: AI-assisted split, manual split, or proceed without splitting

### Requirement: Hunt list displays ready tasks
The system SHALL display all identified tasks (status "ready" or "hunting") in a hunt list showing monster name, original task name, and HP progress bar.

#### Scenario: View hunt list
- **WHEN** user navigates to the hunt list tab
- **THEN** the system displays all tasks with status "ready" or "hunting" with their monster name, task name, and current_hp/total_hp as a visual HP bar

#### Scenario: Start hunt from hunt list
- **WHEN** user clicks the attack button on a hunt list item
- **THEN** the system starts the pomodoro timer for that task and opens the hunt overlay window

### Requirement: Daily plan with pomodoro budget
The system SHALL use bright village styling (pixel borders, warm colors) for the daily plan board instead of dark colors.

#### Scenario: Set daily budget
- **WHEN** user sets the daily pomodoro budget to N
- **THEN** the system stores the budget and displays allocated vs total count

#### Scenario: Add task to daily plan
- **WHEN** user adds a task from the hunt list to the daily plan
- **THEN** the system creates a planned entry with the task and specified pomodoro allocation, and updates the allocated count

#### Scenario: Over-budget warning
- **WHEN** allocated pomodoros exceeds the daily budget
- **THEN** displays warning with light red styling (bg-red-100, text-red-600)

#### Scenario: Track daily completion
- **WHEN** a pomodoro is completed for a task in the daily plan
- **THEN** the system increments the completed_pomodoros_today counter for that plan entry

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
