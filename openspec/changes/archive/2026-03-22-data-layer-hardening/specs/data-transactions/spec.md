## ADDED Requirements

### Requirement: Transaction wrapper for multi-step database operations
The system SHALL provide a `withTransaction()` function in `src/lib/db.ts` that wraps a callback in SQLite `BEGIN`/`COMMIT`/`ROLLBACK`. All multi-step database operations that must succeed or fail atomically SHALL use this wrapper.

#### Scenario: Successful transaction commits
- **WHEN** a callback passed to `withTransaction()` completes without error
- **THEN** all database changes made within the callback SHALL be committed atomically

#### Scenario: Failed transaction rolls back
- **WHEN** a callback passed to `withTransaction()` throws an error
- **THEN** all database changes made within the callback SHALL be rolled back, and the error SHALL be re-thrown to the caller

#### Scenario: Rollback failure does not swallow original error
- **WHEN** the ROLLBACK itself fails after a callback error
- **THEN** the original callback error SHALL be re-thrown (not replaced by the rollback error), and the rollback failure SHALL be logged

### Requirement: backfillSpeciesIds runs only once per app lifecycle
The `backfillSpeciesIds` function SHALL execute at most once per application lifecycle. Subsequent calls to `getDb()` SHALL NOT re-run the backfill even if the database connection is re-established.

#### Scenario: First getDb call runs backfill
- **WHEN** `getDb()` is called for the first time in the app lifecycle
- **THEN** `backfillSpeciesIds` SHALL execute if there are tasks with NULL species_id

#### Scenario: Subsequent getDb calls skip backfill
- **WHEN** `getDb()` is called after the first successful call
- **THEN** `backfillSpeciesIds` SHALL NOT execute again
