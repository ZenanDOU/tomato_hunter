## ADDED Requirements

### Requirement: Interactive preparation phase
The system SHALL replace the passive 2-minute prep countdown with an interactive confirmation flow: show monster+task info, prompt strategy thinking, and require user confirmation before starting focus.

#### Scenario: Prep phase shows monster and task info
- **WHEN** user enters the prep phase
- **THEN** the window displays: monster emoji/sprite, monster name, real task name, task description, HP, and attribute tags

#### Scenario: Strategy prompt
- **WHEN** user is in the prep phase
- **THEN** the system displays a prompt: "准备从哪里开始入手？" with an optional text area for recording strategy notes

#### Scenario: User confirms to start battle
- **WHEN** user clicks "开始战斗" in the prep phase
- **THEN** the system saves any strategy note to the pomodoro record and advances to the focus phase

#### Scenario: Strategy note persisted
- **WHEN** user writes a strategy note and starts the battle
- **THEN** the note is saved in the pomodoro's `strategy_note` field and visible in the journal/sanctuary entry

### Requirement: Larger prep phase window
The system SHALL use a larger window size during the prep phase to accommodate the interactive content, then resize to the compact hunt overlay when entering focus.

#### Scenario: Window resize on phase transition
- **WHEN** user clicks "开始战斗" and transitions from prep to focus
- **THEN** the hunt window resizes from the larger prep size to the compact focus size
