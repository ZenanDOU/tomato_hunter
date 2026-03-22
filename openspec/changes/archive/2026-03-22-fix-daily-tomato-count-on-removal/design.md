## Context

DailyPlanBoard 通过 `getTotalCompleted()` 显示今日已收获番茄数（t2）。该函数对 `planned_task_entries` 中剩余条目的 `completed_pomodoros_today` 求和。当用户移除一个已部分完成的任务时，`removeTaskFromPlan` 直接 DELETE 该条目，导致 t2 减少，进而 t3（剩余精力）虚增。

数据库 schema：
- `daily_plans(date PK, total_budget)`
- `planned_task_entries(id PK, plan_date FK, task_id FK, planned_pomodoros_today, completed_pomodoros_today, sort_order)`

## Goals / Non-Goals

**Goals:**
- 移除任务后，t2（已完成番茄数）不减少
- 最小化改动，不影响其他功能

**Non-Goals:**
- 不改变 farmStore 的番茄库存逻辑
- 不重构 DailyPlanBoard 的 UI 结构

## Decisions

### Decision 1: 在 `daily_plans` 表新增 `removed_completed` 字段

**选择**: 为 `daily_plans` 添加 `removed_completed INTEGER NOT NULL DEFAULT 0` 字段，在移除任务时将该条目的 `completed_pomodoros_today` 累加到此字段。

**替代方案 A**: 软删除（给 planned_task_entries 加 `removed` 标记而非 DELETE）
- 优点：保留完整记录
- 缺点：所有查询都需要加 `WHERE NOT removed`，改动面更大，且条目列表会残留幽灵数据

**替代方案 B**: 用 farmStore 的今日番茄数替代 t2 计算
- 优点：不需要改 DB
- 缺点：farmStore 的番茄可能来自非计划内的操作，且两套数据源的语义不同，容易产生新的不一致

**理由**: 新增字段方案改动最小且语义清晰——`removed_completed` 明确表示"从已移除条目中累积的已完成数"。

### Decision 2: 在 removeTaskFromPlan 中用事务保证原子性

移除操作需要先读取条目的 `completed_pomodoros_today`，再更新 `daily_plans.removed_completed`，最后删除条目。使用 `withTransaction` 确保原子性。

## Risks / Trade-offs

- **[风险] 已有数据不含 removed_completed 字段** → Migration 设默认值 0，不影响历史数据
- **[风险] 并发操作导致数据不一致** → SQLite 单写者模型 + 事务保证安全
- **[权衡] 新增 DB 字段 vs 纯前端方案** → DB 字段可跨会话持久化，关闭重开后数据仍然正确
