## Why

当前 DailyPlanBoard 显示 `allocated/budget` 和 `completed/planned` 两组数字，但用户难以快速判断"我今天还能做多少"和"剩余任务还需要多少"之间的关系。当剩余任务需求远超剩余精力时，缺乏主动提醒和便捷的任务调整手段，导致用户容易过度规划或在傍晚才发现计划不可行。

## What Changes

- 在 DailyPlanBoard 头部重新设计番茄量信息区，清晰呈现四个核心指标：
  - **t1 总预算**：今天计划做几个番茄（用户设定）
  - **t2 已完成**：今天实际完成了几个番茄
  - **t3 剩余精力**：t1 - t2，还能做多少
  - **t4 剩余任务量**：待战 + 进行中任务的未完成番茄数之和
- 当 t4 > t3 时显示"精力不足"警告，提示用户减少任务
- 提供从每日计划快速移除任务（回到就绪怪物列表）的交互优化

## Capabilities

### New Capabilities

- `daily-capacity-indicator`: 番茄精力指标展示与过载检测逻辑，包含四指标计算、对比可视化、过载警告与任务移除建议

### Modified Capabilities

- `daily-hunt-progress`: 进度条区域需要适配新的四指标信息架构，替换原有的 completed/planned 简单展示
- `village-task-management`: over-budget 警告逻辑从"分配超预算"扩展为"剩余任务量 vs 剩余精力"的动态对比

## Impact

- **前端组件**: `DailyPlanBoard.tsx` 头部信息区重构，`PlanEntry` 可能需要增加快速移除按钮的视觉优化
- **Store**: `planStore.ts` 新增 t3/t4 计算的 getter 方法
- **无后端变更**: 所有数据已存在于 `daily_plans` 和 `planned_task_entries` 表中，无需 schema 变更
