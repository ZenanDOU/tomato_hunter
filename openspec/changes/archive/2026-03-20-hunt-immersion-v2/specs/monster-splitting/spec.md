## ADDED Requirements

### Requirement: Monster body part splitting
The system SHALL allow users to split large monsters (>4 estimated pomodoros) into 3 body part sub-tasks: 🧠 头部 (planning/thinking), 💪 身体 (main execution), 🦶 脚部 (finishing/delivery).

#### Scenario: Split option shown for large monsters
- **WHEN** a task has >4 estimated pomodoros and is in "ready" status
- **THEN** a "拆分怪物" button is displayed on the monster card

#### Scenario: Split form requires details for each part
- **WHEN** user clicks "拆分怪物"
- **THEN** a form appears with 3 sections (头部/身体/脚部), each requiring: a name (what this part represents), a description, and a pomodoro allocation
- **AND** the total pomodoros across all parts MUST equal the original monster's total HP

#### Scenario: Split creates sub-tasks
- **WHEN** user submits the split form with valid data
- **THEN** the system creates 3 new tasks with parent_task_id pointing to the original task, each with the specified name, description, and HP
- **AND** the original task's status changes to indicate it's a container (not directly huntable)

### Requirement: Parent task auto-completion
The system SHALL automatically mark a parent task as "killed" when all its sub-tasks are completed.

#### Scenario: All parts defeated
- **WHEN** the last sub-task of a split monster is killed
- **THEN** the parent task status automatically changes to "killed" with completed_at set

#### Scenario: Partial completion
- **WHEN** some but not all sub-tasks are killed
- **THEN** the parent task remains in its container status

### Requirement: Body part visual in hunt list
The system SHALL display split monsters with a body part diagram showing completion status.

#### Scenario: View split monster in hunt list
- **WHEN** a split monster is displayed in the hunt list
- **THEN** it shows the parent monster name with 3 body part indicators (🧠💪🦶), completed parts shown with checkmarks, pending parts clickable to start hunt
