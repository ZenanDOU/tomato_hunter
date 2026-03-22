## ADDED Requirements

### Requirement: GTD inbox for quick task capture
The system SHALL provide task quick-capture functionality within the unified hunt board (HuntBoard component) instead of a separate Inbox tab. The task creation form and unidentified task list SHALL be sections within the hunt board.

#### Scenario: Quick-capture a new task
- **WHEN** user clicks "新任务" in the hunt board and enters a task name
- **THEN** the system creates a task with status "unidentified" and the provided name

#### Scenario: View unidentified items
- **WHEN** user navigates to the 狩猟 tab
- **THEN** the system displays all tasks with status "unidentified" in the 未鉴定 section, sorted by creation time descending

### Requirement: Task identification (monster discovery)
The system SHALL allow users to evaluate inbox tasks by providing difficulty, estimated pomodoros, and category, transforming them into identified monsters ready for hunting.

#### Scenario: Identify a task with full details
- **WHEN** user fills in task name, category (work/study/creative/life/other), difficulty (simple/medium/hard/epic/legendary), and estimated pomodoro count, then clicks "生成怪物"
- **THEN** the system updates the task status to "ready", generates a monster name and description, and sets total_hp equal to estimated_pomodoros

#### Scenario: Large task split warning
- **WHEN** user sets estimated pomodoros to more than 5
- **THEN** the system displays a warning "这个怪物太强大了！建议拆分" with options: AI-assisted split, manual split, or proceed without splitting

### Requirement: Monster split error handling
The system SHALL allow users to split large monsters into body-part sub-tasks. The split operation SHALL handle errors gracefully: on failure, the UI MUST reset to an interactive state and display an error message.

#### Scenario: Successful split
- **WHEN** user confirms a monster split with valid parts
- **THEN** the system creates child tasks, updates the parent task, and closes the split dialog

#### Scenario: Split fails due to database error
- **WHEN** user confirms a monster split but the database operation fails
- **THEN** the system displays an error message "拆分失败，请重试" and the split button becomes clickable again

#### Scenario: Split button state during operation
- **WHEN** user clicks the split confirm button
- **THEN** the button shows "拆分中..." and is disabled until the operation completes (success or failure)

### Requirement: Hunt list displays ready tasks
The system SHALL display all identified tasks (status "ready" or "hunting") within the 就绪 section of the unified hunt board, instead of a separate HuntList tab. All existing display features (monster name, task name, HP bar, expandable details, split, release, batch release, start hunt) SHALL be preserved.

#### Scenario: View ready tasks
- **WHEN** user navigates to the 狩猟 tab
- **THEN** the system displays all tasks with status "ready" or "hunting" in the 就绪 section with their monster name, task name, and current_hp/total_hp as a visual HP bar

#### Scenario: Start hunt from hunt board
- **WHEN** user clicks the attack button on a hunt board item
- **THEN** the system starts the pomodoro timer for that task and opens the hunt overlay window

### Requirement: Daily plan with pomodoro budget
The system SHALL use bright village styling (pixel borders, warm colors) for the daily plan board instead of dark colors. The daily plan SHALL organize entries into three sections (进行中, 待战, 已讨伐) based on task status instead of a flat list. The daily plan SHALL provide a manual kill action for tasks. The daily plan entries SHALL NOT store cached copies of task fields; task data SHALL be derived from taskStore at render time.

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
- **THEN** entries SHALL be grouped into sections: 进行中 (hunting), 待战 (ready), 已讨伐 (killed), with each section rendered in order from top to bottom. Task status SHALL be read from taskStore, not from a cached field on the entry.

#### Scenario: Manual kill from plan board
- **WHEN** user clicks "击杀" on a task with status "hunting" or "ready" in the daily plan
- **THEN** a confirmation dialog appears, and upon confirmation the task status is set to "killed" with celebration feedback

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

### Requirement: releaseTask uses transaction
The `releaseTask` operation SHALL execute all database mutations (release parent, release children, delete plan entries) within a single transaction. If any step fails, all changes SHALL be rolled back.

#### Scenario: Successful release with children
- **WHEN** user releases a parent task that has child tasks
- **THEN** the parent task, all child tasks, and all associated plan entries SHALL be updated/deleted atomically in one transaction

#### Scenario: Release fails midway
- **WHEN** the database encounters an error while releasing child tasks
- **THEN** the parent task status SHALL NOT be changed (rolled back), and an error SHALL be shown to the user

### Requirement: batchReleaseTasks uses transaction
The `batchReleaseTasks` operation SHALL execute all releases within a single transaction. Either all tasks are released or none are.

#### Scenario: Batch release succeeds
- **WHEN** user batch-releases 5 tasks
- **THEN** all 5 tasks (and their children and plan entries) SHALL be released atomically

#### Scenario: Batch release fails on 3rd task
- **WHEN** the database fails while processing the 3rd task in a batch of 5
- **THEN** none of the 5 tasks SHALL be released (all rolled back)

### Requirement: killTask uses transaction
The `killTask` operation SHALL update task status and clean up plan entries within a single transaction.

#### Scenario: Kill task atomically
- **WHEN** user confirms a monster kill
- **THEN** the task status update to "killed" and any related data cleanup SHALL happen atomically
