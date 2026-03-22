## Why

番茄猎人在狩猎阶段（FocusPhase）每秒触发 timer tick 事件更新 Zustand store，导致所有订阅组件全量重渲染。村庄界面的 HuntList、Workshop、DailyPlanBoard 中的列表项组件也缺少 memoization，父组件任何状态变化都会导致所有子项重新渲染。在低端设备或长列表场景下，这会造成可感知的卡顿和电池消耗。

## What Changes

- 对 FocusPhase、PrepPhase、ReviewPhase 等 hunt 组件应用 React.memo + useCallback 优化
- 对 HuntItem、SplitMonsterCard、BodyPartItem、PlanEntry、EquipmentCard 等列表项组件应用 React.memo
- 将 timerStore 的高频更新字段（remaining_seconds）与低频字段（task_id、phase）分离，使用 Zustand selector 精细订阅
- 对组件内的 species lookup、attribute parsing 等计算应用 useMemo

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
_(none — 纯内部优化，不改变任何用户可见行为或 spec 级需求)_

## Impact

- **前端组件**: FocusPhase、PrepPhase、ReviewPhase、HuntItem、SplitMonsterCard、PlanEntry、EquipmentCard、ConsumableCard
- **Store**: timerStore 内部状态拆分
- **风险**: memo 比较函数如果遗漏可变引用，可能导致 UI 不更新（需要仔细测试）
