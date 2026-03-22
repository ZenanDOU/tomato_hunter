## ADDED Requirements

### Requirement: 所有 hooks 在条件返回之前调用
组件中所有 React hooks（useState, useEffect, useMemo, useCallback 等）必须在任何条件返回语句之前调用。

#### Scenario: DailyPlanBoard plan 为 null 时不崩溃
- **WHEN** planStore 尚未加载完成，plan 为 null
- **THEN** DailyPlanBoard 正常渲染加载提示，不抛出 hooks 顺序错误

#### Scenario: DailyPlanBoard plan 加载完成后正常渲染
- **WHEN** plan 加载完成
- **THEN** 组件渲染完整计划面板，handleStartHunt 回调可正常使用

#### Scenario: HuntApp flowPhase 切换时不崩溃
- **WHEN** flowPhase 从 "settlement" 切换到 "rest"
- **THEN** HuntApp 正常渲染 RestScreen，handleStartNextHunt 回调可正常使用

#### Scenario: HuntApp flowPhase 为 hunting 时正常渲染
- **WHEN** flowPhase 为 "hunting"
- **THEN** 组件正常渲染狩猎阶段界面
