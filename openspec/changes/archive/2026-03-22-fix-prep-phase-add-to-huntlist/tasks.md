## 1. 诊断根因

- [x] 1.1 在浏览器 DevTools 中复现 bug，检查 console 是否有未捕获的 promise rejection 或 DB 错误
- [x] 1.2 验证 species_id 列是否存在（检查 migration 011 是否已执行）

## 2. 修复 MonsterDiscoveryCard overlay 渲染

- [x] 2.1 将 MonsterDiscoveryCard 的 overlay 改为使用 `createPortal(... , document.body)` 渲染，避免 CSS containment 导致 fixed 定位失效

## 3. 修复 handleConfirmDiscovery 错误处理

- [x] 3.1 在 HuntBoard.tsx 的 `handleConfirmDiscovery` 中添加 try-catch，失败时 console.error 并展示用户可见的错误提示
- [x] 3.2 在 Inbox.tsx 的 `handleConfirmDiscovery` 中做同样的错误处理修复
- [x] 3.3 为"加入讨伐清单"按钮添加 loading 状态（传入 confirming prop），防止重复点击

## 4. 验证

- [x] 4.1 测试正常流程：创建任务 → 侦查敌情 → 加入讨伐清单 → 验证通过
- [x] 4.2 测试错误场景：species_id 列缺失时降级成功，错误提示正常显示
