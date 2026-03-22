## Context

重构时将两个普通 async 函数改为 `useCallback` 以优化子组件 re-render，但遗漏了位置调整：

1. **DailyPlanBoard.tsx** — `handleStartHunt` 在第 55 行 `if (!plan) return` 之后（第 69 行）
2. **HuntApp.tsx** — `handleStartNextHunt` 在第 104 行 `if (flowPhase === "settlement") return` 之后（第 108 行）

普通函数在 early return 后合法，`useCallback` 作为 hook 必须无条件调用。

## Goals / Non-Goals

**Goals:**
- 修复两处 hooks 调用顺序违规

**Non-Goals:**
- 不重构组件结构或改变渲染逻辑

## Decisions

**直接移动 hook 位置**：将 `useCallback` 移到所在组件的 early return 之前。这是最小改动，不改变任何行为逻辑，只修正调用位置。

## Risks / Trade-offs

无风险。`useCallback` 移到 early return 之前后，即使走到 early return 分支，hook 也已经执行完毕，返回的回调函数不会被使用，无副作用。
