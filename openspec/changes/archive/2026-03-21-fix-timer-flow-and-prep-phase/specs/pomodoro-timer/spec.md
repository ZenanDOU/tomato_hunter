## MODIFIED Requirements

### Requirement: Break timer after pomodoro (sword mode only)
The system SHALL provide break periods only in sword mode: 5-minute short break after each pomodoro, 15-minute long break after every 4 pomodoros. When break ends, the system SHALL support seamless transition to the next pomodoro.

#### Scenario: Short break after sword pomodoro
- **WHEN** a sword pomodoro completes (not the 4th in a row)
- **THEN** a 5-minute break timer starts

#### Scenario: Long break after 4th sword pomodoro
- **WHEN** the 4th consecutive sword pomodoro completes
- **THEN** a 15-minute long break timer starts

#### Scenario: Start next pomodoro from rest screen
- **WHEN** user clicks "开始下一个番茄" during or after break
- **THEN** the system SHALL end the break phase, start a new pomodoro with the next queued task, AND transition the hunt view from rest back to hunting (prep phase)

#### Scenario: View state resets on new hunt from rest
- **WHEN** a new hunt starts from the rest screen
- **THEN** the hunt overlay SHALL display the PrepPhase component, NOT continue showing the RestScreen

### Requirement: Three-phase pomodoro micro-cycle
The system SHALL implement a pomodoro timer with three internal phases: preparation, focus, and review. Phase durations and flow logic SHALL be determined by the equipped weapon's timer mode. The preparation phase SHALL share the total pomodoro duration with the focus phase.

#### Scenario: Sword mode (default 25-minute pomodoro)
- **WHEN** user starts a hunt with 手剑 (sword)
- **THEN** the timer runs: 2 min prep → 20 min focus → 3 min review = 25 minutes total

#### Scenario: Dagger mode (15-minute infinite loop)
- **WHEN** user starts a hunt with 匕首 (dagger)
- **THEN** the timer enters a loop: choice pause → 15 min focus → choice pause → 15 min focus/rest → ... with no automatic breaks

#### Scenario: Hammer mode (50-minute long focus)
- **WHEN** user starts a hunt with 重锤 (hammer)
- **THEN** the timer runs: 3 min prep → 44 min focus → 3 min review = 50 minutes total

#### Scenario: Prep phase countdown shows total pomodoro time
- **WHEN** user enters the prep phase in sword mode
- **THEN** the UI SHALL display the pomodoro total remaining time (starting from 25:00) as the primary countdown, not the prep phase's own 2-minute timer

#### Scenario: Prep time savings transfer to focus
- **WHEN** user completes or skips the prep phase before the 2-minute suggestion expires
- **THEN** the unused prep time SHALL be added to the focus phase duration (e.g., completing prep in 30 seconds gives 21:30 focus instead of 20:00)

#### Scenario: Prep overtime reminder
- **WHEN** user spends more than 2 minutes in the prep phase
- **THEN** the UI SHALL display a gentle reminder text encouraging the user to begin the focus phase soon

#### Scenario: Phase auto-advance (prep to focus)
- **WHEN** the preparation phase timer reaches 0
- **THEN** the system automatically advances to the focus phase without user interaction

#### Scenario: Phase auto-advance (focus to review)
- **WHEN** the focus phase timer reaches 0
- **THEN** the system automatically advances to the review phase and shows the review form

## ADDED Requirements

### Requirement: Hunt view state synchronization
The system SHALL ensure the hunt overlay's visual state (which component is displayed) stays synchronized with the backend timer phase, particularly across phase transitions triggered from non-hunting views.

#### Scenario: flowPhase resets on new hunt start
- **WHEN** a new hunt is initiated from the rest screen via callback
- **THEN** HuntApp SHALL reset its internal flowPhase to "hunting" so the correct phase component renders

#### Scenario: flowPhase remains stable during normal flow
- **WHEN** the timer transitions through hunting → settlement → rest in normal sequence
- **THEN** HuntApp's flowPhase SHALL follow the sequence without premature resets
