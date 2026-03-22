## ADDED Requirements

### Requirement: Defeated monsters enter Tomato Farm
The system SHALL record every defeated monster and add its rescued tomato to the Tomato Farm (番茄农场), replacing the former Tomato Sanctuary.

#### Scenario: Defeated monster enters farm
- **WHEN** a monster's HP reaches 0
- **THEN** the rescued tomato is added to the farm's population count, and the task appears in the farm's battle history with: 🍅 emoji, monster name, task name, attribute tags, and completion timestamp

#### Scenario: View farm battle history
- **WHEN** user navigates to the 🍅 农场 tab and scrolls to battle history
- **THEN** the system displays all defeated monsters sorted by completion date descending, each showing monster name, task name, actual vs estimated pomodoros, and date

### Requirement: Journal entry shows hunt history
The system SHALL display detailed hunt history for each journal entry, including every pomodoro session's completion notes and reflections.

#### Scenario: View journal entry detail
- **WHEN** user clicks a journal entry
- **THEN** the system shows: monster info, estimated vs actual pomodoro comparison, and a chronological list of all pomodoro sessions with their completion notes, reflection types, and reflection texts

### Requirement: Estimated vs actual efficiency insight
The system SHALL display the comparison between estimated and actual pomodoro counts for each killed monster, providing implicit efficiency feedback.

#### Scenario: Task took more pomodoros than estimated
- **WHEN** a task estimated 3 pomodoros but actually took 5
- **THEN** the journal entry displays "预估: 3 / 实际: 5" allowing the user to recognize estimation patterns

#### Scenario: Task completed within estimate
- **WHEN** a task estimated 4 pomodoros and took 3
- **THEN** the journal entry displays "预估: 4 / 实际: 3"

### Requirement: Loadout snapshot in journal
The system SHALL record the equipment loadout used for each pomodoro session, visible in the journal entry detail.

#### Scenario: View loadout for past hunt
- **WHEN** user views a journal entry's pomodoro detail
- **THEN** each pomodoro record shows the weapon and armor that were equipped during that session

### Requirement: Tomato wall collection display
The system SHALL display rescued tomatoes as a visual emoji grid (tomato wall) within the Tomato Farm view.

#### Scenario: View tomato wall in farm
- **WHEN** user opens the Tomato Farm
- **THEN** the top section shows a grid of 🍅 emojis (count = total rescued tomatoes, capped at 50 visible with "+N" overflow) and text "农场番茄: N 颗"

<!-- REMOVED: Requirement: Defeated monsters enter Tomato Sanctuary -->
<!-- Reason: Tomato Sanctuary is replaced by Tomato Farm. The farm serves both as tomato display and passive economy engine. -->
<!-- Migration: All existing sanctuary data (rescued tomatoes, battle history) is preserved and displayed in the new farm view. UI component changes from TomatoSanctuary.tsx to TomatoFarm.tsx. -->

<!-- REMOVED: Requirement: Sanctuary entry detail with battle records -->
<!-- Reason: Replaced by farm battle history detail with identical data but within the farm context. -->
<!-- Migration: Battle record detail view remains functionally the same, re-parented under the farm UI. -->

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
