## 1. Database Migration

- [x] 1.1 创建 migration 文件 `src-tauri/migrations/013_add_removed_completed.sql`，为 `daily_plans` 表添加 `removed_completed INTEGER NOT NULL DEFAULT 0` 字段

## 2. 前端数据层修改

- [x] 2.1 更新 `src/types/index.ts` 中 `DailyPlan` 类型，添加 `removed_completed` 字段
- [x] 2.2 更新 `src/stores/planStore.ts` 的 `fetchTodayPlan`，查询并存储 `removed_completed`
- [x] 2.3 修改 `removeTaskFromPlan`：在删除条目前，读取其 `completed_pomodoros_today`，若 > 0 则在事务中累加到 `daily_plans.removed_completed`，然后删除条目
- [x] 2.4 修改 `getTotalCompleted`：返回值加上 `plan.removed_completed`

## 3. 验证

- [ ] 3.1 手动测试：添加任务到计划 → 完成一个番茄 → 移除任务 → 确认"已收获"数不减少（需要在应用中验证）
- [ ] 3.2 手动测试：移除一个未开始的任务 → 确认"已收获"数不变（需要在应用中验证）
