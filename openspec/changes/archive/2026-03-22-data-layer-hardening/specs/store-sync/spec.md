## ADDED Requirements

### Requirement: Centralized store sync functions
The system SHALL provide a `storeSync.ts` module with scenario-specific sync functions that refresh all affected Stores after a cross-cutting operation. Components SHALL call these sync functions instead of manually invoking individual Store fetch methods.

#### Scenario: Sync after hunt completion
- **WHEN** `syncAfterHuntComplete()` is called
- **THEN** the system SHALL refresh taskStore, planStore, and inventoryStore in parallel

#### Scenario: Sync after task release
- **WHEN** `syncAfterTaskRelease()` is called
- **THEN** the system SHALL refresh taskStore and planStore in parallel

#### Scenario: Sync after crafting
- **WHEN** `syncAfterCraft()` is called
- **THEN** the system SHALL refresh inventoryStore

#### Scenario: Sync after farm state change
- **WHEN** `syncAfterFarmUpdate()` is called
- **THEN** the system SHALL refresh farmStore

### Requirement: planStore entries derive task fields at consumption time
The planStore SHALL NOT cache task fields (name, status, current_hp, total_hp, actual_pomodoros, monster_name, category) in its entries. Instead, the SQL query for `fetchTodayPlan()` SHALL only select entry-specific columns (id, task_id, planned_pomodoros_today, completed_pomodoros_today, sort_order). Components that need task fields SHALL merge planStore entries with taskStore tasks at render time.

#### Scenario: fetchTodayPlan returns entry metadata only
- **WHEN** `planStore.fetchTodayPlan()` is called
- **THEN** each entry in `plan.entries` SHALL contain only: id, task_id, planned_pomodoros_today, completed_pomodoros_today, sort_order — with no task-derived fields

#### Scenario: DailyPlanBoard displays task data from taskStore
- **WHEN** the DailyPlanBoard renders a plan entry
- **THEN** it SHALL look up the task by `entry.task_id` from `taskStore.tasks` to display name, status, HP, and other task fields

#### Scenario: Task status changes reflect immediately in plan view
- **WHEN** a task's status changes in taskStore (e.g., from "ready" to "killed")
- **THEN** the plan view SHALL show the updated status without requiring `planStore.fetchTodayPlan()` to be called

### Requirement: Reduced redundant fetches in hunt completion flow
The hunt completion flow SHALL invoke each Store's fetch method at most once. The `syncAfterHuntComplete()` function SHALL be called once at the end of the flow, replacing scattered individual fetch calls.

#### Scenario: Hunt completion triggers single sync
- **WHEN** the user completes a pomodoro review and confirms the kill
- **THEN** taskStore.fetchTasks, planStore.fetchTodayPlan, and inventoryStore.fetchAll SHALL each be called exactly once (via syncAfterHuntComplete), not multiple times across the flow
