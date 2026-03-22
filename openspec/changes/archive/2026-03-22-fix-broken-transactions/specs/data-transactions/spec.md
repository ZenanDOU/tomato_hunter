## REMOVED Requirements

### Requirement: Transaction wrapper for multi-step database operations
**Reason**: `withTransaction()` 在 tauri-plugin-sql + sqlx::Pool 架构下不可能正确工作。每次 IPC `execute()` 调用从 FIFO 连接池获取不同连接，`BEGIN` 和 `COMMIT` 必然落在不同连接上，导致 100% 失败。
**Migration**: 所有调用点改为顺序 `db.execute()` 调用，依赖 SQLite 自动提交模式。

## ADDED Requirements

### Requirement: Multi-step database operations use sequential autocommit
多步数据库操作 SHALL 使用顺序的 `db.execute()` / `db.select()` 调用，每条语句自动提交。操作之间的数据一致性 SHALL 通过操作幂等性和后续的 store 重新同步来保证。

#### Scenario: killTask completes all steps sequentially
- **WHEN** `killTask` 被调用
- **THEN** 系统 SHALL 依次执行：UPDATE task status → SELECT task → SELECT siblings → 可能 UPDATE parent，每条语句独立自动提交

#### Scenario: Partial failure does not corrupt data
- **WHEN** 多步操作中某一步失败
- **THEN** 已完成的步骤 SHALL 保持已提交状态，失败 SHALL 被捕获并报告，后续的 store fetch 操作 SHALL 重新同步到当前数据库状态

### Requirement: Settlement kill confirmation has re-entry protection
结算界面的"确认击杀"按钮 SHALL 在点击后立即禁用，防止重复提交。

#### Scenario: Button disables on click
- **WHEN** 用户点击"确认击杀"按钮
- **THEN** 按钮 SHALL 立即进入 disabled 状态，显示加载指示

#### Scenario: Button remains disabled during async operation
- **WHEN** killTask 及后续异步操作正在执行
- **THEN** 按钮 SHALL 保持 disabled 状态直到操作完成或失败

#### Scenario: Pursuit button also has re-entry protection
- **WHEN** 用户点击"确认追击"按钮
- **THEN** 按钮 SHALL 同样立即进入 disabled 状态，防止重复提交
