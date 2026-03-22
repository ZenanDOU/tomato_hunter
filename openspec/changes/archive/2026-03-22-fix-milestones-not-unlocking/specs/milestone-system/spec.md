## MODIFIED Requirements

### Requirement: Milestone detection at settlement
The system SHALL run milestone detection after each pomodoro completion, during the settlement phase. Detection iterates all milestone definitions, checks each against the database, and records any newly achieved milestones. Additionally, the system SHALL run milestone detection once after species_id backfill completes at app startup, to catch milestones that depend on species_id data.

#### Scenario: Detection after pomodoro completion
- **WHEN** a pomodoro completes and loot is distributed
- **THEN** the milestone detection runs and checks all unachieved milestones

#### Scenario: Detection after species backfill
- **WHEN** the app starts and `backfillSpeciesIds()` successfully updates at least one task's species_id
- **THEN** `detectNewMilestones()` SHALL be invoked to check species-dependent milestones (species-5, species-10, species-15)

#### Scenario: Multiple milestones achieved simultaneously
- **WHEN** a single pomodoro completion triggers both "pomodoro-10" and "first-kill"
- **THEN** both milestones are recorded and both notifications are queued

## ADDED Requirements

### Requirement: Milestone detection error visibility
The system SHALL log a warning (not silently swallow) when `detectNewMilestones()` encounters a database error. The function SHALL NOT throw — it continues to return an empty array on failure — but MUST output `console.warn` with the error message so developers can diagnose issues.

#### Scenario: Milestones table does not exist
- **WHEN** `detectNewMilestones()` runs but the `milestones` table has not been created
- **THEN** a `console.warn` message is logged containing the error details, and the function returns an empty array

#### Scenario: Normal operation
- **WHEN** `detectNewMilestones()` runs successfully
- **THEN** no warning is logged
