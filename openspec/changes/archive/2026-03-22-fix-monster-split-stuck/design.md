## Context

`splitTask` 的 INSERT 语句包含 `species_id` 列，但 migration 011 未成功执行，该列不存在。SQLite 报错 `table tasks has no column named species_id`，异常从 `splitTask` 抛出，`handleSubmit` 无 try-catch 导致 UI 卡死。

同时 `backfillSpeciesIds`（db.ts）也因同样原因失败，但被 catch 吞掉了，不影响功能。

## Goals / Non-Goals

**Goals:**
- splitTask 在 species_id 列存在或不存在时都能正常工作
- handleSubmit 无论成功失败都能正确恢复 UI 状态

**Non-Goals:**
- 不修复 migration 011 为什么没执行（可能是数据库已存在于 migration 添加之前）
- 不修改 backfillSpeciesIds 的行为（它已经有 catch，不影响功能）

## Decisions

1. **从 INSERT 中移除 species_id**：`species_id` 列即使存在也是 `DEFAULT NULL`，不需要在 INSERT 时显式指定。移除后 INSERT 只用 11 个参数，兼容所有数据库状态。

2. **handleSubmit 加 try-catch-finally**：finally 中重置 submitting，catch 中设置本地 error state。这是防御性编程，防止未来任何异常导致同样的 UI 卡死。

## Risks / Trade-offs

- [移除 species_id 后子任务没有 species_id] → 风险极低，子任务通过 parent_task_id 关联到父任务，bestiary 查询基于 category/name/difficulty 而非 species_id
