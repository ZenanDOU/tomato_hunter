## 1. 编写合并后的 SQL

- [x] 1.1 编写 `001_initial.sql`：按最终态编写全部 13 张表的 CREATE TABLE（含所有列、约束、外键），包含 tasks 表的 released 状态、body_part、species_id 列，pomodoros 的 strategy_note 列，tomato_farm 的 is_watered/watering_cooldown_end 列，daily_plans 的 removed_completed 列
- [x] 1.2 在 `001_initial.sql` 中添加全部 CREATE INDEX 语句（6 个索引）
- [x] 1.3 在 `001_initial.sql` 中添加种子数据：11 个材料（含获救番茄）、14 个装备（最终命名版本）、默认 loadout、默认 settings、tomato_farm 初始行

## 2. 清理旧文件

- [x] 2.1 删除 `src-tauri/migrations/002_rescued_tomato.sql` 到 `013_add_removed_completed.sql`（12 个文件）
- [x] 2.2 简化 `src-tauri/src/db.rs`，只保留 1 个 migration 注册

## 3. 重建数据库

- [x] 3.1 删除本地数据库文件 `%APPDATA%/com.tomato-hunter.app/tomato_hunter.db*`
- [x] 3.2 启动应用验证数据库从零重建成功，确认 13 张表和种子数据正确
