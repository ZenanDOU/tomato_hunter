## MODIFIED Requirements

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

### Requirement: Main window data refresh after hunt
The system SHALL ensure the main village window displays up-to-date task and plan data after a hunt window closes. Data refresh SHALL be performed via the centralized `syncAfterHuntComplete()` function instead of individual Store fetch calls scattered across components.

#### Scenario: Return to village from rest screen
- **WHEN** user clicks "返回村庄" in the rest screen
- **THEN** the system SHALL emit a `hunt_completed` event before closing the hunt window, and the main window SHALL call `syncAfterHuntComplete()` upon receiving this event

#### Scenario: Hunt window closes after hammer mode
- **WHEN** hunt window closes directly after hammer mode completion
- **THEN** the main window SHALL also call `syncAfterHuntComplete()` to refresh all relevant data
