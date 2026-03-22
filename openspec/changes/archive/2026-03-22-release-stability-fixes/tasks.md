## 1. 数据库 Migration 修复

- [x] 1.1 修复 `src-tauri/migrations/008_add_released_status.sql`：恢复 difficulty CHECK 约束（默认 'simple'）、category CHECK 约束、parent_task_id 外键 `REFERENCES tasks(id) ON DELETE SET NULL`
- [x] 1.2 在 `src-tauri/src/db.rs` 的 `migrations()` 中注册 migration 008
- [x] 1.3 修改 `src/stores/taskStore.ts` 的 `releaseTask` 和 `batchReleaseTasks`：将 status 从 `'abandoned'` 改为 `'released'`

## 2. Rust 后端 Mutex 安全

- [x] 2.1 修改 `src-tauri/src/commands/timer_cmd.rs` tick loop：将 4 处 `.unwrap()` 替换为 `match` + `eprintln!` + `continue`，防止 mutex 中毒级联 panic
- [x] 2.2 修改 `src-tauri/src/commands/window_cmd.rs`：window close 事件 emit 失败时 log 并允许窗口正常关闭（移除 `let _ =`，改为 `if let Err(e) = ... { eprintln!; }` 并去掉 `api.prevent_close()` 的无条件调用）

## 3. 前端并发安全

- [x] 3.1 为 `src/stores/timerStore.ts` 的 `resume()` 添加 `isProcessing` 守卫，与 pause/startHunt/retreat 保持一致
- [x] 3.2 修改 `src/stores/taskStore.ts` 的 `damageTask()`：用 `BEGIN`/`COMMIT`/`ROLLBACK` 事务包裹多步 DB 操作
- [x] 3.3 修复 `src/hooks/useTauriEvent.ts`：用 `useRef` 缓存 handler，依赖数组只包含 `event`，防止监听器重复注册

## 4. 前端错误处理

- [x] 4.1 修复 `src/components/hunt/ReviewPhase.tsx`：submitting 状态在 catch 中重置为 false，允许用户重试
- [x] 4.2 为 `src/components/hunt/PrepPhase.tsx` 的策略笔记 DB 写入添加 try-catch（失败时 log，不阻塞进入 focus）
- [x] 4.3 为 `src/components/common/RecoveryDialog.tsx` 的 retreat 操作添加 try-catch 和 loading 状态
- [x] 4.4 为 `src/components/village/DailyPlanBoard.tsx` 的 `handleStartHunt` 添加 try-catch（失败时 log，留在当前页面）
- [x] 4.5 修复 `src/stores/settingsStore.ts` 的 `fetchSettings()`：添加 try-catch 防止启动时 DB 错误导致 unhandled rejection

## 5. 验证

- [x] 5.1 运行 `npx tsc --noEmit` 确认 TypeScript 无类型错误
- [x] 5.2 运行 `cargo check` 确认 Rust 编译无错误
- [x] 5.3 运行 `cargo test` 确认 timer 单元测试通过
