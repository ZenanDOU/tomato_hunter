## ADDED Requirements

### Requirement: Killed monsters enter journal
The system SHALL record every killed monster in the hunt journal (狩猎图鉴) with its monster info, task details, and all associated pomodoro records.

#### Scenario: Monster enters journal on kill
- **WHEN** a monster's HP reaches 0
- **THEN** the task appears in the journal with monster name, description, category, difficulty, and completion timestamp

#### Scenario: View journal list
- **WHEN** user navigates to the journal tab
- **THEN** the system displays all killed monsters sorted by completion date descending, showing monster name, task name, actual vs estimated pomodoro count, and date

### Requirement: Journal entry shows hunt history
The system SHALL display detailed hunt history for each journal entry, including every pomodoro session's completion notes and reflections.

#### Scenario: View journal entry detail
- **WHEN** user clicks a journal entry
- **THEN** the system shows: monster info, estimated vs actual pomodoro comparison, and a chronological list of all pomodoro sessions with their completion notes, reflection types, and reflection texts

### Requirement: Estimated vs actual efficiency insight
The system SHALL display the comparison between estimated and actual pomodoro counts for each killed monster, providing implicit efficiency feedback.

#### Scenario: Task took more pomodoros than estimated
- **WHEN** a task estimated 3 pomodoros but actually took 5
- **THEN** the journal entry displays "预估: 3 / 实际: 5" allowing the user to recognize estimation patterns

#### Scenario: Task completed within estimate
- **WHEN** a task estimated 4 pomodoros and took 3
- **THEN** the journal entry displays "预估: 4 / 实际: 3"

### Requirement: Loadout snapshot in journal
The system SHALL record the equipment loadout used for each pomodoro session, visible in the journal entry detail.

#### Scenario: View loadout for past hunt
- **WHEN** user views a journal entry's pomodoro detail
- **THEN** each pomodoro record shows the weapon and armor that were equipped during that session
