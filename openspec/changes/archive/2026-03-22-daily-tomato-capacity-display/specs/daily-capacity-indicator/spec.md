## ADDED Requirements

### Requirement: Four-metric capacity dashboard
The system SHALL display a capacity dashboard at the top of DailyPlanBoard presenting four core metrics: total budget (t1), completed today (t2), remaining energy (t3 = t1 - t2), and remaining task demand (t4 = sum of uncompleted pomodoros across non-killed entries).

#### Scenario: Display remaining energy and task demand side by side
- **WHEN** user views the DailyPlanBoard header
- **THEN** the system SHALL display t3 (剩余精力) and t4 (剩余任务量) as prominent numbers side by side, with t1 (总预算) editable and t2 (已完成) shown in the progress label

#### Scenario: t4 calculation includes only active entries
- **WHEN** calculating t4
- **THEN** the system SHALL sum `(planned_pomodoros_today - completed_pomodoros_today)` for entries whose task status is "ready" or "hunting", excluding "killed" entries

#### Scenario: Metrics update in real-time
- **WHEN** a pomodoro is completed or a task is added/removed from the plan
- **THEN** all four metrics SHALL update immediately without page reload

### Requirement: Overload detection and warning
The system SHALL detect when remaining task demand exceeds remaining energy and display graduated warnings.

#### Scenario: Mild overload warning
- **WHEN** t4 > t3 and (t4 - t3) ≤ 2
- **THEN** the system SHALL display an orange warning message "任务略多，可能需要加班 🍅"

#### Scenario: Severe overload warning
- **WHEN** t4 > t3 and (t4 - t3) > 2
- **THEN** the system SHALL display a red warning message "精力不足！建议移除一些任务"

#### Scenario: No warning when balanced
- **WHEN** t4 ≤ t3
- **THEN** no overload warning SHALL be displayed

#### Scenario: Overload emphasizes remove buttons
- **WHEN** an overload warning is active (t4 > t3)
- **THEN** the ✕ (remove from plan) buttons on 待战 section entries SHALL display with visual emphasis (highlight or pulse animation) to guide the user toward reducing load

### Requirement: Energy progress bar
The system SHALL display a progress bar anchored to the daily budget (t1) rather than total planned pomodoros.

#### Scenario: Progress bar shows energy consumption
- **WHEN** user views the DailyPlanBoard
- **THEN** the progress bar SHALL display with value = t2 (completed) and max = t1 (budget), labeled as "已用 X / 预算 Y"

#### Scenario: Budget fully consumed
- **WHEN** t2 ≥ t1
- **THEN** the progress bar SHALL show 100% fill. If all active tasks are killed, display "今日讨伐完成！🎉". Otherwise display "预算已用完"
