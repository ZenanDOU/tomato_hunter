## Why

拆分怪物时按钮卡在"拆分中..."。根本原因：migration 011 (`011_add_species_id.sql`) 未成功执行，数据库中不存在 `species_id` 列，而 `splitTask` 的 INSERT 语句显式引用了该列，导致 SQL 报错 `table tasks has no column named species_id`。加上 `handleSubmit` 没有 try-catch，异常导致 `submitting` 永远不重置、`onClose()` 不执行。

## What Changes

- 从 `splitTask` INSERT 中移除显式的 `species_id` 列引用，让数据库用默认值 NULL（无论 migration 是否执行都能工作）
- 在 `MonsterSplitForm.handleSubmit` 中添加 try-catch-finally，防止未来任何异常导致 UI 卡死

## Capabilities

### New Capabilities

(无新增能力)

### Modified Capabilities

- `village-task-management`: 怪物拆分操作需要兼容 species_id 列可能不存在的情况，并正确处理错误

## Impact

- `src/stores/taskStore.ts` — splitTask INSERT 语句移除 species_id
- `src/components/common/MonsterSplitForm.tsx` — handleSubmit 添加错误处理
