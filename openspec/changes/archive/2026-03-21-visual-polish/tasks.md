## 1. 生态设定修正

- [x] 1.1 更新 bestiary.ts：5 个家族名称替换（机械虫群→锈蚀机械兽, 画廊虫群→枯彩幻灵, 图书馆虫群→蛀典书灵, 花园生物群→荒野蔓生兽, 沼泽虫群→迷雾幻形体）
- [x] 1.2 替换 creative apex：画境龙 → 画境凤（id, emoji, traits, bodyParts, descTemplates, visualDesc）
- [x] 1.3 替换 study apex：知识龙 → 封典巨鸮（完整数据）
- [x] 1.4 替换 other apex：混沌龙 → 深渊水母（完整数据）

## 2. 类型系统与基础设施

- [x] 2.1 在 src/types/index.ts 定义新 SpriteData 类型（SpriteFrame = number[][], frames: { idle, hit, defeat }）和 LegacySpriteData
- [x] 2.2 更新 PixelSprite.tsx 和 bestiary.ts 的 SpriteData 导入，指向 src/types/index.ts
- [x] 2.3 创建 src/lib/animation/animationLoop.ts（共享 rAF 循环，sprite 4fps + 粒子 8fps 调度）

## 3. Sprite 32x32 升级

- [x] 3.1 重写 PixelSprite.tsx：支持 animation prop（idle/hit/defeat），接入共享动画循环，支持新旧数据格式 fallback
- [x] 3.2 创建 sprite 生成 prompt 模板（基于 visualDesc + 调色板约束 → 32x32 number[][] 输出）
- [x] 3.3 生成 work 栖息地 3 个物种的 32x32 idle 帧（齿轮虫, 铁甲蜈蚣, 锻炉蟒）
- [x] 3.4 生成 creative 栖息地 3 个物种的 32x32 idle 帧（墨点虫, 灵感蛾, 画境凤）
- [x] 3.5 生成 study 栖息地 3 个物种的 32x32 idle 帧（书虱, 论文狼, 封典巨鸮）
- [x] 3.6 生成 life 栖息地 3 个物种的 32x32 idle 帧（杂草鼠, 藤蔓蛙, 古树熊）
- [x] 3.7 生成 other 栖息地 3 个物种的 32x32 idle 帧（迷雾虫, 虚空鸦, 深渊水母）
- [x] 3.8 实现 idle frame 2 派生（基础帧 1-2 像素位移呼吸效果）
- [x] 3.9 实现 hit frame 派生（idle[0] 白色 overlay 调色板替换）
- [x] 3.10 实现 defeat frame 派生（frame1: 下移2px, frame2: 下移4px + 底部溶解）

## 4. 程序化像素背景

- [x] 4.1 创建 PixelBackground 组件骨架（Canvas 生成 + 缓存 + z-index 底层）
- [x] 4.2 实现村庄背景（天空渐变 + 3 层远山 + 草地 + 散布图案，固定种子随机）
- [x] 4.3 实现粒子系统（Canvas 叠加层，接入共享动画循环 8fps，线性运动 + 透明度循环）
- [x] 4.4 实现齿轮工坊背景（暗灰底 #2A2A2A + 齿轮管道轮廓 + 橙色火花粒子）
- [x] 4.5 实现枯竭画廊背景（深紫底 #2A1A3A + 画框轮廓 + 颜料碎片粒子）
- [x] 4.6 实现遗忘图书馆背景（深蓝底 #1A2A4A + 书架轮廓 + 浮动光点粒子）
- [x] 4.7 实现荒废花园背景（深绿底 #1A3A2A + 藤蔓花朵轮廓 + 飘落花瓣粒子）
- [x] 4.8 实现迷雾沼泽背景（暗绿底 #1A2A2A + 水面波纹 + 上升雾气粒子）
- [x] 4.9 实现休息背景（#88DDAA + 草地条 + 缓慢移动云朵）
- [x] 4.10 在 VillageLayout 挂载村庄背景
- [x] 4.11 在 HuntApp focus 阶段根据 task category 挂载栖息地背景
- [x] 4.12 在 RestScreen 挂载休息背景

## 5. 动画过渡

- [x] 5.1 创建 PixelTransition 组件（CSS steps(4) 扫描线滑入 100ms）
- [x] 5.2 在 VillageLayout tab 切换中包裹 PixelTransition
- [x] 5.3 实现狩猎阶段闪白过渡（resize 完成后触发，80ms 白色 overlay）
- [x] 5.4 实现怪物 hit 动画（白色 overlay ×3 + ±2px 水平抖动，200ms）
- [x] 5.5 实现怪物 defeat 动画（2 帧 + 向下 fade out）
- [x] 5.6 实现掉落物逐个弹入动画（translateY + steps(3) scale，200ms 间隔）
- [x] 5.7 实现 PixelButton 点击闪光（1 帧白色 overlay）
- [x] 5.8 在 PrepPhase 挂载怪物 idle 动画
- [x] 5.9 在 ReviewPhase 提交时触发 hit 动画
- [x] 5.10 在 Settlement 挂载掉落物动画

## 6. 视觉一致性审计

- [x] 6.1 颜色审计：移除所有 Tailwind 默认色（stone-*, amber-*, red-*, blue-*, purple-*, green-* 数字色阶），替换为调色板 hex 值
- [x] 6.2 修复 Journal.tsx：替换 stone-* 颜色
- [x] 6.3 修复 RecoveryDialog.tsx：替换 stone-* 颜色
- [x] 6.4 修复 monsterAttributes.ts：category tag 颜色替换为栖息地主题色
- [x] 6.5 移除或重定向 ProgressBar.tsx（非像素风，使用 PixelProgressBar 替代）
- [x] 6.6 间距审计：移除 p-6 及以上，统一到 p-2/p-3/p-4/p-5 + gap-2/gap-3/gap-4
- [x] 6.7 边框审计：替换所有 border-* 为 outline-2 outline-[#333333]
- [x] 6.8 字体验证：确认 zpix 覆盖 popups/inputs/textareas
- [x] 6.9 Focus 状态统一：所有可聚焦元素添加 outline-[#FFD93D] outline-2
- [x] 6.10 替换 animate-pulse（cubic-bezier）为 steps() 等效动画
