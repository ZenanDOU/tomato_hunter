## Context

`tauri-plugin-sql` v2 的 `execute()`/`select()` 每次 IPC 调用通过 `sqlx::Pool` 获取连接。连接池使用 `crossbeam::ArrayQueue`（FIFO）管理空闲连接。这意味着通过多次 `execute()` 调用实现的手动 `BEGIN`/`COMMIT` 事务管理必然失败 — 三条语句落在不同连接上。

当前受影响的代码路径：
- `taskStore.killTask` — 击杀结算（**用户可见 bug**）
- `taskStore.releaseTask` — 任务放生
- `taskStore.batchReleaseTasks` — 批量放生
- `planStore.removeTaskFromPlan` — 从计划移除任务
- `inventoryStore.craftEquipment` — 制作装备

## Goals / Non-Goals

**Goals:**
- 修复击杀结算流程的致命 bug
- 移除所有不可能工作的 `withTransaction` 调用
- 确保多步操作在无显式事务下的数据一致性
- 结算按钮增加防重入保护

**Non-Goals:**
- 不引入 Rust 端事务命令（过度工程化，当前操作不需要严格原子性）
- 不重构连接池或替换 tauri-plugin-sql
- 不修改其他不涉及 `withTransaction` 的数据层代码

## Decisions

### 1. 改为顺序自动提交，不引入 Rust 端事务

**选择**：移除 `withTransaction`，每条语句独立自动提交。

**替代方案**：在 Rust 端写 Tauri command 使用 `pool.begin()` 获取事务句柄。

**理由**：所有使用 `withTransaction` 的操作本质上不需要严格原子性：
- `killTask`: UPDATE status → SELECT siblings → 可能 UPDATE parent。如果中间失败，最差情况是 parent 没有自动标记为 killed，不影响数据完整性。
- `releaseTask`: UPDATE status → DELETE plan entries。如果 DELETE 失败，plan entry 成为孤儿但不影响功能。
- `removeTaskFromPlan`: UPDATE removed count → DELETE entry。如果 UPDATE 失败，统计不准但可修复。
- `craftEquipment`: UPDATE quantity → INSERT record。如果 INSERT 失败，物品已扣但制作未记录，可通过 fetchAll 重新同步。

引入 Rust 端事务需要为每个操作写专门的 Tauri command，复杂度不值得。

### 2. Settlement 按钮防重入用 React state，不用 ref

**选择**：用 `useState` + `disabled` prop 实现按钮防重入。

**理由**：需要 UI 反馈（按钮变灰），state 变化自然触发重渲染。ref 虽然避免重渲染但用户看不到按钮状态变化。

### 3. 保留 `db.ts` 中的 `getDb()` 单例模式

**选择**：不修改 `getDb()` 的连接管理方式。

**理由**：单例模式本身没问题，问题出在 `withTransaction` 试图跨 IPC 调用维持事务状态。去掉 `withTransaction` 后，`getDb()` 正常工作。

## Risks / Trade-offs

- **[无原子性]** 多步操作中间失败可能导致部分完成状态 → 每个操作的步骤已分析过，部分完成不会导致数据损坏，且后续的 `fetchTasks`/`fetchAll` 会重新同步状态
- **[未来需求]** 如果将来确实需要事务 → 届时在 Rust 端实现专门的 Tauri command，不重新引入 JS 端 `withTransaction`
