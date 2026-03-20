## ADDED Requirements

### Requirement: Monster body part splitting
The system SHALL allow users to split large monsters into species-specific body parts instead of generic head/body/feet. Each species defines its own 3 parts with unique icons, labels, and task-mapping hints.

#### Scenario: Species-specific parts shown in split form
- **WHEN** user clicks "拆分怪物" on a 齿轮虫
- **THEN** the split form shows: 🔩 外壳 / ⚙️ 核心 / 🦿 肢节 (not generic head/body/feet)

#### Scenario: Species-specific parts for serpent type
- **WHEN** user splits a 钢铁蟒
- **THEN** the split form shows: 🐍 蛇头 / 🔗 蛇身 / 🎯 蛇尾

#### Scenario: Part hints guide task decomposition
- **WHEN** the split form is displayed
- **THEN** each part shows a hint like "任务中最先要解决的核心问题" to help the user map task work to monster parts

#### Scenario: Body part stored with species key
- **WHEN** a split is created
- **THEN** the body_part field stores the species-specific key (e.g., "shell", "core", "limbs") instead of generic "head"/"body"/"feet"

### Requirement: Parent task auto-completion
The system SHALL automatically mark a parent task as "killed" when all its sub-tasks are completed.

#### Scenario: All parts defeated
- **WHEN** the last sub-task of a split monster is killed
- **THEN** the parent task status automatically changes to "killed" with completed_at set

#### Scenario: Partial completion
- **WHEN** some but not all sub-tasks are killed
- **THEN** the parent task remains in its container status

### Requirement: Body part visual in hunt list
The system SHALL display split monsters with a body part diagram showing completion status.

#### Scenario: View split monster in hunt list
- **WHEN** a split monster is displayed in the hunt list
- **THEN** it shows the parent monster name with 3 body part indicators (🧠💪🦶), completed parts shown with checkmarks, pending parts clickable to start hunt
