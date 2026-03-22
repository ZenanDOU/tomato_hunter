## Why

从今日计划中移除一个已部分完成的任务时，DailyPlanBoard 的"已收获"番茄数会减少。原因是 `getTotalCompleted()` 仅对当前计划中剩余条目的 `completed_pomodoros_today` 求和，而 `removeTaskFromPlan` 直接 DELETE 了该条目，导致已完成的番茄从统计中消失。用户看到自己辛苦挣来的番茄凭空减少，体验很差。

## What Changes

- 移除任务时，将该条目的 `completed_pomodoros_today` 累加到 daily_plans 表的一个新字段 `removed_completed`，避免已完成番茄丢失
- `getTotalCompleted()` 计算时加上 `removed_completed` 偏移量
- 容量仪表盘（t2 已完成、t3 剩余精力）正确反映真实已完成数

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `daily-capacity-indicator`: t2（已完成）的计算需包含已移除条目的已完成番茄数

## Impact

- `src/stores/planStore.ts` — `removeTaskFromPlan` 和 `getTotalCompleted` 逻辑修改
- `src/lib/db.ts` 或 `src/lib/commands.ts` — 可能需要新增 DB 操作
- `src-tauri/` — 可能需要新增 migration 为 `daily_plans` 添加 `removed_completed` 字段
- `src/components/village/DailyPlanBoard.tsx` — 显示逻辑可能需微调
