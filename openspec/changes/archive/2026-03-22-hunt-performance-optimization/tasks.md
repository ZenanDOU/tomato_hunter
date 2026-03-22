## 1. timerStore selector 优化

- [x] 1.1 将 HuntApp 中的 timer 订阅改为 selector 模式：phase/task_name 等低频字段用独立 selector，remaining_seconds 仅在 countdown 显示组件中订阅
- [x] 1.2 将 FocusPhase、PrepPhase、ReviewPhase 中的 useTimerStore 调用改为精细 selector，只订阅各自需要的字段

## 2. Hunt 阶段组件 memo 优化

- [x] 2.1 FocusPhase：用 React.memo 包裹，handlePause / handleRetreat 用 useCallback
- [x] 2.2 PrepPhase：用 React.memo 包裹，handleStartBattle / handleSkip 用 useCallback
- [x] 2.3 ReviewPhase：用 React.memo 包裹，handleSubmit 用 useCallback

## 3. 村庄列表组件 memo 优化

- [x] 3.1 HuntItem：用 React.memo 包裹，内部 species/variant lookup 用 useMemo，handleStartHunt 用 useCallback
- [x] 3.2 SplitMonsterCard：用 React.memo 包裹，species/attributes lookup 用 useMemo
- [x] 3.3 BodyPartItem：用 React.memo 包裹，handleStartHunt 用 useCallback
- [x] 3.4 HuntList 中传给子组件的 onRelease/onSplit/onToggleSelect 用 useCallback 稳定引用

## 4. DailyPlanBoard 与 Workshop 优化

- [x] 4.1 PlanEntry（DailyPlanBoard 内的列表项）：用 React.memo 包裹
- [x] 4.2 DailyPlanBoard 中传给 PlanEntry 的 handler 用 useCallback
- [x] 4.3 Workshop 的 EquipmentCard / ConsumableCard：用 React.memo 包裹，recipe 计算用 useMemo

## 5. Hunt 窗口拖拽修复

- [x] 5.1 给 PrepPhase、ReviewPhase、RestScreen、Settlement、DaggerChoicePhase 的容器 div 添加 onMouseDown 拖拽（与 FocusPhase 一致）

## 6. 验证

- [x] 6.1 构建通过，类型检查无误
- [ ] 6.2 手动验证：所有 hunt 阶段窗口可拖拽移动
- [ ] 6.3 手动验证：狩猎阶段计时器正常计时，暂停/撤退/完成流程不受影响
- [ ] 6.4 手动验证：村庄列表的展开/折叠、批量选择、释放等交互正常
