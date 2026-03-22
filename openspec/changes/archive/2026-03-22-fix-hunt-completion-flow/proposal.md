## Why

狩猎完成流程存在关联性 bug 链：3 血怪物最后一次狩猎完成复盘后，(1) 没有出现击杀判定界面，(2) 从休息阶段返回村庄时弹出恢复对话框，(3) 村庄中怪物仍显示 1 HP。根因是多处状态同步缺失和防御性不足。

## What Changes

- **修复村庄任务数据不刷新**：`handleReturnToVillage` 返回村庄前通过 Tauri 事件通知主窗口刷新 taskStore，确保显示最新 HP
- **加固击杀判定检测**：Settlement 组件使用 `hpReachedZero` prop 的变化同步 view 状态，而非仅依赖初始化值
- **修复恢复对话框误触发**：主窗口在从隐藏恢复显示时不应重新触发恢复检查；或添加"当前有活跃狩猎窗口"的排除逻辑
- **确保 damageTask → HP 查询的原子性**：将 HP 零值检测从单独 SELECT 改为利用 damageTask 的返回值

## Capabilities

### New Capabilities

_无新增能力_

### Modified Capabilities

- `pomodoro-timer`: 修复从休息阶段返回村庄时的状态同步、击杀判定检测、恢复对话框排除逻辑

## Impact

- `src/hooks/useReviewFlow.ts` — HP 零值检测改用 damageTask 返回值
- `src/stores/taskStore.ts` — damageTask 返回 HP 是否归零
- `src/components/settlement/Settlement.tsx` — 响应 hpReachedZero prop 变化
- `src/components/settlement/RestScreen.tsx` — 返回村庄前通知主窗口刷新
- `src/App.tsx` — 添加窗口显示时的刷新逻辑或恢复检查排除
- `src/HuntApp.tsx` — 确保 settlement 前状态一致
