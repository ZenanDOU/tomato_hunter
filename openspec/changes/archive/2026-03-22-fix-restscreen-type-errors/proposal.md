## Why

`RestScreen.tsx` 直接访问了 `PlannedTaskEntry` 类型上不存在的字段（`status`, `monster_name`, `name`），导致 `tsc` 编译失败，`npm run build` 无法完成。这是发布阻塞 bug。

## What Changes

- 修复 `RestScreen.tsx` 中对 `PlannedTaskEntry` 的错误字段访问
- 通过 `taskStore` 关联查找 `Task` 数据（与 `DailyPlanBoard.tsx`、`planStore.ts` 中的已有模式一致）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

（无 — 这是纯实现层面的类型修复，不涉及需求变更）

## Impact

- `src/components/settlement/RestScreen.tsx` — 5 处类型错误需修复
- 构建流水线恢复正常（`npm run build` 可通过）
