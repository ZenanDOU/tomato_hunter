## MODIFIED Requirements

### Requirement: Large task split warning
The system SHALL allow users to evaluate inbox tasks by splitting large monsters. The split operation SHALL handle errors gracefully: on failure, the UI MUST reset to an interactive state and display an error message. The split database operations MUST be atomic (all-or-nothing).

#### Scenario: Successful split
- **WHEN** user confirms a monster split with valid parts
- **THEN** the system creates child tasks, updates the parent task, and closes the split dialog

#### Scenario: Split fails due to database error
- **WHEN** user confirms a monster split but the database operation fails
- **THEN** the system displays an error message "拆分失败，请重试" and the split button becomes clickable again

#### Scenario: Split button state during operation
- **WHEN** user clicks the split confirm button
- **THEN** the button shows "拆分中..." and is disabled until the operation completes (success or failure)
