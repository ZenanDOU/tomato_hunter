## ADDED Requirements

### Requirement: Review submission resilience
The review phase submission flow SHALL handle errors gracefully and allow retry on failure.

#### Scenario: Review submission succeeds
- **WHEN** user submits the review form with a completion note
- **THEN** the system processes loot, damages monster, advances phase, and transitions to settlement

#### Scenario: Review submission fails
- **WHEN** the review submission encounters a database or command error
- **THEN** the submitting state SHALL reset to false, allowing the user to retry, and the error SHALL be logged

#### Scenario: Missing task or pomodoro ID during review
- **WHEN** the review flow detects that task_id or pomodoro_id is null
- **THEN** the system SHALL log a warning and skip loot/damage processing without crashing

### Requirement: Window close event reliability
The hunt window close event chain SHALL handle emission failures so the window does not become unresponsive.

#### Scenario: Window close event emitted successfully
- **WHEN** user clicks the hunt window close button
- **THEN** the close is intercepted, the event is emitted to the frontend, and the frontend handles it (pause or retreat)

#### Scenario: Window close event emission fails
- **WHEN** the Tauri emit call for hunt_window_close_requested fails
- **THEN** the system SHALL log the error and allow the window to close normally as a fallback
