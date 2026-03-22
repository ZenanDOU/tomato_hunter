## Context

用户在狩猎看板点击"侦查敌情"后，MonsterDiscoveryCard 弹窗正常显示怪物信息，但点击"⚔️ 加入讨伐清单"按钮无任何反应。

当前调用链：
1. 按钮 `onClick={onConfirm}` → `handleConfirmDiscovery()`
2. `handleConfirmDiscovery` → `identifyTask(taskId, name, desc, variant, speciesId)`
3. `identifyTask` → DB UPDATE + `fetchTasks()`

涉及组件：HuntBoard.tsx（主入口）、Inbox.tsx（备选入口）、MonsterDiscoveryCard.tsx（弹窗）、taskStore.ts（数据层）。

## Goals / Non-Goals

**Goals:**
- 定位并修复"加入讨伐清单"按钮点击无响应的根因
- 确保 `handleConfirmDiscovery` 的错误被正确捕获并反馈给用户
- 验证 MonsterDiscoveryCard 的 overlay 层级不被其他元素遮挡

**Non-Goals:**
- 不重构 MonsterDiscoveryCard 的整体设计
- 不改变怪物发现的流程逻辑
- 不修改 identifyTask 的业务逻辑

## Decisions

### 1. 排查方向：静默错误 vs 事件拦截

**优先检查静默错误**：`handleConfirmDiscovery` 是 async 函数但未 try-catch。如果 `identifyTask` 抛出异常（例如 DB schema 不匹配、species_id 列不存在），promise rejection 被吞掉，按钮看起来"无响应"。

**其次检查 CSS 层级**：MonsterDiscoveryCard 使用 `position: fixed; z-index: 50`。如果某个祖先元素有 `transform`、`filter` 或 `will-change`，会创建新的 containing block，导致 fixed 定位失效。

**理由**：静默错误是最常见的"按钮无反应"原因，且代码中确实缺少 try-catch。

### 2. 修复策略：添加错误处理 + 使用 createPortal

- 为 `handleConfirmDiscovery` 添加 try-catch，失败时显示错误提示
- 将 MonsterDiscoveryCard 的 overlay 通过 `createPortal` 渲染到 document.body，避免 CSS containment 问题（参考 ReleaseConfirmDialog 已经用了 createPortal）
- 添加按钮 loading 状态，避免重复点击

### 3. HuntBoard 和 Inbox 统一修复

两处的 `handleConfirmDiscovery` 逻辑完全相同，修复方案也一致。

## Risks / Trade-offs

- **[风险] 根因可能不在前端** → 如果是 DB 层 migration 未执行导致 species_id 列不存在，需要验证 migration 状态
- **[风险] createPortal 可能影响样式继承** → MonsterDiscoveryCard 已经是 fixed 定位的独立 overlay，移到 portal 后样式影响极小
