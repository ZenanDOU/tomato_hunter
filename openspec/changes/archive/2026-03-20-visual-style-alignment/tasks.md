## 1. CSS 主题变量替换

- [x] 1.1 更新 src/styles/index.css @theme：替换所有色板变量为番茄列车色板（sky #55BBEE, grass #5BBF47, tomato #EE4433, sunny #FFD93D, cloud #FFFFFF, pixel-black #333333, orange #FF8844, cream #FFF8E8, deep-blue #3366AA, pink #FFCCDD）
- [x] 1.2 更新 pixel-border class：改为 outline 2px solid #333333 + box-shadow 2px 2px 0 rgba(0,0,0,0.2)，移除 inset shadow
- [x] 1.3 添加 pixel-box-light / pixel-box-dark 变体
- [x] 1.4 确保所有现有组件中引用的 --village-bg, --village-warm, --monster-bg 等变量映射到新色板

## 2. 设计系统组件

- [x] 2.1 创建 PixelButton 组件：variant prop（default/cta/danger/success），disabled 态，五态样式（对齐番茄列车按钮规范）
- [x] 2.2 创建 PixelCard 组件：2px 像素黑描边 + 右下阴影，background prop（cloud/cream/dark），padding 变体（sm/md/lg）
- [x] 2.3 创建 PixelProgressBar 组件：替代现有 ProgressBar，分段纯色填充，2px 描边，color prop（tomato/grass/orange）
- [x] 2.4 替换所有原始 button 元素为 PixelButton（VillageLayout tabs, Inbox, HuntList, DailyPlanBoard, TaskForm, Workshop）
- [x] 2.5 替换所有卡片容器为 PixelCard（Inbox items, HuntList items, DailyPlanBoard entries, Workshop items, TomatoSanctuary entries）
- [x] 2.6 替换所有进度条为 PixelProgressBar（HuntList HP bar, DailyPlanBoard progress, FocusPhase timer bar）

## 3. 村庄视觉统一

- [x] 3.1 VillageLayout 背景改为天空蓝 #55BBEE，header 使用纯色背景（无渐变）
- [x] 3.2 Tab 导航样式：选中态番茄红填充 + 白字，未选中态云朵白 + 像素黑字
- [x] 3.3 村庄空区域添加像素云朵装饰元素（CSS 伪元素或小组件）
- [x] 3.4 Inbox, HuntList, DailyPlanBoard, Workshop, TomatoSanctuary 页面标题统一像素字体 + 番茄列车配色

## 4. 狩猎窗口风格统一

- [x] 4.1 PrepPhase 背景改为天空蓝 #55BBEE，文字用像素黑，按钮用 PixelButton
- [x] 4.2 FocusPhase 背景改为深蓝 #3366AA，进度条用 PixelProgressBar（番茄红），文字白色
- [x] 4.3 ReviewPhase 背景改为米白 #FFF8E8，文字像素黑，提交按钮用 PixelButton CTA
- [x] 4.4 Settlement 背景改为云朵白，标题用阳光黄强调，战利品用 PixelCard
- [x] 4.5 RestScreen 背景改为薄荷绿 #88DDAA 调，体现休息的安宁感
- [x] 4.6 MonsterDiscoveryCard 更新为番茄列车风格（深色怪物区保留，但边框改为像素黑 2px）
- [x] 4.7 Lore 弹窗更新为番茄列车风格

## 5. 验证

- [x] 5.1 TypeScript 编译通过
- [x] 5.2 全界面视觉一致性检查：村庄 5 个 tab + 狩猎 4 个阶段 + 弹窗
- [x] 5.3 对比度检查：所有文字/背景组合满足 4.5:1
- [x] 5.4 像素风纯度检查：无渐变、描边统一、色板范围内
