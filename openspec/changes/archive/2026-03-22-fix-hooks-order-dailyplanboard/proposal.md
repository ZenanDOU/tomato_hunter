## Why

在视觉优化重构中，`handleStartHunt`（DailyPlanBoard）和 `handleStartNextHunt`（HuntApp）从普通函数被改为 `useCallback`，但没有移动到 early return 之前。普通函数在 early return 之后调用是合法的，但 `useCallback` 是 hook，必须在每次渲染中无条件调用。这导致运行时报错："Rendered more hooks than during the previous render"。

## What Changes

- `DailyPlanBoard.tsx`：将 `handleStartHunt` 的 `useCallback` 从 early return 之后移到之前
- `HuntApp.tsx`：将 `handleStartNextHunt` 的 `useCallback` 从 early return 之后移到之前

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

（无 — 纯 bug 修复，不涉及需求变更）

## Impact

- `src/components/village/DailyPlanBoard.tsx` — hook 位置调整
- `src/HuntApp.tsx` — hook 位置调整
- 修复后两个组件在条件分支切换时不再崩溃
