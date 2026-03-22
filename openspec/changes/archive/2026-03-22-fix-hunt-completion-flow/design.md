## Context

Tauri 架构下主窗口（村庄）和狩猎窗口是独立 webview，各有独立的 JS context 和 zustand store。狩猎窗口中的 `damageTask` 修改 DB 但不会更新主窗口的 taskStore。

当前流程的问题点：
1. `damageTask` 修改 DB 后，`useReviewFlow` 用**单独的 SELECT** 查 HP 是否归零——理论上应该看到最新值，但存在意外读不到的风险
2. `Settlement` 的 `view` 状态用 `useState(hpReachedZero ? "kill-confirm" : "loot")` 初始化——如果 Settlement 在 `setHpReachedZero(true)` 之前挂载，view 将永远是 "loot"
3. `handleReturnToVillage` 只调用 `advancePhase` + `fetchTodayPlan` + `closeHuntWindow`，没有通知主窗口刷新 task 数据
4. 主窗口的恢复检查在 `useEffect([], [])` 中只跑一次，但在某些场景（HMR、React re-mount）可能重新触发

## Goals / Non-Goals

**Goals:**
- 确保最后一击后 Settlement 显示击杀判定
- 返回村庄后主窗口显示正确的 HP
- 消除恢复对话框在正常流程中的误触发

**Non-Goals:**
- 不改变 damageTask 的事务逻辑
- 不重构窗口架构

## Decisions

### 1. damageTask 返回 HP 归零状态

`damageTask` 在事务中已经 SELECT 了更新后的 task。将返回值从 `void` 改为 `{ reachedZero: boolean }`，让 `useReviewFlow` 直接使用返回值而非再查一次 DB。

### 2. Settlement 响应 prop 变化

将 `useState(hpReachedZero ? ...)` 改为 `useEffect` 监听 `hpReachedZero` prop 变化：如果从 false 变为 true，切换 view 到 "kill-confirm"。这消除了初始化时序的依赖。

### 3. 主窗口刷新：Tauri 事件

`closeHuntWindow` 之前，通过 `emit("hunt_completed")` 通知主窗口。主窗口的 `App.tsx` 或 `VillageLayout` 监听此事件并刷新 taskStore + planStore。

### 4. 恢复对话框防御

在恢复检查中增加条件：如果当前有活跃的 hunt 窗口存在，跳过恢复检查。或者在 `handleReviewComplete` 设置 `ended_at` 后立即 emit 一个事件让主窗口标记"最近完成过番茄钟"。

## Risks / Trade-offs

- **[Risk] Tauri emit 可能在主窗口隐藏时不被处理** → Mitigation: 主窗口被隐藏（hidden）而非销毁，事件监听器仍然活跃
- **[Risk] damageTask 返回类型变更影响其他调用者** → Mitigation: 只有 useReviewFlow 调用 damageTask，影响范围可控
