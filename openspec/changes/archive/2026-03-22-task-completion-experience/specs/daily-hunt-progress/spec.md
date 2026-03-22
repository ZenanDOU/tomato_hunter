## ADDED Requirements

### Requirement: Daily progress summary bar
The system SHALL display a progress summary bar at the top of the DailyPlanBoard showing the overall daily completion status.

#### Scenario: Progress bar displays completion ratio
- **WHEN** user views the DailyPlanBoard
- **THEN** the top area SHALL show a PixelProgressBar with completed pomodoros / total planned pomodoros (e.g., "5/12 🍅"), updating in real-time as pomodoros complete

#### Scenario: Progress bar shows time context
- **WHEN** user views the progress summary
- **THEN** below the progress bar, the system SHALL display estimated remaining time based on uncompleted pomodoros × weapon focus duration (e.g., "还剩 2h5m")

#### Scenario: All tasks completed
- **WHEN** all planned pomodoros for the day are completed
- **THEN** the progress bar SHALL show 100% fill with a celebratory label "今日讨伐完成！🎉"

### Requirement: Three-section task display
The system SHALL organize daily plan entries into three visual sections based on task status: 进行中 (in progress), 待战 (queued), and 已讨伐 (completed).

#### Scenario: Task in hunting status shows in 进行中 section
- **WHEN** a task in the daily plan has status "hunting"
- **THEN** it SHALL appear in the "⚔️ 进行中" section at the top, with highlighted styling

#### Scenario: Task in ready status shows in 待战 section
- **WHEN** a task in the daily plan has status "ready"
- **THEN** it SHALL appear in the "📋 待战" section, maintaining user-defined sort order

#### Scenario: Killed task shows in 已讨伐 section
- **WHEN** a task in the daily plan has status "killed"
- **THEN** it SHALL appear in the "✅ 已讨伐" section at the bottom

#### Scenario: Empty section is hidden
- **WHEN** a section has no tasks
- **THEN** that section header SHALL not be rendered

#### Scenario: Released task removed from plan
- **WHEN** a task in the daily plan has status "released"
- **THEN** it SHALL be automatically removed from the daily plan (existing behavior preserved)

### Requirement: Completed task summary in 已讨伐 section
The system SHALL display completed tasks with a compact summary showing time efficiency.

#### Scenario: Completed task shows actual vs planned
- **WHEN** a killed task is displayed in the 已讨伐 section
- **THEN** it SHALL show: task name, monster name, and "实际/计划" pomodoro count (e.g., "3/4 🍅")

#### Scenario: Under-budget task shows green indicator
- **WHEN** a completed task used fewer pomodoros than planned (actual < planned)
- **THEN** the pomodoro count SHALL display with a green color accent

#### Scenario: Over-budget task shows warm indicator
- **WHEN** a completed task used more pomodoros than planned (actual > planned)
- **THEN** the pomodoro count SHALL display with a warm orange color accent (not alarming red)

#### Scenario: On-budget task shows default styling
- **WHEN** a completed task used exactly the planned pomodoros
- **THEN** the pomodoro count SHALL display with default text styling

### Requirement: 已讨伐 section collapsibility
The system SHALL make the 已讨伐 section collapsible to keep the plan board focused on remaining work.

#### Scenario: Default collapsed state
- **WHEN** the DailyPlanBoard renders with completed tasks
- **THEN** the 已讨伐 section SHALL be collapsed by default, showing only the section header with task count (e.g., "✅ 已讨伐 (3)")

#### Scenario: Expand completed section
- **WHEN** user clicks the 已讨伐 section header
- **THEN** the section SHALL expand to show all completed task summaries

#### Scenario: Collapse completed section
- **WHEN** user clicks the expanded 已讨伐 section header
- **THEN** the section SHALL collapse back to showing only the count

### Requirement: In-progress task enhanced display
The system SHALL display the currently hunting task with enhanced visual treatment in the 进行中 section.

#### Scenario: Hunting task shows live progress
- **WHEN** a task with status "hunting" is displayed in the 进行中 section
- **THEN** it SHALL show: task name, monster name, a progress bar of completed_pomodoros_today / planned_pomodoros_today, and a pulsing highlight border

#### Scenario: Hunting task retains action buttons
- **WHEN** user views a hunting task in the 进行中 section
- **THEN** the start-hunt button (⚔️) SHALL remain available to launch/resume the hunt overlay
