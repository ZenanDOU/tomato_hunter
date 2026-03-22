## MODIFIED Requirements

### Requirement: Three-phase pomodoro micro-cycle
The system SHALL implement a pomodoro timer with three internal phases: preparation, focus, and review. Phase durations and flow logic SHALL be determined by the equipped weapon's timer mode.

#### Scenario: Sword mode (default 25-minute pomodoro)
- **WHEN** user starts a hunt with 手剑 (sword)
- **THEN** the timer runs: 2 min prep → 20 min focus → 3 min review = 25 minutes total

#### Scenario: Dagger mode (15-minute infinite loop)
- **WHEN** user starts a hunt with 匕首 (dagger)
- **THEN** the timer enters a loop: choice pause → 15 min focus → choice pause → 15 min focus/rest → ... with no automatic breaks

#### Scenario: Hammer mode (50-minute long focus)
- **WHEN** user starts a hunt with 重锤 (hammer)
- **THEN** the timer runs: 3 min prep → 44 min focus → 3 min review = 50 minutes total

#### Scenario: Phase auto-advance (prep to focus)
- **WHEN** the preparation phase timer reaches 0
- **THEN** the system automatically advances to the focus phase without user interaction

#### Scenario: Phase auto-advance (focus to review)
- **WHEN** the focus phase timer reaches 0
- **THEN** the system automatically advances to the review phase and shows the review form

## ADDED Requirements

### Requirement: Dagger choice pause mechanic
The system SHALL implement a "choice pause" phase for dagger mode where the timer pauses and presents the user with two options: "继续行动" (continue action) or "选择休息" (choose rest). The system SHALL track the number of action choices for tomato counting.

#### Scenario: User chooses action
- **WHEN** user selects "继续行动" during a dagger choice pause
- **THEN** the action count increments by 1, and a new 15-minute focus phase begins

#### Scenario: User chooses rest
- **WHEN** user selects "选择休息" during a dagger choice pause
- **THEN** a 15-minute rest timer begins (action count does not change)

#### Scenario: Dagger tomato counting
- **WHEN** user ends a dagger session (retreat or voluntary stop)
- **THEN** the system awards ceil(action_count / 2) tomatoes as rescued tomatoes

#### Scenario: Dagger has no automatic breaks
- **WHEN** user is in dagger mode
- **THEN** no automatic short or long breaks occur; all rest is user-initiated via choice pause

### Requirement: Hammer half-reward on retreat
The system SHALL award partial rewards for hammer mode when the user retreats after 25 minutes of focus time.

#### Scenario: Hammer retreat before 25 minutes
- **WHEN** user retreats during hammer mode before 25 minutes of focus time elapsed
- **THEN** no tomatoes are awarded (standard retreat behavior)

#### Scenario: Hammer retreat after 25 minutes
- **WHEN** user retreats during hammer mode after 25+ minutes of focus time elapsed
- **THEN** 1 rescued tomato is awarded (half reward)

#### Scenario: Hammer full completion
- **WHEN** user completes the full 50-minute hammer cycle
- **THEN** 2 rescued tomatoes are awarded

#### Scenario: Hammer cannot chain
- **WHEN** user completes a hammer pomodoro
- **THEN** the system returns to the village (no break timer, no next round option)

### Requirement: Break timer after pomodoro (sword mode only)
The system SHALL provide break periods only in sword mode: 5-minute short break after each pomodoro, 15-minute long break after every 4 pomodoros.

#### Scenario: Short break after sword pomodoro
- **WHEN** a sword pomodoro completes (not the 4th in a row)
- **THEN** a 5-minute break timer starts

#### Scenario: Long break after 4th sword pomodoro
- **WHEN** the 4th consecutive sword pomodoro completes
- **THEN** a 15-minute long break timer starts

### Requirement: Armor-driven focus phase audio
The system SHALL control the focus phase audio experience based on the equipped armor type.

#### Scenario: Cotton armor (棉甲) - silent
- **WHEN** user enters focus phase with 棉甲 equipped
- **THEN** all BGM and ambient audio stops; focus phase is completely silent

#### Scenario: Leather armor (皮甲) - white noise
- **WHEN** user enters focus phase with 皮甲 equipped
- **THEN** BGM stops and continuous white noise plays at moderate volume

#### Scenario: Heavy armor (重甲) - interval alerts
- **WHEN** user enters focus phase with 重甲 equipped
- **THEN** BGM stops, and a distinct chime sound plays every 3 minutes to remind the user to stay focused

### Requirement: Consumable timer modifiers
The system SHALL support consumables that modify the active timer during a hunt.

#### Scenario: Extend focus +3 minutes
- **WHEN** user uses "时间延伸" during review phase (before completing)
- **THEN** focus phase extends by 3 minutes (timer rewinds to focus phase with 3 minutes remaining)

#### Scenario: Extend break +2 minutes
- **WHEN** user uses "休息延伸" during break phase
- **THEN** break timer extends by 2 minutes

#### Scenario: Shorten focus -5 minutes
- **WHEN** user uses "时间压缩" during focus phase
- **THEN** remaining focus time is reduced by 5 minutes (minimum 1 minute remaining)

#### Scenario: Skip strategy phase
- **WHEN** user uses "策略跳过" during prep phase
- **THEN** prep phase ends immediately and focus phase begins

#### Scenario: Skip review phase
- **WHEN** user uses "复盘跳过" after focus phase
- **THEN** review phase is skipped, pomodoro is marked complete with empty completion note, and loot/damage proceeds normally
