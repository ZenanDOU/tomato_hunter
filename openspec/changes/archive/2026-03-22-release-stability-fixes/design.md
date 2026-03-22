## Context

番茄猎人已完成功能开发，正在准备首次发布。代码审查发现了 3 个阻塞级、5 个高风险、5 个中风险的稳定性问题，涵盖数据库 schema、Rust 后端并发安全、前端错误处理三个层面。

当前状态：
- **数据库**: Migration 008 文件存在但未注册；该迁移重建 tasks 表时丢失了约束
- **Rust 后端**: tick loop 中 4 处 `.unwrap()` 在 mutex 中毒时会级联 panic
- **前端**: 多个关键用户流程缺少错误处理，异步操作静默失败

## Goals / Non-Goals

**Goals:**
- 消除所有可导致后端崩溃的 panic 路径
- 确保数据库 schema 完整性（约束、外键、默认值）
- 为核心用户流程（开始狩猎、战斗、回顾、制作）添加错误处理
- 修复并发安全问题（isProcessing 守卫、事务保护）

**Non-Goals:**
- 不添加新功能或改变现有行为
- 不做全局错误处理重构（只修复关键路径）
- 不引入 toast/notification 等新 UI 组件（错误用 console.error + 简单 alert 处理即可）
- 不修改音频系统（其错误为低风险）

## Decisions

### D1: Migration 008 修复策略
**选择**: 修复 migration 008 内容并在 db.rs 中注册。

**方案对比**:
- A) 直接注册现有 008 → 会引入 schema 退化（丢失 CHECK、FK）
- B) 修复 008 内容后注册 → 保持 schema 完整性 ✅
- C) 删除 008，合并到新 migration → 增加复杂度，已有开发数据库可能已运行过部分

**修复内容**: 恢复 `category` CHECK 约束、`difficulty` CHECK 约束和 'simple' 默认值、`parent_task_id` 外键。同时 `releaseTask` 前端代码改为写入 `'released'` 而非 `'abandoned'`。

### D2: Mutex 安全策略
**选择**: 将 tick loop 中的 `.unwrap()` 替换为 `match` + 日志 + 跳过当前 tick。

**方案对比**:
- A) 全部改 `.map_err()?.` → tick loop 不在 Result 函数中，无法用 `?`
- B) `match lock { Ok(e) => ..., Err(_) => { log; continue } }` → 降级但不崩溃 ✅
- C) 使用 `parking_lot::Mutex`（无中毒）→ 引入新依赖，过度

Command handlers 已经使用 `.map_err(|e| e.to_string())?`，无需修改。

### D3: damageTask 事务策略
**选择**: 用 SQLite 的 `BEGIN/COMMIT/ROLLBACK` 包裹 damageTask 的多步操作。

tauri-plugin-sql 支持 `db.execute("BEGIN")` 等语句。将扣血、查状态、更新 killed、级联子任务包裹在一个事务中。失败时 ROLLBACK 后重新 fetchTasks 保证状态一致。

### D4: 前端错误处理策略
**选择**: 最小侵入 — 在关键路径添加 try-catch，失败时 console.error + 不阻塞 UI。

不引入 toast 系统或全局错误状态。对用户可感知的失败（如开始狩猎失败）保留 UI 在当前状态不跳转。对后台操作失败（如策略笔记保存）仅 log。

### D5: useTauriEvent 修复策略
**选择**: 在 hook 内部用 `useRef` 缓存最新 handler，依赖数组只包含 `event`。

这是 React hooks 的标准模式：避免因函数引用变化导致 useEffect 反复触发，同时保证回调总是调用最新逻辑。

## Risks / Trade-offs

- **[Risk] 已有开发数据库的 migration 版本不一致** → Migration 008 修改后，已运行旧版 008 的数据库需要手动重置。开发阶段可接受。
- **[Risk] Mutex 中毒后 tick loop 跳过可能导致 UI 停顿** → 这比 panic 崩溃好得多；且 mutex 中毒本身极为罕见（需要 command handler panic）。
- **[Trade-off] 错误处理不够精细** → 为了最小改动量，不添加用户可见的错误提示 UI。桌面端用户可查看日志。后续版本可添加 toast。
- **[Trade-off] damageTask 事务可能略增延迟** → SQLite 事务开销极小，可忽略。
