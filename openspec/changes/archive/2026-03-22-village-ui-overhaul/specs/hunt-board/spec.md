## ADDED Requirements

### Requirement: Unified hunt board with status sections
The system SHALL provide a unified「狩猎看板」component that replaces the separate Inbox and HuntList tabs. The hunt board SHALL display tasks in collapsible sections grouped by status.

#### Scenario: Hunt board displays three sections
- **WHEN** user navigates to the 狩猎 tab
- **THEN** the system displays three sections in order: a quick-capture form at the top, 「📥 未鉴定」section for unidentified tasks, and「⚔️ 就绪」section for ready/hunting tasks

#### Scenario: Section headers show count badges
- **WHEN** there are 3 unidentified tasks and 5 ready/hunting tasks
- **THEN** the section headers display "📥 未鉴定 (3)" and "⚔️ 就绪 (5)"

#### Scenario: Empty section collapses by default
- **WHEN** a section has 0 tasks
- **THEN** the section SHALL be collapsed with a dimmed header showing count 0

#### Scenario: Section with tasks expands by default
- **WHEN** a section has 1 or more tasks
- **THEN** the section SHALL be expanded by default

### Requirement: Quick-capture form in hunt board
The system SHALL provide the task creation form at the top of the hunt board, preserving all existing Inbox creation functionality (name input, category, difficulty, estimated pomodoros).

#### Scenario: Create task from hunt board
- **WHEN** user fills in task details and submits the form in the hunt board
- **THEN** the task appears in the 未鉴定 section immediately below

#### Scenario: Identify task within hunt board
- **WHEN** user clicks 生成怪物 on an unidentified task in the hunt board
- **THEN** the task transitions from the 未鉴定 section to the 就绪 section after monster generation completes

### Requirement: Ready section preserves HuntList features
The 就绪 section SHALL preserve all existing HuntList functionality: monster sprite display, HP bar, expandable details (description, species, habitat, tier, traits), split monster button, release button, batch release mode, and start hunt button.

#### Scenario: Start hunt from ready section
- **WHEN** user clicks the attack button on a ready task in the 就绪 section
- **THEN** the system starts the pomodoro timer and opens the hunt overlay window, identical to current HuntList behavior

#### Scenario: Split monster from ready section
- **WHEN** user clicks split on a monster with HP > 4 and full health in the 就绪 section
- **THEN** the split flow proceeds identically to current HuntList behavior
