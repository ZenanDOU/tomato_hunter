## MODIFIED Requirements

### Requirement: Species discovery state from task history
The system SHALL determine species discovery state by querying tasks with status='killed' using the `species_id` column. A species is "discovered" if at least one task with matching `species_id` has been killed. First discovery date is the earliest `completed_at` among those tasks. The `species_id` column SHALL store the BESTIARY species ID (e.g., "work-gear-bug"), set during task identification via `selectSpecies()`.

#### Scenario: Species discovered via killed task
- **WHEN** a task with species_id="work-gear-bug" and status="killed" exists
- **THEN** the species "齿轮虫" is marked as discovered in the bestiary

#### Scenario: Species not discovered if only hunting
- **WHEN** a task with species_id="work-gear-bug" exists but status is "hunting" (not killed)
- **THEN** the species remains undiscovered in the bestiary

#### Scenario: Kill count aggregation
- **WHEN** multiple killed tasks share species_id="work-gear-bug"
- **THEN** the bestiary shows the total count of killed tasks for that species

#### Scenario: Species ID set during identification
- **WHEN** a task is identified and discovery is confirmed
- **THEN** the task's `species_id` column is set to the BESTIARY species ID returned by `selectSpecies(category, taskName, difficulty)`

#### Scenario: Existing tasks backfill species_id
- **WHEN** the app starts and there exist killed tasks with species_id IS NULL
- **THEN** the system computes species_id from each task's category, name, and difficulty using `selectSpecies()` and updates the column
