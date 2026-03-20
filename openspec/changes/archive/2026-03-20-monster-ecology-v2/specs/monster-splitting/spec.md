## MODIFIED Requirements

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
