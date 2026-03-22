## 1. 设计系统扩展

- [x] 1.1 在 index.css 中添加间距 token（--space-xs/sm/md/lg/xl）和动效 token（--transition-fast/normal/slow, --ease-pixel/pixel-fine）
- [x] 1.2 添加 scanline-enter 和 slide-down @keyframes 动画定义
- [x] 1.3 创建 PixelBadge 组件（count、variant props）
- [x] 1.4 为 PixelCard 添加 elevated 和 sunken 变体
- [x] 1.5 为 PixelButton 添加 hover 微位移效果（translateY(-1px) + 阴影增大）

## 2. Village 布局与间距

- [x] 2.1 VillageLayout 标签页切换添加 scanline 过渡动画
- [x] 2.2 VillageLayout 标签页 hover 状态优化（sunny 色过渡）
- [x] 2.3 DailyPlanBoard 三个分区使用 sunken PixelCard 容器 + 统一间距

## 3. Village 信息密度

- [x] 3.1 DailyPlanBoard 已讨伐区默认折叠 + PixelBadge 计数显示
- [x] 3.2 HuntBoard 空分区自动隐藏，就绪区空状态提示
- [x] 3.3 HuntBoard 卡片间距统一 + hunting 状态卡片使用 elevated 变体
- [x] 3.4 Workshop 材料库存改为紧凑 grid 布局，零库存半透明显示

## 4. Village 交互微动效

- [x] 4.1 可交互 PixelCard hover 边框变色效果
- [x] 4.2 DailyPlanBoard 操作按钮（击杀、移除、排序）hover 反馈

## 5. Settlement 动画编排

- [x] 5.1 击杀确认后怪物击败动画（抖动+淡出 300ms）
- [x] 5.2 战利品 stagger 入场动画优化（间隔 100ms，steps(4)）
- [x] 5.3 庆祝粒子效果优化（金色粒子扩散）
- [x] 5.4 动画跳过功能（点击任意位置跳过）

## 6. Settlement 视觉优化

- [x] 6.1 标题区域 sunny 色背景条 + deep-blue 文字
- [x] 6.2 战利品卡片使用 cream 背景 PixelCard 布局（图标左、信息右）
- [x] 6.3 首次发现奖励 sunny 边框 + pulse 闪烁效果

## 7. RestScreen 优化

- [x] 7.1 PixelBackground rest 场景添加色调循环动画
- [x] 7.2 PixelProgressBar 休息计时 pulse 呼吸效果
- [x] 7.3 健康提示卡片紧凑布局（cream 背景，320px 居中）
- [x] 7.4 下一任务预览条（怪物图标 + 名称 + 时间，cloud 背景）
