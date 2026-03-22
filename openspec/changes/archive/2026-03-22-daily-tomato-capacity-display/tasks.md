## 1. Store 层：新增计算方法

- [x] 1.1 在 planStore 中新增 `getRemainingEnergy()` 方法：返回 t3 = total_budget - getTotalCompleted()
- [x] 1.2 在 planStore 中新增 `getRemainingTaskDemand()` 方法：返回 t4 = 待战+进行中条目的 (planned_pomodoros_today - completed_pomodoros_today) 之和
- [x] 1.3 在 planStore 中新增 `getOverloadLevel()` 方法：返回 "none" | "mild" | "severe"，基于 t4 - t3 的差值判断

## 2. 头部精力仪表盘 UI

- [x] 2.1 重构 DailyPlanBoard 头部区域，用 t3/t4 对比展示替换原有 allocated/budget 显示
- [x] 2.2 实现 t3（剩余精力）和 t4（剩余任务量）并排大字展示，配以标签说明
- [x] 2.3 保留 total_budget 可编辑输入框，置于头部右侧

## 3. 进度条语义变更

- [x] 3.1 将 PixelProgressBar 的 value/max 从 completed/totalPlanned 改为 completed/budget
- [x] 3.2 更新进度条标签为 "已用 X / 预算 Y 🍅" 格式
- [x] 3.3 更新剩余时间计算，基于 t4 × 武器专注时长显示

## 4. 过载警告与交互引导

- [x] 4.1 实现过载警告组件：mild 时橙色提示，severe 时红色警告
- [x] 4.2 过载时为待战区 ✕ 按钮添加视觉强调（高亮或脉冲动画）
- [x] 4.3 移除原有的 allocated > budget 静态警告逻辑，替换为新的动态过载检测

## 5. 完成状态处理

- [x] 5.1 实现预算用完但仍有活跃任务时显示 "预算已用完"
- [x] 5.2 保留全部任务完成时的庆祝状态 "今日讨伐完成！🎉"
