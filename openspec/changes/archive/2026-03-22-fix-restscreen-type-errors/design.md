## Context

`RestScreen.tsx` 在休息阶段显示"下一个番茄"信息时，直接从 `PlannedTaskEntry` 读取 `status`、`monster_name`、`name`。但 `PlannedTaskEntry` 只包含计划字段（`id, task_id, planned/completed_pomodoros, sort_order`），这些字段属于 `Task` 类型。

项目中已有成熟的关联模式：`planStore.ts` 的 `getHuntingEntries()` 等方法通过 `taskStore` 查找关联 task。

## Goals / Non-Goals

**Goals:**
- 修复 5 处类型错误，恢复 `npm run build`
- 复用项目已有的 task 关联模式

**Non-Goals:**
- 不扩展 `PlannedTaskEntry` 类型（JOIN 查询会增加复杂度）
- 不重构其他组件

## Decisions

**通过 taskStore 运行时关联，而非扩展类型/查询**

在 `RestScreen` 中引入 `useTaskStore` 获取 tasks 列表，用 `task_id` 查找对应 task 来获取 `status`、`monster_name`、`name`。

理由：
- 与 `DailyPlanBoard.tsx`、`planStore.ts` 模式一致
- 零数据层变更，最小改动范围
- `taskStore.tasks` 在狩猎流程中已保持加载状态

## Risks / Trade-offs

- [风险极低] `taskStore.tasks` 在 hunt window 中可能未同步 → 已有 `fetchTasks()` 调用保证数据新鲜
