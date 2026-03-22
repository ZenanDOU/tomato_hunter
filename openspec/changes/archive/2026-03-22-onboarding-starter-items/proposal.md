## Why

新用户首次使用时，完成一个完整的 25 分钟番茄钟门槛较高，容易在第一次体验中放弃。通过赠送初始道具，让新人可以快速完成第一个番茄（用时间压缩缩短到 20 分钟甚至更短），降低上手门槛；完成首个番茄后赠送暂停道具并提示消耗品玩法，引导用户了解道具系统。

## What Changes

- 新用户完成引导后，自动获得 5 个「时间压缩」道具（-5分钟）
- 用户完成第一个番茄（首次击杀怪物）时，自动获得 2 个「烟雾弹」道具（暂停）
- 首次击杀时弹出提示，介绍消耗品道具的用法和获取方式

## Capabilities

### New Capabilities
- `onboarding-rewards`: 新人引导奖励系统 — 在关键节点（引导完成、首次击杀）自动发放道具并展示引导提示

### Modified Capabilities
- `onboarding`: 引导完成时触发初始道具发放

## Impact

- `src/components/common/OnboardingOverlay.tsx` — 引导完成回调中增加道具发放逻辑
- `src/stores/inventoryStore.ts` — 新增 grantItems 方法，直接向 player_equipment 插入道具
- `src/stores/settingsStore.ts` — 新增 starter_items_granted / first_kill_reward_granted 标记，防止重复发放
- 前端弹窗组件 — 展示首次击杀奖励提示
