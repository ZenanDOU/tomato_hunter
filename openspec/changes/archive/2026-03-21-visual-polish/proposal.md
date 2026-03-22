## Why

游戏当前的视觉层是 MVP 状态：16x16 程序化 sprite（仅 5/15 个物种有数据）、纯色背景、无动画过渡、部分组件使用 Tailwind 默认色而非像素调色板。作为 Steam 上线前的打磨，需要全面提升视觉品质——更精细的 sprite、有氛围的场景背景、像素风动画、统一的设计语言。同时修正三个栖息地 apex 生物重复为龙的问题，以及家族命名不一致。

## What Changes

**生态设定修正**
- 5 个怪物家族重命名（"X虫群" → 按生态主题命名：锈蚀机械兽/枯彩幻灵/蛀典书灵/荒野蔓生兽/迷雾幻形体）
- 替换 3 个龙形 apex 为视觉独特的物种：画境凤(creative)、封典巨鸮(study)、深渊水母(other)
- 新 apex 完整数据（traits、bodyParts、descTemplates、visualDesc）

**Sprite 系统升级**
- 16x16 → 32x32 分辨率，调色板从 4-6 色扩展到 8-12 色
- 新增动画帧：idle(2帧)、hit(1帧)、defeat(2帧)
- SpriteData 类型统一到 src/types/index.ts，消除双重定义
- PixelSprite 组件接受 animation prop，使用共享动画循环

**程序化像素背景**
- 新建 PixelBackground 组件，Canvas 生成像素风场景
- 村庄背景：天空渐变 + 远山 + 草地 + 小屋
- 5 个栖息地背景（focus 阶段）：各有独特元素和粒子效果
- 休息背景：草地 + 云朵

**动画过渡系统**
- 村庄 tab 切换：steps(4) 扫描线效果
- 狩猎阶段切换：闪白 2 帧过渡
- 怪物动画：idle 循环、受击闪烁、击败倒下
- 掉落物逐个弹入动画
- 按钮点击闪光反馈
- 共享 rAF 动画循环（sprite 4fps + 粒子 8fps）

**视觉一致性审计**
- 间距统一（4px 网格）
- 边框统一（outline-2 像素边框）
- 颜色审计：移除所有 Tailwind 默认色，统一到 Tomato Train 调色板
- 字体验证（zpix 全覆盖）
- Focus 状态统一（sunny yellow 高亮框）
- 移除或替换 ProgressBar.tsx（非像素风）

## Capabilities

### New Capabilities
- `pixel-animation`: 共享动画循环系统 + 页面过渡 + 怪物/UI 动画
- `pixel-backgrounds`: 程序化像素背景生成（村庄/栖息地/休息场景）

### Modified Capabilities
- `monster-ecology`: 家族重命名 + 3 个 apex 物种替换
- `design-system`: sprite 32x32 升级、调色板扩展、一致性审计、focus 状态、移除非像素风组件

## Impact

- **bestiary.ts**: 家族名、3 个 apex 物种完整替换
- **spriteData.ts**: 全部 15 个物种的 32x32 多帧数据（大量新增数据）
- **types/index.ts**: 新 SpriteData 类型定义
- **PixelSprite.tsx**: 重写渲染逻辑支持动画帧
- **新组件**: PixelBackground.tsx, PixelTransition.tsx, animationLoop.ts
- **样式审计**: ~15 个组件文件需要颜色/间距修正
- **零新依赖**: 纯 CSS + Canvas API
