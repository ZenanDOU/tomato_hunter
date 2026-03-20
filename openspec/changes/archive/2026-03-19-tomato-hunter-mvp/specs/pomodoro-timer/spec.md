## ADDED Requirements

### Requirement: Three-phase pomodoro micro-cycle
The system SHALL implement a pomodoro timer with three internal phases: preparation (fixed 2 minutes), focus (dynamic, default 20 minutes), and review (fixed 3 minutes). Total duration defaults to 25 minutes and is configurable via weapon equipment.

#### Scenario: Default 25-minute pomodoro
- **WHEN** user starts a hunt with the default weapon (标准短刀)
- **THEN** the timer runs: 2 min prep → 20 min focus → 3 min review = 25 minutes total

#### Scenario: Custom weapon changes focus duration
- **WHEN** user starts a hunt with a 50-minute weapon (长弓)
- **THEN** the timer runs: 2 min prep → 45 min focus → 3 min review = 50 minutes total

#### Scenario: Phase auto-advance (prep to focus)
- **WHEN** the preparation phase timer reaches 0
- **THEN** the system automatically advances to the focus phase without user interaction

#### Scenario: Phase auto-advance (focus to review)
- **WHEN** the focus phase timer reaches 0
- **THEN** the system automatically advances to the review phase and shows the review form

### Requirement: Rust-side monotonic clock timer
The system SHALL implement the timer engine in Rust using a monotonic clock (std::time::Instant), emitting tick events to the frontend every second.

#### Scenario: Timer accuracy under minimized window
- **WHEN** the main window is minimized during a focus phase
- **THEN** the timer continues counting accurately using the Rust monotonic clock

#### Scenario: System time change does not affect timer
- **WHEN** the system clock is adjusted during an active pomodoro
- **THEN** the timer's remaining time is unaffected because it uses monotonic time

### Requirement: Hunt overlay floating window
The system SHALL display the active hunt in an always-on-top floating window showing task intent, time/HP progress bar, and control buttons.

#### Scenario: Floating window opens on hunt start
- **WHEN** user starts a hunt
- **THEN** a small always-on-top window opens showing: task name, progress bar (time remaining = monster HP), pause button (if smoke bomb available), and abandon button

#### Scenario: Floating window closes on hunt end
- **WHEN** the pomodoro review phase completes or user retreats
- **THEN** the floating window closes and the main village window becomes visible

### Requirement: Review phase requires completion note
The system SHALL require users to fill in a completion note ("你完成了什么？") before finishing a pomodoro. Reflection is optional with three guided prompts.

#### Scenario: Submit review with completion note
- **WHEN** user fills in the completion note and clicks submit
- **THEN** the system records the note, marks the pomodoro as completed, damages the monster's HP by 1, and triggers loot generation

#### Scenario: Submit review with reflection
- **WHEN** user selects a reflection type (smooth/difficult/discovery) and writes reflection text
- **THEN** the system records the reflection along with the completion note

#### Scenario: Cannot submit without completion note
- **WHEN** the completion note field is empty
- **THEN** the submit button is disabled

### Requirement: Pause requires consumable item
The system SHALL require a "smoke bomb" consumable item to pause an active pomodoro. Pausing without the item is not possible.

#### Scenario: Pause with smoke bomb
- **WHEN** user clicks pause and owns a smoke bomb item
- **THEN** the system consumes one smoke bomb, pauses the timer, and starts a 3-minute pause countdown

#### Scenario: Pause button hidden without smoke bomb
- **WHEN** user has no smoke bomb items in inventory
- **THEN** the pause button is not displayed; only the abandon button is available

#### Scenario: Pause timeout auto-retreat
- **WHEN** a pause exceeds 3 minutes (180 seconds)
- **THEN** the system automatically triggers a retreat (no loot, no HP damage)

### Requirement: Retreat mechanics
The system SHALL allow users to abandon a pomodoro at any time (retreat). Retreat has no punishment but provides no rewards.

#### Scenario: User retreats during focus
- **WHEN** user clicks the abandon button during any phase
- **THEN** the timer stops, no materials are dropped, no HP damage is dealt to the monster, and the user returns to the village with a brief "已安全撤退" message

### Requirement: Break timer after pomodoro
The system SHALL provide break periods: 5-minute short break after each pomodoro, 15-minute long break after every 4 pomodoros. Break durations are configurable via weapon equipment.

#### Scenario: Short break after pomodoro
- **WHEN** a pomodoro completes (not the 4th in a row)
- **THEN** a 5-minute break timer starts with loot display, health tips, and next task preview

#### Scenario: Long break after 4th pomodoro
- **WHEN** the 4th consecutive pomodoro completes
- **THEN** a 15-minute long break timer starts

### Requirement: Crash recovery
The system SHALL write a pomodoro record to the database when a timer starts (with ended_at = NULL). On app launch, it SHALL detect unfinished pomodoros and offer recovery.

#### Scenario: App crashes during focus
- **WHEN** the app restarts and finds a pomodoro record with ended_at = NULL
- **THEN** the system shows a recovery dialog offering: "恢复狩猎" or "安全撤退"

#### Scenario: User chooses retreat on recovery
- **WHEN** user selects "安全撤退" in the recovery dialog
- **THEN** the system marks the pomodoro as "retreated" with current timestamp as ended_at

### Requirement: Window close equals pause
The system SHALL intercept the hunt overlay window close event and treat it as a pause attempt, not as abandonment.

#### Scenario: Close hunt window with smoke bomb
- **WHEN** user closes the hunt overlay window and owns a smoke bomb
- **THEN** the system consumes a smoke bomb and pauses the timer

#### Scenario: Close hunt window without smoke bomb
- **WHEN** user closes the hunt overlay window and owns no smoke bomb
- **THEN** the system triggers a retreat
