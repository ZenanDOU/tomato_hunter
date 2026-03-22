## Context

Tomato Hunter 是 Tauri 2 + React 19 + Zustand 5 的桌面应用，目标上线 Steam。当前在"正常路径"运行良好，但缺乏生产环境所需的防御性编程。主要风险：

1. **零 ErrorBoundary**：任何渲染错误 → 整个应用白屏
2. **Store 无 try-catch**：DB 操作失败 → 前端状态与数据库不一致
3. **无键盘操作**：Steam 用户期望标准快捷键
4. **无 ARIA**：无障碍完全缺失
5. **无 DB 索引**：数据量增长后查询性能下降
6. **HuntApp 285 行**：多职责混合，维护风险
7. **颜色硬编码 50+处**：主题修改困难

## Goals / Non-Goals

**Goals:**
- 所有页面级组件包裹 ErrorBoundary，渲染错误显示友好界面而非白屏
- 全局键盘快捷键覆盖核心操作
- 所有 icon-only 按钮和对话框有 ARIA 标签
- 关键表添加数据库索引
- Store 异步操作有 try-catch + console.error
- HuntApp 逻辑拆分到自定义 hooks
- 颜色值提取为 Tailwind 主题 token

**Non-Goals:**
- 不实现 Steam API 集成（成就、云存档等）
- 不添加自动更新机制
- 不做响应式/移动端适配
- 不添加 i18n 国际化
- 不修改游戏机制或 spec 级别行为

## Decisions

### D1: ErrorBoundary 实现方式

使用 React class component（`componentDidCatch`），因为 React 19 仍不支持 hooks 形式的 error boundary。

fallback UI 风格与像素风一致，显示错误信息 + "重新加载"按钮 + 错误详情可展开。

包裹位置：
- `App.tsx` → 包裹 `<VillageLayout />`
- `HuntApp.tsx` → 包裹整个 hunt flow

### D2: 键盘快捷键架构

创建 `useKeyboardShortcuts` hook，在 App 和 HuntApp 顶层注册。根据当前 context（村庄/准备/专注/审视/休息）映射不同的按键行为。

| 快捷键 | 村庄 | 准备 | 专注 | 审视 | 休息 |
|---|---|---|---|---|---|
| Escape | 关闭弹窗 | — | — | — | — |
| Space | — | — | 暂停/恢复 | — | — |
| Enter | — | 开始战斗 | — | 提交 | — |

实现：全局 `keydown` listener + context-aware dispatch，不使用额外库。

### D3: Store 错误处理策略

所有 store 的异步 action 包裹 try-catch：
- catch 中 `console.error(message, error)`
- 不弹 toast（当前无 toast 系统）
- 确保 finally 块中重置 loading/processing 状态
- 不改变现有 API（不添加返回值/error state）

### D4: HuntApp 拆分策略

提取两个自定义 hooks：
- `useHuntAudio(timer, flowPhase)` — 管理 habitat BGM、armor audio、phase transition SFX、prevPhase ref
- `useReviewFlow(timer)` — 管理 review 提交、loot 生成、damage task、farm 更新

HuntApp 保留：flowPhase 状态、组件渲染 switch、window lifecycle。

### D5: 颜色 token 化

在 `tailwind.config.ts` 中定义语义化颜色 token：

```
sky: '#55BBEE'        → bg-sky, text-sky
cloud: '#DDEEFF'      → bg-cloud
tomato: '#EE4433'     → bg-tomato
sunny: '#FFD93D'      → text-sunny
cream: '#FFF8E8'      → bg-cream
deep-blue: '#3366AA'  → bg-deep-blue
pixel-black: '#333333' → border-pixel-black
grass: '#5BBF47'      → bg-grass
orange: '#FF8844'     → bg-orange
```

分批替换：先替换高频颜色（pixel-black、sky、tomato），后续逐步覆盖。

### D6: 数据库索引

添加 migration `007_add_indexes.sql`：
```sql
CREATE INDEX IF NOT EXISTS idx_pomodoros_task_id ON pomodoros(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoros_ended ON pomodoros(ended_at);
CREATE INDEX IF NOT EXISTS idx_loot_pomodoro ON loot_drops(pomodoro_id);
CREATE INDEX IF NOT EXISTS idx_planned_entries_date ON planned_task_entries(plan_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
```

### D7: ARIA 标签范围

优先添加：
- 所有 icon-only 按钮（📜、🎚️、⚔️ 等）添加 `aria-label`
- 对话框容器添加 `role="dialog"` + `aria-modal="true"`
- 表单 textarea/input 添加 `aria-label`
- SoundToggle 按钮添加动态 aria-label

不做：完整的 screen reader 导航（超出当前范围）

## Risks / Trade-offs

- **[HuntApp 重构范围]** 拆分 hooks 涉及移动大量代码 → 分步进行，先提取 audio hook，验证通过后再提取 review hook
- **[颜色替换回归]** 50+ 处替换可能遗漏或错误 → 使用全局搜索替换，逐色验证
- **[ErrorBoundary 体验]** 错误恢复可能导致状态丢失 → "重新加载"按钮调用 `window.location.reload()` 最安全
- **[索引 migration]** 对已有数据的表添加索引可能短暂阻塞 → SQLite 对小表影响忽略不计
