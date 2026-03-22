## MODIFIED Requirements

### Requirement: Initial milestone set
The system SHALL include the following milestones at launch. Species-based milestones (species-5, species-10, species-15) SHALL count distinct `species_id` values from killed tasks (not `monster_variant`).

| ID | Name | Condition |
|---|---|---|
| first-kill | 初猎达成 | 击杀 1 只怪物 |
| pomodoro-10 | 番茄收集者 | 完成 10 个番茄钟 |
| first-craft | 入门铁匠 | 锻造第 1 件装备 |
| species-5 | 生态观察者 | 发现 5 种怪物 (COUNT DISTINCT species_id) |
| kill-10 | 熟练猎手 | 击杀 10 只怪物 |
| perfect-day | 完美狩猎日 | 单日完成全部每日计划 |
| streak-7 | 不懈追踪者 | 连续 7 天有击杀 |
| pomodoro-50 | 半百番茄 | 完成 50 个番茄钟 |
| species-10 | 野外博物学家 | 发现 10 种怪物 (COUNT DISTINCT species_id) |
| all-equipment | 大师铁匠 | 锻造全部可锻造装备 |
| species-15 | 生态学家 | 发现全部 15 种怪物 (COUNT DISTINCT species_id) |
| pomodoro-100 | 百战猎人 | 完成 100 个番茄钟 |
| kill-50 | 传奇猎手 | 击杀 50 只怪物 |

#### Scenario: Milestone conditions verified
- **WHEN** the "kill-10" milestone check runs with 10 killed tasks in the database
- **THEN** the check returns `{ achieved: true }`

#### Scenario: Milestone progress for partial completion
- **WHEN** the "pomodoro-50" milestone check runs with 32 completed pomodoros
- **THEN** the check returns `{ achieved: false, progress: { current: 32, target: 50 } }`

#### Scenario: Species milestone uses species_id
- **WHEN** the "species-5" milestone check runs and there are 5 distinct species_id values in killed tasks
- **THEN** the check returns `{ achieved: true }` regardless of how many distinct monster_variant values exist
