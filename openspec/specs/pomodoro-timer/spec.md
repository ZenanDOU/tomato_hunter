## ADDED Requirements

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

### Requirement: Hunt overlay floating window
The system SHALL display the active hunt in an always-on-top floating window showing: real task name (primary), monster name + current body part (if split), time progress bar, pomodoro progress (N/M), and control buttons.

#### Scenario: Focus phase shows task info
- **WHEN** user is in the focus phase
- **THEN** the window displays: real task name as primary heading, monster name as secondary, time remaining, and pomodoro progress "番茄 N/M"

#### Scenario: Focus phase shows body part for split tasks
- **WHEN** user is hunting a sub-task from a split monster
- **THEN** the window additionally shows the body part icon and name (e.g., "💪 身体 · 写报告主体内容")

#### Scenario: Floating window closes on hunt end
- **WHEN** the pomodoro review phase completes or user retreats
- **THEN** the floating window closes and the main village window becomes visible

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

### Requirement: Main window data refresh after hunt
The system SHALL ensure the main village window displays up-to-date task and plan data after a hunt window closes. Data refresh SHALL be performed via the centralized `syncAfterHuntComplete()` function instead of individual Store fetch calls scattered across components.

#### Scenario: Return to village from rest screen
- **WHEN** user clicks "返回村庄" in the rest screen
- **THEN** the system SHALL emit a `hunt_completed` event before closing the hunt window, and the main window SHALL call `syncAfterHuntComplete()` upon receiving this event

#### Scenario: Hunt window closes after hammer mode
- **WHEN** hunt window closes directly after hammer mode completion
- **THEN** the main window SHALL also call `syncAfterHuntComplete()` to refresh all relevant data

### Requirement: Recovery dialog excludes active hunts
The system SHALL NOT show the recovery dialog for pomodoros that were completed in the current session (ended_at is set), even if the main window re-mounts.

#### Scenario: Recovery check after returning from hunt
- **WHEN** the main window becomes visible after a hunt window closes
- **THEN** the system SHALL re-check for unfinished pomodoros but SHALL NOT show the dialog if the latest pomodoro has ended_at set

#### Scenario: Genuine crash recovery
- **WHEN** the app starts and finds a pomodoro with ended_at = NULL
- **THEN** the recovery dialog SHALL appear as normal

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

### Requirement: Retreat mechanics
The system SHALL allow users to abandon a pomodoro at any time (retreat). Retreat has no punishment but provides no rewards.

#### Scenario: User retreats during focus
- **WHEN** user clicks the abandon button during any phase
- **THEN** the timer stops, no materials are dropped, no HP damage is dealt to the monster, and the user returns to the village with a brief "已安全撤退" message

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

### Requirement: Pixel art style for hunt overlay
The system SHALL use the Tomato Train color palette in the hunt overlay, with phase-specific color schemes: prep phase uses sky blue #55BBEE, focus phase uses deep blue #3366AA, review phase uses cream #FFF8E8, settlement uses cloud white with sunny yellow accents.

#### Scenario: Prep phase visual style
- **WHEN** user is in the preparation phase
- **THEN** background is sky blue #55BBEE, text is pixel black, buttons use PixelButton component, monster info displayed in PixelCard

#### Scenario: Focus phase visual style
- **WHEN** user is in the focus phase
- **THEN** background is deep blue #3366AA, timer text is white, progress bar uses PixelProgressBar with tomato red fill

#### Scenario: Review phase visual style
- **WHEN** user is in the review phase
- **THEN** background is cream #FFF8E8, text is pixel black, submit button uses PixelButton CTA variant

#### Scenario: Settlement visual style
- **WHEN** user sees the settlement screen
- **THEN** background is cloud white, title uses sunny yellow #FFD93D accent, loot items displayed in PixelCard

### Requirement: Dagger choice pause mechanic
The system SHALL implement a "choice pause" phase for dagger mode where the timer pauses and presents the user with two options: "继续行动" (continue action) or "选择休息" (choose rest). The system SHALL track the number of action choices for tomato counting. Each new action or rest round SHALL always start with a fresh 15-minute (900 second) timer, regardless of any consumable modifications applied in previous rounds. The dagger choice action SHALL be protected by an `isProcessing` guard to prevent concurrent duplicate calls.

#### Scenario: User chooses action
- **WHEN** user selects "继续行动" during a dagger choice pause
- **THEN** the action count increments by 1, focus_seconds is reset to 900, and a new 15-minute focus phase begins

#### Scenario: User chooses rest
- **WHEN** user selects "选择休息" during a dagger choice pause
- **THEN** a 15-minute rest timer begins (action count does not change), rest duration SHALL be independent of focus_seconds

#### Scenario: Dagger tomato counting
- **WHEN** user ends a dagger session (retreat or voluntary stop)
- **THEN** the system awards ceil(action_count / 2) tomatoes as rescued tomatoes

#### Scenario: Dagger has no automatic breaks
- **WHEN** user is in dagger mode
- **THEN** no automatic short or long breaks occur; all rest is user-initiated via choice pause

#### Scenario: Consumable effects are round-scoped in dagger mode
- **WHEN** user uses a time-modifying consumable (extend or shorten) during a dagger focus round
- **THEN** the effect applies only to the current round; the next round SHALL reset to 15 minutes

