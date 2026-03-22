## Why

在狩猎看板的"未鉴定"区域，点击"🔍 侦查敌情"后弹出 MonsterDiscoveryCard，但点击"⚔️ 加入讨伐清单"按钮没有任何反应。任务无法从 unidentified 状态转为 ready 状态，导致用户无法将怪物加入讨伐清单进行狩猎。这是核心流程的阻塞性 bug，必须立即修复。

## What Changes

- 修复 MonsterDiscoveryCard 中"加入讨伐清单"按钮点击无响应的问题
- 排查 `handleConfirmDiscovery` → `identifyTask` 调用链中的静默错误
- 确保 MonsterDiscoveryCard 的 overlay 不被其他 z-index 层或 CSS containment 遮挡
- 为 `handleConfirmDiscovery` 添加错误处理，防止静默失败

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

（无需求级别的规格变更，这是纯 bug 修复）

## Impact

- `src/components/common/MonsterDiscoveryCard.tsx` — 按钮点击处理
- `src/components/village/HuntBoard.tsx` — `handleConfirmDiscovery` 回调
- `src/components/village/Inbox.tsx` — 同上（Inbox 中也有相同的发现流程）
- `src/stores/taskStore.ts` — `identifyTask` 方法的错误处理
