## MODIFIED Requirements

### Requirement: GTD inbox for quick task capture
The system SHALL provide task quick-capture functionality within the unified hunt board (HuntBoard component) instead of a separate Inbox tab. The task creation form and unidentified task list SHALL be sections within the hunt board.

#### Scenario: Quick-capture a new task
- **WHEN** user clicks "新任务" in the hunt board and enters a task name
- **THEN** the system creates a task with status "unidentified" and the provided name

#### Scenario: View unidentified items
- **WHEN** user navigates to the 狩猎 tab
- **THEN** the system displays all tasks with status "unidentified" in the 未鉴定 section, sorted by creation time descending

### Requirement: Hunt list displays ready tasks
The system SHALL display all identified tasks (status "ready" or "hunting") within the 就绪 section of the unified hunt board, instead of a separate HuntList tab. All existing display features (monster name, task name, HP bar, expandable details, split, release, batch release, start hunt) SHALL be preserved.

#### Scenario: View ready tasks
- **WHEN** user navigates to the 狩猎 tab
- **THEN** the system displays all tasks with status "ready" or "hunting" in the 就绪 section with their monster name, task name, and current_hp/total_hp as a visual HP bar

#### Scenario: Start hunt from hunt board
- **WHEN** user clicks the attack button on a hunt board item
- **THEN** the system starts the pomodoro timer for that task and opens the hunt overlay window

## REMOVED Requirements

### Requirement: Separate Inbox tab
**Reason**: Inbox functionality is merged into the unified hunt board (HuntBoard). All quick-capture and identification features are preserved within the 未鉴定 section.
**Migration**: Use the 狩猎 tab's 未鉴定 section for all inbox operations.

### Requirement: Separate Hunt list tab
**Reason**: Hunt list functionality is merged into the unified hunt board (HuntBoard). All ready-task display and action features are preserved within the 就绪 section.
**Migration**: Use the 狩猎 tab's 就绪 section for all hunt list operations.
