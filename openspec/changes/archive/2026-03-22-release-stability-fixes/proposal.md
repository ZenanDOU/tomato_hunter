## Why

项目已功能完整，但代码审查发现多处影响稳定性的问题：未注册的数据库迁移、Rust 后端 mutex panic 风险、前端关键流程缺少错误处理。这些问题会导致数据损坏、后端崩溃和用户操作无反馈的静默失败，必须在首次发布前修复。

## What Changes

- 注册 migration 008 并修复其 schema 退化（恢复丢失的 CHECK 约束和外键）
- 将 Rust tick loop 中的 `.unwrap()` 替换为安全的错误处理，防止 mutex 中毒级联 panic
- 为 `damageTask()` 多步 DB 操作添加事务保护
- 为 `resume()` 添加 `isProcessing` 防重复提交守卫
- 修复 `ReviewPhase` 的 `submitting` 状态永不恢复问题
- 为 `PrepPhase`、`RecoveryDialog`、`DailyPlanBoard` 等关键 UI 流程补充错误处理
- 修复 `useTauriEvent` hook 的 handler 依赖问题，防止监听器重复注册
- 修复 `window_cmd.rs` 中窗口关闭事件静默失败

## Capabilities

### New Capabilities

_(无新功能)_

### Modified Capabilities

- `pomodoro-timer`: timer tick loop 的 mutex 安全性变更；`resume` 添加防重复守卫；消耗品命令的静默失败改为返回结果
- `infrastructure`: migration 008 注册 + schema 修复；damageTask 事务化
- `hunt-journal`: ReviewPhase submitting 状态修复；useReviewFlow 错误处理增强

## Impact

- **Rust 后端** (`src-tauri/src/`): `timer_cmd.rs` tick loop 改写、`db.rs` migration 注册、`window_cmd.rs` 事件处理
- **前端 stores** (`src/stores/`): `timerStore.ts`、`taskStore.ts` 错误处理和并发保护
- **前端组件** (`src/components/`): `PrepPhase`、`ReviewPhase`、`RecoveryDialog`、`DailyPlanBoard`、`FocusPhase` 错误处理
- **前端 hooks** (`src/hooks/`): `useTauriEvent.ts` 依赖修复、`useReviewFlow.ts` 状态管理
- **数据库**: migration 008 schema 修正（对已有数据库需重新运行迁移）
