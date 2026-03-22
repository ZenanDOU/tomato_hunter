## 1. ErrorBoundary

- [x] 1.1 创建 src/components/common/ErrorBoundary.tsx — class component, pixel 风格 fallback UI + reload 按钮
- [x] 1.2 在 App.tsx 中用 ErrorBoundary 包裹 VillageLayout
- [x] 1.3 在 HuntApp.tsx 中用 ErrorBoundary 包裹 hunt flow

## 2. 键盘快捷键

- [x] 2.1 创建 src/hooks/useKeyboardShortcuts.ts — 全局 keydown listener, context-aware dispatch
- [x] 2.2 在 App.tsx 中集成 useKeyboardShortcuts（Escape 关闭弹窗）
- [x] 2.3 在 HuntApp.tsx 中集成 useKeyboardShortcuts（Space 暂停/恢复）

## 3. Store 错误处理

- [x] 3.1 taskStore.ts — 所有异步 action 添加 try-catch
- [x] 3.2 inventoryStore.ts — 所有异步 action 添加 try-catch
- [x] 3.3 planStore.ts — 所有异步 action 添加 try-catch
- [x] 3.4 farmStore.ts — 所有异步 action 添加 try-catch
- [x] 3.5 timerStore.ts — 所有异步 action 添加 try-catch + 请求去重 isProcessing 标志

## 4. 数据库索引

- [x] 4.1 创建 src-tauri/migrations/007_add_indexes.sql — pomodoros, tasks, planned_task_entries, loot_drops 索引
- [x] 4.2 在 Tauri migration 配置中注册新 migration 文件

## 5. HuntApp 拆分

- [x] 5.1 提取 src/hooks/useHuntAudio.ts — habitat BGM、armor audio、phase transition SFX、prevPhase ref
- [x] 5.2 提取 src/hooks/useReviewFlow.ts — review 提交、loot 生成、damage task、farm 更新
- [x] 5.3 重构 HuntApp.tsx 使用新 hooks，验证行为不变

## 6. 颜色主题 token 化

- [x] 6.1 配置 tailwind.config.ts 添加语义化颜色 token（sky、cloud、tomato、sunny、cream、deep-blue、pixel-black、grass、orange）
- [x] 6.2 全局替换高频颜色：#333333 → pixel-black、#55BBEE → sky、#EE4433 → tomato、#DDEEFF → cloud
- [x] 6.3 替换中频颜色：#FFD93D → sunny、#FFF8E8 → cream、#FF8844 → orange、#5BBF47 → grass、#3366AA → deep-blue

## 7. ARIA 无障碍

- [x] 7.1 所有 icon-only 按钮添加 aria-label（VillageLayout、Workshop、HuntList、DailyPlanBoard、FocusPhase 等）
- [x] 7.2 所有 modal/dialog 容器添加 role="dialog" aria-modal="true"（Lore弹窗、音量设置、MonsterSplitForm 等）
- [x] 7.3 所有 form textarea/input 添加 aria-label（PrepPhase、ReviewPhase、Inbox 等）

## 8. 性能优化

- [x] 8.1 HuntList.tsx — topTasks 过滤添加 useMemo
- [x] 8.2 审查其他组件中的计算密集型渲染，酌情添加 useMemo/useCallback
