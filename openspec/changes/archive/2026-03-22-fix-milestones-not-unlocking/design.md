## Context

里程碑系统代码已完成，但 migration 009-012 从未执行。**真正的根因**是 `008_add_released_status.sql` 在迁移执行后（05:41）被修改（15:01），SHA-384 checksum 不再匹配数据库中存储的值。`tauri-plugin-sql` 检测到 checksum 不一致后，中止整个迁移流程，导致后续的 009-012 永远无法执行。

调查过程：
1. 初始假设"app 未重编译"→ 重编译后迁移仍未执行 → 排除
2. 比较所有 migration 文件的 SHA-384 与数据库存储值 → 发现 v8 MISMATCH
3. 修复 v8 checksum → 手动应用 009-012 → 成功

修复后数据库状态：
- 已应用迁移：001-012
- milestones 表：3 条回溯记录 (first-kill, pomodoro-10, species-5)
- species_id 列：已创建，等待前端 backfill

## Goals / Non-Goals

**Goals:**
- 确保 migration 009-012 在应用启动时正确执行
- 确保 backfill species_id 后，物种相关里程碑被重新检测
- 关键错误不再被静默吞掉

**Non-Goals:**
- 不修改已有的 13 个里程碑定义
- 不重构迁移系统本身
- 不添加里程碑管理 UI（如手动重置）

## Decisions

### 1. 不修改 migration 009 的回溯 SQL

migration 009 用 `monster_variant` 做回溯物种计算，而 spec 要求用 `species_id`。但：
- 已跑过 009 的用户无法重跑（migration 不可重复执行）
- `species_id` 列在 011 才创建，009 时不可能用
- 前端 backfill + detectNewMilestones 会修正遗漏

**决定**：保持 009 不变，在前端 backfill 后补检测。

### 2. backfillSpeciesIds 完成后触发 detectNewMilestones

当前 `getDb()` 在首次调用时跑 backfill，但没有触发里程碑检测。backfill 完成后应主动检测一次，确保物种里程碑在 backfill 后立刻被记录。

**实现**：在 `db.ts` 的 `backfillSpeciesIds()` 成功后，调用 `profileStore.detectNewMilestones()`。

### 3. detectNewMilestones 添加 console.warn 而非静默 catch

当前整个函数被 try/catch 包裹，任何错误（包括 milestones 表不存在）都被静默吞掉。改为 `console.warn` 输出，保持不崩溃但可调试。

## Risks / Trade-offs

- **backfill 与 milestone 检测的循环依赖**：`getDb()` → backfill → detectNewMilestones → `getDb()`。由于 `backfillDone` flag 在 backfill 前就设为 true，不会死循环。→ 无需额外处理。
- **首次启动时迁移失败**：如果 tauri-plugin-sql 迁移因 checksum 不匹配而失败，milestones 表仍不存在。→ 用户需清除旧数据或跳过 checksum 验证。这是现有迁移系统的已知限制，不在本次修复范围内。
