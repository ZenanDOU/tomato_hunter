## MODIFIED Requirements

### Requirement: GTD inbox for quick task capture
The system SHALL provide task quick-capture functionality within the unified hunt board (HuntBoard component) instead of a separate Inbox tab. The task creation form and unidentified task list SHALL be sections within the hunt board.

#### Scenario: Quick-capture a new task
- **WHEN** user clicks "新任务" in the hunt board and enters a task name
- **THEN** the system creates a task with status "unidentified" and the provided name

#### Scenario: View unidentified items
- **WHEN** user navigates to the 狩猟 tab
- **THEN** the system displays all tasks with status "unidentified" in the 未鉴定 section, sorted by creation time descending

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
