## Why

随着功能迭代（装备制作、农场经济、日计划、里程碑），数据层的多步操作缺乏事务保护，前端 Store 之间缓存数据不同步，关键路径存在竞态条件。这些问题已经产生可观测的 bug：幽灵任务残留在日计划、装备材料可能出现负数、狩猎完成流程中途失败导致状态不一致。项目即将发布，数据可靠性是用户信任的基础。

## What Changes

- 在前端 `db.ts` 中封装 SQLite 事务支持（`BEGIN/COMMIT/ROLLBACK`），所有多步数据库操作改为事务执行
- 修复 `taskStore` 中 `releaseTask`、`batchReleaseTasks`、`killTask` 的非原子操作
- 修复 `inventoryStore` 中 `craftEquipment` 的双花竞态（check-then-execute 改为原子 SQL）
- 消除 `planStore.entries` 中冗余缓存的 task 字段，改为运行时从 `taskStore` 派生
- 引入 Store 同步机制：关键操作完成后统一刷新受影响的 Store，替代散落各处的手动 `fetchX()` 调用
- 补齐 `timerStore.daggerChoose()` 缺失的 `isProcessing` 防重入保护
- 修复 `farmStore` 易失状态（`isWatered`、`wateringCooldownEnd`）在重启后丢失的问题
- 优化 `db.ts` 中 `backfillSpeciesIds` 仅在首次运行，避免每次 `getDb()` 重复执行
- 减少狩猎完成流程中的冗余全量查询（5-7 次 → 最少化）

## Capabilities

### New Capabilities
- `data-transactions`: 前端事务层封装，为多步数据库操作提供 ACID 保证
- `store-sync`: Store 间数据同步协议，确保跨 Store 操作后数据一致性

### Modified Capabilities
- `village-task-management`: releaseTask / batchReleaseTasks / killTask 改为事务操作，消除部分失败导致的数据不一致
- `pomodoro-timer`: daggerChoose 增加 isProcessing 保护；狩猎完成流程减少冗余查询
- `growth-equipment`: craftEquipment 改为原子扣减，消除双花竞态
- `tomato-farm`: isWatered / wateringCooldownEnd 持久化到 SQLite，重启后恢复

## Impact

- **前端数据层**: `src/lib/db.ts`（事务API）、所有 `src/stores/*.ts`（同步机制）
- **数据库 schema**: 新增 migration 为 `tomato_farm` 表添加浇水状态字段
- **组件层**: `planStore` 消费方需适配新的数据派生方式（不再从 entries 读 task 字段）
- **性能**: 减少全量查询次数，事务批量执行比多次独立请求更快
- **无 API 变更**: Rust 后端 Tauri commands 不受影响
