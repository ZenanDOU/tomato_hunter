## Why

里程碑系统的代码和迁移已经写好（migration 009-012），但从未被编译进 Tauri 二进制文件。当前运行的应用只包含 migration 001-008，导致 `milestones` 表和 `species_id` 列都不存在。前端的 `detectNewMilestones()` 所有 SQL 查询都静默失败（被 try/catch 吞掉），返回空数组——用户完成了 11 个番茄钟、8 次击杀，但里程碑页面始终为空。

## What Changes

- 确保 Tauri 后端重新编译以包含 migration 009-012，使 `milestones` 表和 `species_id` 列在应用启动时被创建
- 修复 migration 009 中回溯物种里程碑使用 `monster_variant` 而非 `species_id` 的不一致问题（spec 明确要求使用 species_id）
- 在前端 `backfillSpeciesIds()` 完成后，触发一次里程碑检测以修正 migration 009 可能遗漏的物种里程碑
- 为 `detectNewMilestones()` 添加最小化的错误日志，避免关键失败被完全静默

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `milestone-system`: 增加对迁移未执行场景的防御性处理，确保 species backfill 后重新检测里程碑

## Impact

- `src-tauri/src/db.rs` — 需要重新编译（代码已就绪，只需 cargo build）
- `src-tauri/migrations/009_milestones.sql` — 回溯物种计算逻辑可能需要调整（但 migration 已运行过一次后不可修改，需在应用层修正）
- `src/lib/db.ts` — backfill 完成后增加里程碑重检测
- `src/stores/profileStore.ts` — detectNewMilestones 错误处理增强
