## Why

Tomato Hunter 当前的视觉风格存在以下不一致问题：

1. **色板混乱**：村庄用米黄暖色调，怪物区用暗紫色，狩猎浮窗用 stone-900 暗灰——三种风格杂糅。与番茄列车品牌的明亮、高饱和、统一像素风格差距很大。
2. **像素风不纯粹**：当前的 pixel-border 只是 CSS box-shadow 模拟，没有严格的像素网格、纯色填充、整数倍缩放等 8-bit 规范。
3. **按钮/卡片/进度条无统一规范**：各组件颜色、描边、圆角随意，缺少设计系统。
4. **狩猎窗口风格断裂**：狩猎浮窗仍是暗色主题（stone-900），与村庄的明媚风格割裂。
5. **缺少品牌统一感**：没有统一的图标风格、角色形象、装饰元素。

番茄列车的设计规范为整个产品家族定义了清晰的视觉语言。Tomato Hunter 作为同系列产品，应在保持"狩猎/战斗"特色的同时，对齐核心视觉规范。

## What Changes

**色板对齐**
- 采用番茄列车核心色板：天空蓝 #55BBEE、草地绿 #5BBF47、番茄红 #EE4433、阳光黄 #FFD93D、云朵白 #FFFFFF、像素黑 #333333
- 村庄背景改为天空蓝+云朵白基调（取代米黄暖色调）
- 怪物/战斗区域使用番茄红+深色对比（取代暗紫色调）
- 描边统一为 #333333 像素黑 2px

**UI 组件标准化**
- 按钮系统：对齐番茄列车的 Normal/Hover/Pressed/Disabled/CTA 五态规范
- 卡片系统：云朵白/米白背景 + 2px 像素黑描边 + 右下阴影
- 进度条：分段纯色填充（番茄红→草地绿），取代当前的 CSS rounded bar
- 导航栏：底部固定或顶部tab，选中态用番茄红指示

**狩猎窗口风格统一**
- 准备阶段：明亮风格（天空蓝背景 + 云朵装饰）
- 专注阶段：保持稍暗但不是 stone-900，用深蓝 #3366AA 底 + 番茄红进度条
- 复盘阶段：回到明亮风格（暖橙/薄荷绿色调表示完成）

**像素风纯度提升**
- 所有像素元素使用 `image-rendering: pixelated`
- 禁止渐变填充，所有色块纯色
- 描边/阴影统一用像素黑 + 偏移模拟
- 圆角使用像素化圆角（对角切 1-2 像素），非 CSS border-radius

**品牌元素植入**
- Header 使用番茄列车风格的像素化 Logo
- 添加像素云朵、小番茄等装饰元素
- 怪物卡片边框使用番茄列车风格的彩色标题条

## Capabilities

### New Capabilities

- `design-system`: 统一的设计系统模块，包含色板常量、按钮/卡片/进度条组件变体、像素化工具函数

### Modified Capabilities

- `world-narrative`: 更新色板定义和 CSS 主题变量为番茄列车色板，更新 pixel-border 为严格像素描边
- `pomodoro-timer`: 狩猎浮窗视觉风格从暗灰主题改为番茄列车风格

## Impact

- `src/styles/index.css` 主题变量全面替换
- 所有村庄组件（VillageLayout, Inbox, HuntList, DailyPlanBoard, Workshop, TomatoSanctuary）配色更新
- 所有狩猎组件（PrepPhase, FocusPhase, ReviewPhase, Settlement, RestScreen）风格统一
- 新增 `src/components/common/PixelButton.tsx` 等设计系统组件
- 新增 `src/components/common/PixelCard.tsx`
- 新增 `src/components/common/PixelProgressBar.tsx`