#### Scenario: DaggerRest duration is independent
- **WHEN** user is in DaggerRest phase
- **THEN** the rest timer SHALL always be 15 minutes (900 seconds), unaffected by any consumable-modified focus_seconds

#### Scenario: Concurrent dagger choice calls prevented
- **WHEN** user rapidly clicks "继续行动" or "选择休息" multiple times
- **THEN** only the first call SHALL execute; subsequent calls SHALL be ignored via an `isProcessing` guard, identical to the guard used by other timer actions (pause, resume, advance)

### Requirement: Dagger mode focus phase display
The FocusPhase component SHALL display the correct countdown timer for dagger mode using `remaining_seconds` instead of `pomodoro_remaining_seconds`.

#### Scenario: Dagger focus countdown display
- **WHEN** user is in focus phase during dagger mode
- **THEN** the countdown timer displays `remaining_seconds` (phase-specific remaining time)

#### Scenario: Sword focus countdown display unchanged
- **WHEN** user is in focus phase during sword mode
- **THEN** the countdown timer continues to display `pomodoro_remaining_seconds` (continuous pomodoro countdown)

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
The system SHALL support consumables that modify the active timer during a hunt. Consumable names SHALL use narrative-style naming consistent with the hunting world theme.

#### Scenario: Pause with smoke bomb (烟雾弹)
- **WHEN** user uses "烟雾弹" to pause
- **THEN** the timer pauses for up to 3 minutes

#### Scenario: Extend focus with persistence potion (持久药水)
- **WHEN** user uses "持久药水" during review phase (before completing)
- **THEN** focus phase extends by 3 minutes (timer rewinds to focus phase with 3 minutes remaining)

#### Scenario: Extend break with hot spring ticket (温泉券)
- **WHEN** user uses "温泉券" during break phase
- **THEN** break timer extends by 2 minutes

#### Scenario: Extend break button visibility
- **WHEN** player is in break or long_break phase and owns at least one 休息延伸
- **THEN** the RestScreen SHALL display a "休息延伸" button showing the owned quantity

#### Scenario: Extend break button hidden when not owned
- **WHEN** player does not own any 休息延伸
- **THEN** the button SHALL NOT be displayed

#### Scenario: Shorten focus with gale charm (疾风符咒)
- **WHEN** user uses "疾风符咒" during focus phase
- **THEN** remaining focus time is reduced by 5 minutes (minimum 1 minute remaining)

#### Scenario: Skip strategy with hunter instinct (猎人直觉)
- **WHEN** user uses "猎人直觉" during prep phase
- **THEN** prep phase ends immediately and focus phase begins

#### Scenario: Skip prep button visibility
- **WHEN** player is in prep phase and owns at least one 策略跳过
- **THEN** the PrepPhase SHALL display a "跳过策略" button showing the owned quantity

#### Scenario: Skip prep button hidden when not owned
- **WHEN** player does not own any 策略跳过
- **THEN** the button SHALL NOT be displayed

#### Scenario: Skip review with battle notes (战场速记)
- **WHEN** user uses "战场速记" after focus phase
- **THEN** review phase is skipped, pomodoro is marked complete with empty completion note "（跳过复盘）", and loot/damage proceeds normally

#### Scenario: Skip review button visibility
- **WHEN** player is in review phase and owns at least one 复盘跳过
- **THEN** the ReviewPhase SHALL display a "跳过复盘" button showing the owned quantity

#### Scenario: Skip review button hidden when not owned
- **WHEN** player does not own any 复盘跳过
- **THEN** the button SHALL NOT be displayed

#### Scenario: Double loot with lucky charm (幸运护符)
- **WHEN** user uses "幸运护符" before a hunt
- **THEN** the next hunt's material drops are doubled

#### Scenario: Fertilizer with harvest prayer (丰收祈愿)
- **WHEN** user uses "丰收祈愿"
- **THEN** farm output doubles for 60 minutes of focus time

### Requirement: Hunt view state synchronization
The system SHALL ensure the hunt overlay's visual state (which component is displayed) stays synchronized with the backend timer phase, particularly across phase transitions triggered from non-hunting views.

#### Scenario: flowPhase resets on new hunt start
- **WHEN** a new hunt is initiated from the rest screen via callback
- **THEN** HuntApp SHALL reset its internal flowPhase to "hunting" so the correct phase component renders

#### Scenario: flowPhase remains stable during normal flow
- **WHEN** the timer transitions through hunting → settlement → rest in normal sequence
- **THEN** HuntApp's flowPhase SHALL follow the sequence without premature resets

### Requirement: Consumable command feedback
The system SHALL return a success/failure indicator from consumable timer modifier commands instead of silently ignoring invalid states.

#### Scenario: Consumable used in wrong phase
- **WHEN** user attempts to use a consumable that is invalid for the current timer phase (e.g., extend_focus during break)
- **THEN** the system SHALL return an error string indicating the phase mismatch, and the consumable SHALL NOT be consumed

#### Scenario: Consumable used in correct phase
- **WHEN** user uses a consumable during its valid phase
- **THEN** the system SHALL apply the modifier and return the updated timer state
