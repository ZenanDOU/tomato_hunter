## 1. 怪物释放 — 数据层

- [x] 1.1 在 TaskStatus 类型中新增 `released` 值
- [x] 1.2 在 taskStore 中添加 `releaseTask(id)` 方法：更新 status 为 released、设置 completed_at、删除关联的 daily_plan_entries、级联处理子任务
- [x] 1.3 在 taskStore 中添加 `batchReleaseTasks(ids)` 方法：批量释放，一次事务完成

## 2. 怪物释放 — UI

- [x] 2.1 在 HuntItem 展开详情中添加"释放"按钮（status=hunting 时隐藏），点击弹出确认提示
- [x] 2.2 在 SplitMonsterCard 中添加整体释放按钮和单个部位释放按钮
- [x] 2.3 实现批量释放模式：HuntList 顶部添加"清理"按钮，进入模式后显示勾选框、选择计数、全选/确认/取消按钮
- [x] 2.4 确认对话框使用像素风格，与现有 RecoveryDialog 视觉一致

## 3. 新手引导 — 设计系统组件

- [x] 3.1 创建 SpotlightOverlay 组件：暗色遮罩 + 矩形镂空，支持 ResizeObserver 动态定位
- [x] 3.2 创建 PixelTooltip 组件：像素边框、cream 背景、可配置箭头方向，支持标题/描述/按钮

## 4. 新手引导 — 核心逻辑

- [x] 4.1 在 settingsStore 中新增 onboarding_completed 和 onboarding_step 字段，从 settings 表读写
- [x] 4.2 创建 OnboardingOverlay 组件，组合 SpotlightOverlay + PixelTooltip，实现步进引导
- [x] 4.3 实现 7 个引导步骤的目标元素定位（使用 data-onboarding 属性标记目标元素）和提示文案
- [x] 4.4 实现"跳过引导"和"下一步"交互逻辑，引导步骤间自动切换 tab
- [x] 4.5 在 VillageLayout 中集成 OnboardingOverlay，在 lore modal 关闭后触发

## 5. 验证

- [ ] 5.1 验证单只怪物释放：ready 状态可释放、hunting 状态不可释放、拆分怪物级联释放 (需手动测试)
- [ ] 5.2 验证批量释放模式的完整交互流程 (需手动测试)
- [ ] 5.3 验证新用户首次打开的引导流程 (需手动测试)
- [ ] 5.4 验证引导中断后重启的恢复行为 (需手动测试)
