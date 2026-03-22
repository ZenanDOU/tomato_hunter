## ADDED Requirements

### Requirement: Hunter Profile tab in village
The system SHALL display the "猎人档案" tab in the village layout as the fifth tab (previously sixth). The tab displays four sections: statistics overview, milestone list, monster bestiary collection, and battle history.

#### Scenario: Profile tab accessible from village
- **WHEN** user is in the village view
- **THEN** a "猎人档案" tab is available as the fifth tab alongside existing tabs (计划, 狩猟, 工坊, 农场)

#### Scenario: Profile tab icon
- **WHEN** the profile tab renders
- **THEN** it displays a scroll/badge icon consistent with the pixel art design system

### Requirement: Statistics overview section
The system SHALL display aggregated hunter statistics at the top of the profile tab. Statistics include: total completed pomodoros, total monsters killed, species discovered count (out of 15), active days count, longest daily streak.

#### Scenario: Statistics render from existing data
- **WHEN** user opens the hunter profile tab
- **THEN** the system queries existing tables (pomodoros, tasks) and displays: total completed pomodoros (COUNT from pomodoros WHERE result='completed'), total killed monsters (COUNT from tasks WHERE status='killed' AND parent_task_id IS NULL), discovered species (COUNT DISTINCT species_id from tasks WHERE status='killed' AND species_id IS NOT NULL), active days (COUNT DISTINCT date(started_at) from pomodoros WHERE result='completed'), longest streak (calculated from active days)

#### Scenario: Statistics update after hunt
- **WHEN** user completes a pomodoro and returns to village
- **THEN** the statistics reflect the latest data on next profile tab visit

### Requirement: Milestone list section
The system SHALL display all milestones in the profile tab, grouped into achieved (with date) and locked (with progress hint). Achieved milestones display their icon, name, description, and achievement date. Locked milestones display as dimmed with a brief hint of the requirement.

#### Scenario: Achieved milestones display
- **WHEN** user has achieved milestones
- **THEN** achieved milestones appear at the top with their icon, name, and achievement date, styled with the pixel card component

#### Scenario: Locked milestones display
- **WHEN** a milestone has not been achieved
- **THEN** it appears dimmed with a progress hint (e.g., "击杀 10 只怪物 (当前: 7/10)")

#### Scenario: No milestones achieved
- **WHEN** user is brand new with no history
- **THEN** all milestones appear locked with progress showing 0, and a brief welcome message encourages the first hunt

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

### Requirement: Battle history section in hunter profile
The system SHALL display a「战斗日志」collapsible section in the hunter profile tab, positioned after the monster bestiary collection. The battle history SHALL show all killed tasks sorted by completion date descending, with expandable details for each entry.

#### Scenario: View battle history
- **WHEN** user opens the hunter profile and scrolls to the 战斗日志 section
- **THEN** the system displays a list of killed tasks showing monster name, task name, and completion date, sorted by most recent first

#### Scenario: Expand battle history entry
- **WHEN** user clicks on a battle history entry
- **THEN** the system shows: monster description, estimated vs actual pomodoros, and individual pomodoro records with completion notes, strategy notes, reflection text, and timestamps

#### Scenario: Empty battle history
- **WHEN** user has no killed tasks
- **THEN** the 战斗日志 section shows "还没有战斗记录，去狩猎吧！"

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
