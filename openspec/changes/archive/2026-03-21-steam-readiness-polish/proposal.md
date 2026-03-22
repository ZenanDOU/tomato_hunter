## Why

项目审计发现 10 个影响 Steam 上线质量的问题，涵盖稳定性、可用性和代码健壮性。当前应用在正常路径上运行良好，但缺乏错误恢复（组件 throw → 白屏）、键盘操作（Steam 用户基本期望）和生产日志。同时代码层面存在 Store 异步无 try-catch、数据库无索引、大组件需拆分等技术债。

## What Changes

**稳定性与错误恢复：**
- 添加 React ErrorBoundary 组件，包裹 VillageLayout 和 HuntApp
- Store 异步操作全面添加 try-catch 错误处理
- 生产环境崩溃日志写入文件，便于用户反馈

**可用性：**
- 全局键盘快捷键：Esc=返回/关闭、Space=暂停、Enter=确认
- ARIA 标签：所有 icon-only 按钮、对话框、表单输入

**性能与数据层：**
- 数据库添加关键索引（tasks、pomodoros、planned_task_entries）
- HuntList 任务过滤添加 useMemo
- Store 异步操作添加请求去重防止 race condition

**代码质量：**
- HuntApp.tsx 拆分：提取 useHuntAudio、useReviewFlow 自定义 hook
- 颜色硬编码提取为 Tailwind 主题 token（`bg-sky` 替代 `bg-[#55BBEE]`）

## Capabilities

### New Capabilities

_无新增能力模块。_

### Modified Capabilities

_无 spec 级别变更——所有改动为实现层面重构和基础设施增强。_

## Impact

- `src/components/common/ErrorBoundary.tsx` — 新建
- `src/hooks/useKeyboardShortcuts.ts` — 新建
- `src/hooks/useHuntAudio.ts` — 新建（从 HuntApp 提取）
- `src/hooks/useReviewFlow.ts` — 新建（从 HuntApp 提取）
- `src-tauri/migrations/007_add_indexes.sql` — 新建
- `tailwind.config.ts` — 主题颜色定义
- `src/HuntApp.tsx` — 大幅重构，逻辑提取到 hooks
- `src/App.tsx` — 添加 ErrorBoundary
- `src/stores/*.ts` — 全部 store 添加 try-catch
- `src/components/**/*.tsx` — ARIA 标签 + 颜色 token 替换 + 键盘快捷键
