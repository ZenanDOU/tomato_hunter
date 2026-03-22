## MODIFIED Requirements

### Requirement: Application error boundary
The application SHALL display a friendly error screen instead of a blank page when a rendering error occurs. The error screen SHALL show an error description and a "Reload" button. ErrorBoundary components SHALL wrap the main village layout and the hunt window layout independently. Critical async operations in UI components SHALL be wrapped in try-catch blocks.

#### Scenario: Component rendering error caught
- **WHEN** a React component throws an error during rendering
- **THEN** the ErrorBoundary catches the error and displays a pixel-styled error screen with a reload button instead of a white screen

#### Scenario: Hunt window error does not crash village
- **WHEN** the hunt window encounters a rendering error
- **THEN** only the hunt window shows the error screen; the main village window remains functional

#### Scenario: PrepPhase database write failure
- **WHEN** the strategy note database write fails in PrepPhase
- **THEN** the system SHALL log the error and still allow advancing to focus phase (strategy note is non-critical)

#### Scenario: RecoveryDialog retreat failure
- **WHEN** the retreat database update fails in RecoveryDialog
- **THEN** the system SHALL log the error and still dismiss the dialog (user can retry on next app launch)

#### Scenario: Hunt start failure from DailyPlanBoard
- **WHEN** creating a pomodoro or opening the hunt window fails during hunt start
- **THEN** the system SHALL log the error and leave the UI in its current state without navigating away

## ADDED Requirements

### Requirement: Database migration completeness
All migration files in `src-tauri/migrations/` SHALL be registered in the `migrations()` function in `db.rs`. The migration for the `released` task status SHALL preserve all existing CHECK constraints, NOT NULL constraints, and foreign key definitions from the original schema.

#### Scenario: Migration 008 registered and executed
- **WHEN** the application starts for the first time or after an update
- **THEN** migration 008 SHALL run, adding 'released' to the tasks status CHECK constraint while preserving category CHECK, difficulty CHECK (with default 'simple'), and parent_task_id foreign key

#### Scenario: Setting task status to released
- **WHEN** user releases a monster via the UI
- **THEN** the task status SHALL be set to 'released' in the database, and the operation SHALL succeed without CHECK constraint violations

### Requirement: Transaction-protected multi-step database operations
Database operations that modify multiple related records SHALL be wrapped in a transaction to prevent partial updates.

#### Scenario: damageTask atomicity
- **WHEN** a monster takes damage (HP decrement + status check + potential kill cascade)
- **THEN** all database writes SHALL execute within a single transaction; if any step fails, all changes SHALL be rolled back

#### Scenario: damageTask kills monster with children
- **WHEN** damageTask reduces HP to 0 on a parent task with child tasks
- **THEN** the parent status update and all child status updates SHALL occur atomically within one transaction

### Requirement: Tauri event listener lifecycle
The `useTauriEvent` hook SHALL use a ref-based handler pattern to prevent listener duplication caused by handler function reference changes across renders.

#### Scenario: Handler function changes between renders
- **WHEN** the component re-renders and the handler function reference changes
- **THEN** the event listener SHALL NOT be re-registered; instead, the existing listener SHALL invoke the latest handler via ref

#### Scenario: Component unmount cleanup
- **WHEN** a component using useTauriEvent unmounts
- **THEN** the event listener SHALL be properly removed to prevent memory leaks
