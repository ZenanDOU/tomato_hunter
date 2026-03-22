## Context

番茄猎人使用 Zustand store 管理计时器状态。Rust 端每秒通过 Tauri event 发送 `timer_tick`，前端 `timerStore.setTimer()` 整体替换 `TimerState` 对象。所有使用 `useTimerStore()` 的组件都会在每次 tick 时重渲染，即使它们只关心 phase 或 task_name 等不变字段。

村庄界面的列表组件（HuntItem、PlanEntry、EquipmentCard 等）没有使用 React.memo，父组件任何 state 变化（如批量模式切换、展开/折叠）都会导致所有列表项重新渲染。

## Goals / Non-Goals

**Goals:**
- 减少 hunt 阶段的重渲染次数（每秒从全组件树降到仅计时器显示元素）
- 减少村庄列表组件的不必要重渲染
- 保持所有现有功能不变

**Non-Goals:**
- 不改变 Rust 端 timer 的 tick 频率
- 不做虚拟列表（当前任务量级不需要）
- 不做 bundle size 优化

## Decisions

### D1: Zustand selector 精细订阅而非 store 拆分

**选择**: 使用 Zustand 的 selector 模式 `useTimerStore(s => s.timer?.phase)` 让组件只订阅需要的字段，而非拆分 store。

**理由**: 拆分 store 改动大且引入同步复杂性。Zustand 原生支持 selector + shallow 比较，改动最小且效果等价。

**替代方案**: 拆分为 timerTickStore + timerMetaStore — 侵入性太大。

### D2: React.memo + useCallback 组合模式

**选择**: 列表项组件用 `React.memo` 包裹，父组件传递的 callback 用 `useCallback` 稳定引用。

**理由**: 标准 React 优化模式，简单有效。列表项的 props（task 对象引用、selected 布尔值）在 Zustand fetchTasks 后会生成新数组，但数组中未变化的 item 引用相同（Zustand shallow 比较）。

### D3: useMemo 用于组件内昂贵计算

**选择**: 对 `selectSpecies()`、`parseMonsterVariant()`、`SPRITE_DATA` lookup 使用 useMemo。

**理由**: 这些函数每次调用都做字符串匹配和对象构造，在列表中重复调用浪费。依赖项是 task 的 category/name/difficulty/variant，变化频率低。

## Risks / Trade-offs

- **[Stale UI]** memo 比较跳过更新 → 确保所有可变 props 作为 memo 依赖，使用 useCallback 稳定函数引用
- **[fetchTasks 新数组]** Zustand set({tasks}) 每次创建新数组，数组内的 task 对象是新引用 → React.memo 的 shallow compare 会认为 props 变了。但这是 fetchTasks 才触发的低频操作，不影响 timer tick 路径
