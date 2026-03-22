## Why

Village 和 Settlement 是用户停留时间最长的界面，但目前存在布局拥挤、视觉层级不清晰、交互反馈缺失、信息密度不合理等问题。作为一款像素风番茄钟应用，这些界面需要达到"精致复古游戏"的质感，而不是"功能堆砌的工具界面"。

## What Changes

- **布局重构**: 优化 VillageLayout 标签页内容区域的间距与对齐，DailyPlanBoard 各分区（进行中/待战/已讨伐）采用更清晰的视觉分隔，HuntBoard 卡片增加呼吸感
- **视觉层级提升**: 统一卡片阴影深度、强化状态色彩对比（active/idle/completed），为 Settlement 庆祝界面增加更丰富的像素粒子效果
- **交互微动效**: 标签页切换添加像素风过渡动画，按钮/卡片增加 hover 状态变化，操作完成时添加即时反馈（如击杀确认的闪光效果）
- **信息密度优化**: DailyPlanBoard 默认折叠已讨伐区域并显示摘要计数，HuntBoard 未鉴定区域空状态时自动隐藏，Workshop 材料库存采用紧凑网格布局
- **Settlement 结算体验**: 优化战利品展示的入场动画节奏，击杀确认界面增加怪物击败动画，休息界面增加呼吸感的背景动效

## Capabilities

### New Capabilities
- `village-ui-polish`: 覆盖 Village 主界面（VillageLayout、DailyPlanBoard、HuntBoard、Workshop）的布局优化、视觉层级、交互微动效和信息密度改进
- `settlement-ui-polish`: 覆盖 Settlement 结算界面和 RestScreen 休息界面的动画节奏、视觉效果和体验优化

### Modified Capabilities
- `design-system`: 新增交互动效 token（hover 变换、过渡时间、微动画关键帧），扩展 PixelCard 变体（elevated/sunken），新增 PixelBadge 计数组件

## Impact

- **前端组件**: VillageLayout, DailyPlanBoard, HuntBoard, Workshop, Settlement, RestScreen
- **样式系统**: src/styles/index.css — 新增动画关键帧、hover 变量、间距 token
- **设计系统组件**: PixelCard（新变体）、PixelButton（hover 增强）、新增 PixelBadge
- **无后端改动**: 纯前端 UI 层面变更，不涉及 Tauri 命令或数据库
