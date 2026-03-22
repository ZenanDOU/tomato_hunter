## MODIFIED Requirements

### Requirement: Database migration completeness
数据库 schema 由单一迁移文件 `src-tauri/migrations/001_initial.sql` 定义，包含所有表的最终态 CREATE TABLE 语句、索引和种子数据。`db.rs` 的 `migrations()` 函数 SHALL 只注册这一个迁移。开发阶段的 schema 变更 SHALL 直接修改 `001_initial.sql` 并删除本地数据库重建，无需新增迁移文件。

#### Scenario: Fresh database initialization
- **WHEN** 应用首次启动且本地无数据库文件
- **THEN** `001_initial.sql` SHALL 创建全部 13 张表（tasks, pomodoros, materials, player_materials, loot_drops, equipment, player_equipment, loadout, daily_plans, planned_task_entries, settings, tomato_farm, milestones）并插入所有种子数据

#### Scenario: Schema matches final state
- **WHEN** `001_initial.sql` 执行完成
- **THEN** tasks 表的 status CHECK 约束 SHALL 包含 'released'，tasks 表 SHALL 包含 body_part 和 species_id 列，pomodoros 表 SHALL 包含 strategy_note 列，tomato_farm 表 SHALL 包含 is_watered 和 watering_cooldown_end 列，daily_plans 表 SHALL 包含 removed_completed 列

#### Scenario: Development schema change
- **WHEN** 开发者需要修改数据库 schema
- **THEN** 开发者 SHALL 直接编辑 `001_initial.sql`，删除本地 `%APPDATA%/com.tomato-hunter.app/tomato_hunter.db*` 文件，重启应用重建数据库
