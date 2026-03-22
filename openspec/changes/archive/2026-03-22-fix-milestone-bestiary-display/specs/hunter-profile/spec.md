## MODIFIED Requirements

### Requirement: Statistics overview section
The system SHALL display aggregated hunter statistics at the top of the profile tab. Statistics include: total completed pomodoros, total monsters killed, species discovered count (out of 15), active days count, longest daily streak.

#### Scenario: Statistics render from existing data
- **WHEN** user opens the hunter profile tab
- **THEN** the system queries existing tables (pomodoros, tasks) and displays: total completed pomodoros (COUNT from pomodoros WHERE result='completed'), total killed monsters (COUNT from tasks WHERE status='killed' AND parent_task_id IS NULL), discovered species (COUNT DISTINCT species_id from tasks WHERE status='killed' AND species_id IS NOT NULL), active days (COUNT DISTINCT date(started_at) from pomodoros WHERE result='completed'), longest streak (calculated from active days)

#### Scenario: Statistics update after hunt
- **WHEN** user completes a pomodoro and returns to village
- **THEN** the statistics reflect the latest data on next profile tab visit

### Requirement: Monster bestiary collection section
The system SHALL display all 15 monster species organized by family (5 families × 3 tiers). Each species shows discovered/undiscovered state. Discovered species show the species sprite, name, first encounter date, and kill count. Undiscovered species show a shadowed silhouette with "???" text. Discovery state SHALL be determined by matching the task's `species_id` column against BESTIARY species IDs.

#### Scenario: Discovered species display
- **WHEN** user has killed at least one monster with species_id="work-gear-bug"
- **THEN** the bestiary shows 齿轮虫 with its sprite/emoji, first kill date, and total kill count for that species

#### Scenario: Undiscovered species display
- **WHEN** user has never killed a monster with species_id="creative-ink-butterfly"
- **THEN** the bestiary shows a dark silhouette placeholder with "???" and the tier label

#### Scenario: Collection progress bar
- **WHEN** the bestiary section renders
- **THEN** a PixelProgressBar shows "N / 15 已发现" with tomato red fill

#### Scenario: Species detail expansion
- **WHEN** user clicks on a discovered species in the bestiary
- **THEN** an expanded view shows: species description, traits, habitat, family info, and a chronological list of all kills (task name, date, pomodoros used)

### Requirement: New species discovery event
The system SHALL trigger a "新物种发现！" notification when a monster kill results in a species being recorded in the bestiary for the first time. The notification appears during the settlement phase after loot display. Discovery check SHALL use the task's `species_id` column.

#### Scenario: First kill of a species triggers discovery
- **WHEN** user kills a monster whose species_id has never appeared in a killed task before
- **THEN** a "新物种发现！" card appears showing the species sprite, name, family, and habitat with a brief pixel animation

#### Scenario: Repeat kill does not trigger discovery
- **WHEN** user kills a monster whose species was already discovered
- **THEN** no discovery notification appears

#### Scenario: Discovery notification timing
- **WHEN** a new species discovery occurs during settlement
- **THEN** the discovery card appears after the loot display and before any milestone notifications
