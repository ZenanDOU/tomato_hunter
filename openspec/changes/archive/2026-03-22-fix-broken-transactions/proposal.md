## Why

`withTransaction()` 在 tauri-plugin-sql 架构下 **100% 必然失败**。底层 `sqlx::Pool` 使用 FIFO 队列（`crossbeam::ArrayQueue`）管理空闲连接，每次 IPC `execute()` 调用从队列头部取连接、用完放回尾部。这意味着 `BEGIN`、`UPDATE`、`COMMIT` 三条语句必然落在不同连接上 — `COMMIT` 作用于一个从未执行过 `BEGIN` 的连接，导致 "cannot commit - no transaction is active" 错误。

当前直接影响：战斗胜利后"确认击杀"按钮完全失效，用户无法完成击杀流程。

## What Changes

- **BREAKING**: 移除 `withTransaction()` 函数及所有调用点
- 所有原来使用 `withTransaction` 的多步操作改为顺序 `db.execute()` 调用（依赖 SQLite 自动提交）
- 结算按钮增加防重入保护（loading 状态 + 按钮 disable）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `data-transactions`: 移除 `withTransaction()` 要求，改为顺序自动提交模式的数据一致性保证

## Impact

- `src/lib/db.ts` — 移除 `withTransaction` 导出
- `src/stores/taskStore.ts` — `killTask`、`releaseTask`、`batchReleaseTasks` 改为裸 execute
- `src/stores/planStore.ts` — `removeTaskFromPlan` 改为裸 execute
- `src/stores/inventoryStore.ts` — `craftEquipment` 改为裸 execute
- `src/components/settlement/Settlement.tsx` — 按钮防重入保护
