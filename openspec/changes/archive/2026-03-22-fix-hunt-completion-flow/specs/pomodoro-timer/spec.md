## MODIFIED Requirements

### Requirement: Review phase requires completion note
The system SHALL require users to fill in a completion note ("你完成了什么？") before finishing a pomodoro. Reflection is optional with three guided prompts. When damageTask() causes HP to reach 0, the system SHALL NOT automatically set the task to "killed" — instead it SHALL pass an HP-zero signal to the Settlement screen for user confirmation.

#### Scenario: Submit review with completion note
- **WHEN** user fills in the completion note and clicks submit
- **THEN** the system records the note, marks the pomodoro as completed, damages the monster's HP by 1, and triggers loot generation

#### Scenario: Cannot submit without completion note
- **WHEN** the completion note field is empty
- **THEN** the submit button is disabled

#### Scenario: HP reaches zero after damage
- **WHEN** the review is submitted and damageTask() reduces current_hp to 0
- **THEN** the system SHALL use damageTask's return value (not a separate DB query) to determine HP-zero state, and Settlement SHALL display the kill confirmation view regardless of mount timing

#### Scenario: HP still remaining after damage
- **WHEN** the review is submitted and current_hp remains > 0 after damageTask()
- **THEN** the Settlement screen proceeds with normal "怪物受伤" flow (no kill confirmation)

#### Scenario: Settlement view reacts to HP-zero prop change
- **WHEN** Settlement is mounted and `hpReachedZero` prop changes from false to true
- **THEN** the Settlement SHALL switch to the kill confirmation view

## ADDED Requirements

### Requirement: Main window data refresh after hunt
The system SHALL ensure the main village window displays up-to-date task and plan data after a hunt window closes.

#### Scenario: Return to village from rest screen
- **WHEN** user clicks "返回村庄" in the rest screen
- **THEN** the system SHALL emit a `hunt_completed` event before closing the hunt window, and the main window SHALL refresh task and plan data upon receiving this event

#### Scenario: Hunt window closes after hammer mode
- **WHEN** hunt window closes directly after hammer mode completion
- **THEN** the main window SHALL also refresh task and plan data

### Requirement: Recovery dialog excludes active hunts
The system SHALL NOT show the recovery dialog for pomodoros that were completed in the current session (ended_at is set), even if the main window re-mounts.

#### Scenario: Recovery check after returning from hunt
- **WHEN** the main window becomes visible after a hunt window closes
- **THEN** the system SHALL re-check for unfinished pomodoros but SHALL NOT show the dialog if the latest pomodoro has ended_at set

#### Scenario: Genuine crash recovery
- **WHEN** the app starts and finds a pomodoro with ended_at = NULL
- **THEN** the recovery dialog SHALL appear as normal
