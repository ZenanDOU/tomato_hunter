## 1. 事务层基础设施

- [x] 1.1 在 `src/lib/db.ts` 中实现 `withTransaction()` 函数，支持 BEGIN/COMMIT/ROLLBACK，错误时回滚并重抛原始错误
- [x] 1.2 修复 `backfillSpeciesIds` 的 `backfillDone` 标志，确保在整个 app 生命周期内只执行一次（当前已正确，验证无需改动）
- [x] 1.3 导出 `withTransaction` 供所有 Store 使用

## 2. taskStore 事务化改造

- [x] 2.1 `releaseTask()` 改为使用 `withTransaction()`：将查询 children、更新 parent、更新 children、删除 plan entries 包裹在单个事务中
- [x] 2.2 `batchReleaseTasks()` 改为使用 `withTransaction()`：所有任务的释放操作包裹在单个事务中
- [x] 2.3 `killTask()` 改为使用 `withTransaction()`：任务状态更新和关联清理原子执行
- [x] 2.4 移除 releaseTask/batchReleaseTasks/killTask 中散落的 `fetchTasks()` 调用（将由 storeSync 统一处理）

## 3. inventoryStore 原子化改造

- [x] 3.1 `craftEquipment()` 材料扣减改为原子 SQL：`UPDATE player_materials SET quantity = quantity - $1 WHERE material_id = $2 AND quantity >= $1`，检查 affected rows 判断是否成功
- [x] 3.2 `craftEquipment()` 整体包裹在 `withTransaction()` 中，任一材料扣减失败则全部回滚
- [x] 3.3 移除 craftEquipment 中基于内存状态的 check-then-execute 模式（改为依赖 SQL WHERE 条件）

## 4. planStore 数据派生重构

- [x] 4.1 修改 `PlannedTaskEntry` 类型定义：移除 task-derived 字段（name, monster_name, category, status, current_hp, total_hp, actual_pomodoros），只保留 entry 元数据（id, task_id, planned_pomodoros_today, completed_pomodoros_today, sort_order）
- [x] 4.2 修改 `fetchTodayPlan()` 的 SQL：去掉 JOIN tasks，只查 planned_task_entries 表
- [x] 4.3 修改 `getHuntingEntries()`、`getReadyEntries()`、`getKilledEntries()`：通过 task_id 从 taskStore.tasks 中查找 status 进行过滤
- [x] 4.4 修改 `getRemainingTaskDemand()`：同样从 taskStore 获取 status
- [x] 4.5 更新 `DailyPlanBoard` 组件：在渲染 entry 时从 taskStore 查找对应 task 数据进行显示

## 5. Store 同步协议

- [x] 5.1 创建 `src/lib/storeSync.ts`，实现 `syncAfterHuntComplete()`、`syncAfterTaskRelease()`、`syncAfterCraft()`、`syncAfterFarmUpdate()` 四个函数
- [x] 5.2 `syncAfterHuntComplete()` 中并行调用 `taskStore.fetchTasks()`、`planStore.fetchTodayPlan()`、`inventoryStore.fetchAll()`
- [x] 5.3 替换 `App.tsx` 中 `hunt_completed` 事件处理器里散落的多个 fetch 调用为 `syncAfterHuntComplete()`
- [x] 5.4 替换 `useReviewFlow` 和 Settlement 中散落的 fetch 调用为对应的 sync 函数
- [x] 5.5 替换 taskStore 中 releaseTask/batchReleaseTasks/killTask 末尾的刷新调用为 `syncAfterTaskRelease()`

## 6. timerStore isProcessing 补齐

- [x] 6.1 为 `daggerChoose()` 添加 `isProcessing` 守卫，与 pause/resume/advance 等操作保持一致

## 7. farmStore 浇水状态持久化

- [x] 7.1 创建 migration `012_persist_watering_state.sql`：为 `tomato_farm` 表添加 `is_watered INTEGER DEFAULT 0` 和 `watering_cooldown_end TEXT` 列
- [x] 7.2 修改 `farmStore.water()`：将 is_watered 和 watering_cooldown_end 写入数据库
- [x] 7.3 修改 `farmStore.consumeWatering()`：将 is_watered=false 写入数据库
- [x] 7.4 修改 `farmStore.fetchFarm()`：从数据库读取 is_watered 和 watering_cooldown_end，恢复浇水状态
- [x] 7.5 添加启动时冷却过期检查：如果 watering_cooldown_end 已过期，自动清除 is_watered

## 8. 验证与测试

- [ ] 8.1 手动测试：释放带子任务的 parent task，确认事务回滚行为 (需要你手动测试)
- [ ] 8.2 手动测试：在材料刚好够的情况下快速双击制作按钮，确认不会双花 (需要你手动测试)
- [ ] 8.3 手动测试：完成一次完整狩猎流程，确认日计划和任务列表数据同步正确 (需要你手动测试)
- [ ] 8.4 手动测试：浇水后关闭 app 并重启，确认浇水状态恢复 (需要你手动测试)
- [ ] 8.5 手动测试：快速连续点击 dagger 选择按钮，确认 isProcessing 防重入生效 (需要你手动测试)
