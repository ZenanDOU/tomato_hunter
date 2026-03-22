## Context

番茄猎人使用 quest-based 引导系统（`OnboardingOverlay.tsx`），通过用户实际操作进度推进引导步骤。引导在用户首次击杀怪物（`status === "killed"`）时自动完成。道具系统已完整实现：`inventoryStore` 管理道具增减，`player_equipment` 表存储玩家拥有的道具数量，消耗品有固定 ID（时间压缩=10，烟雾弹=7）。

当前问题：新用户需要完成完整 25 分钟番茄才能体验到成就感，没有道具辅助降低门槛。

## Goals / Non-Goals

**Goals:**
- 引导完成后自动发放 5 个时间压缩道具，让新用户可以缩短前几个番茄的时长
- 首次击杀怪物后自动发放 2 个烟雾弹，引导用户了解暂停道具
- 首次击杀时显示奖励弹窗，介绍消耗品的获取和使用方式
- 所有奖励仅发放一次，通过 settings 持久化标记防止重复

**Non-Goals:**
- 不修改现有引导步骤的文案和流程
- 不新增道具类型，仅使用现有道具
- 不修改道具效果逻辑

## Decisions

### 1. 奖励发放时机

在 `OnboardingOverlay` 的引导完成逻辑中（`setOnboardingCompleted(true)` 时）触发初始道具发放。首次击杀奖励在 `timerStore` 或 `HuntApp` 检测到 killed 状态变更时触发。

**替代方案**: 在后端 Rust 层发放 → 过于复杂，道具发放是简单的 DB 写入，前端 SQL 即可完成。

### 2. 防重复发放机制

在 `settingsStore` 中新增两个 boolean 设置项：
- `starter_items_granted`: 引导完成奖励已发放
- `first_kill_reward_granted`: 首次击杀奖励已发放

写入 settings 表（key-value），与现有 `onboarding_completed` 机制一致。

**替代方案**: 用 localStorage → 不可靠，清除浏览器数据会导致重复发放。

### 3. 道具发放方式

复用 `inventoryStore` 现有的 DB 操作模式，新增一个 `grantItems(items: {equipmentId: number, quantity: number}[])` 方法，直接 INSERT/UPDATE `player_equipment` 表。

### 4. 奖励提示 UI

首次击杀奖励使用现有 `PixelCard` 组件在 settlement/review 界面显示内联奖励卡片，不使用 modal 弹窗以保持体验连贯。卡片展示获得的道具和简短说明文字。

## Risks / Trade-offs

- [竞态] 引导完成和首次击杀可能在同一次操作中触发 → 用 settingsStore 标记确保幂等性，顺序执行两个发放操作
- [已有用户] 老用户已完成引导但未获得奖励 → 不补发，此功能仅面向新用户，老用户已不需要降低门槛
