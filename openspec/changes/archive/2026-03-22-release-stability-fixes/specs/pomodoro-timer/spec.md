## MODIFIED Requirements

### Requirement: Rust-side monotonic clock timer
The system SHALL implement the timer engine in Rust using a monotonic clock (std::time::Instant), emitting tick events to the frontend every second. The tick loop SHALL handle mutex lock failures gracefully without crashing.

#### Scenario: Timer accuracy under minimized window
- **WHEN** the main window is minimized during a focus phase
- **THEN** the timer continues counting accurately using the Rust monotonic clock

#### Scenario: System time change does not affect timer
- **WHEN** the system clock is adjusted during an active pomodoro
- **THEN** the timer's remaining time is unaffected because it uses monotonic time

#### Scenario: Tick loop mutex lock failure
- **WHEN** the tick loop fails to acquire the timer mutex (e.g., due to mutex poisoning)
- **THEN** the tick loop SHALL log the error, skip the current tick, and continue the loop without panicking

#### Scenario: Command handler panic does not crash tick loop
- **WHEN** a command handler panics while holding the timer mutex
- **THEN** the tick loop SHALL detect the poisoned mutex, log a warning, and continue operating (degraded but alive)

### Requirement: Pause requires consumable item
The system SHALL require a "smoke bomb" consumable item to pause an active pomodoro. Pausing without the item is not possible. The resume action SHALL be protected against concurrent duplicate calls.

#### Scenario: Pause with smoke bomb
- **WHEN** user clicks pause and owns a smoke bomb item
- **THEN** the system consumes one smoke bomb, pauses the timer, and starts a 3-minute pause countdown

#### Scenario: Pause button hidden without smoke bomb
- **WHEN** user has no smoke bomb items in inventory
- **THEN** the pause button is not displayed; only the abandon button is available

#### Scenario: Pause timeout auto-retreat
- **WHEN** a pause exceeds 3 minutes (180 seconds)
- **THEN** the system automatically triggers a retreat (no loot, no HP damage)

#### Scenario: Concurrent resume calls
- **WHEN** user rapidly clicks the resume button multiple times
- **THEN** only the first resume call SHALL execute; subsequent calls SHALL be ignored via an isProcessing guard

## ADDED Requirements

### Requirement: Consumable command feedback
The system SHALL return a success/failure indicator from consumable timer modifier commands instead of silently ignoring invalid states.

#### Scenario: Consumable used in wrong phase
- **WHEN** user attempts to use a consumable that is invalid for the current timer phase (e.g., extend_focus during break)
- **THEN** the system SHALL return an error string indicating the phase mismatch, and the consumable SHALL NOT be consumed

#### Scenario: Consumable used in correct phase
- **WHEN** user uses a consumable during its valid phase
- **THEN** the system SHALL apply the modifier and return the updated timer state
