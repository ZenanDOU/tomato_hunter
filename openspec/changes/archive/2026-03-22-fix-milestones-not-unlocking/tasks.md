## 1. 前端修复

- [x] 1.1 在 `src/lib/db.ts` 的 `backfillSpeciesIds()` 成功更新任务后，调用 `detectNewMilestones()` 触发里程碑重检测
- [x] 1.2 在 `src/stores/profileStore.ts` 的 `detectNewMilestones()` 中将 `console.error` 改为 `console.warn`，确保错误可见但不崩溃

## 2. 数据库修复

- [x] 2.1 修复 migration 008 的 checksum 不匹配问题（文件在执行后被修改，导致 tauri-plugin-sql 中止后续迁移）
- [x] 2.2 手动应用 migration 009-012 到数据库
- [x] 2.3 确认 milestones 表存在且包含回溯数据：first-kill, pomodoro-10, species-5 共 3 个里程碑
- [x] 2.4 确认 species_id 列已创建（backfill 将在下次正常启动应用时由前端 getDb() 触发）

## 3. 构建

- [x] 3.1 Tauri 后端已重新编译（含 migration 009-012），二进制位于 src-tauri/target/debug/tomato-hunter.exe
