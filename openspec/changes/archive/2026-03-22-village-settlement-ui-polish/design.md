## Context

Village（VillageLayout + DailyPlanBoard + HuntBoard + Workshop）和 Settlement（Settlement + RestScreen）是应用的两个核心交互界面。当前使用 Tailwind v4 + 自定义 CSS 变量 + Zpix 像素字体构建，已有 PixelButton/PixelCard/PixelProgressBar 等基础组件。

现状问题：
- 卡片间距不统一，部分区域过于拥挤（尤其 DailyPlanBoard 的三个分区）
- hover 状态和过渡动画几乎缺失，操作缺乏即时反馈
- 信息密度不合理：已完成任务占据大量空间，空区域仍然显示标题
- Settlement 动画节奏单一，缺少击败动画和战利品入场的层次感

## Goals / Non-Goals

**Goals:**
- 提升 Village 各标签页的视觉呼吸感和信息层级
- 为所有可交互元素添加一致的 hover/active 微动效
- 优化信息密度：智能折叠/隐藏空区域，突出重要信息
- 增强 Settlement 结算动画的戏剧性和节奏感
- 扩展设计系统以支持新的交互模式

**Non-Goals:**
- 不改变任何功能逻辑或数据流
- 不引入新的 npm 依赖（纯 CSS + React 实现）
- 不重构组件层级结构或状态管理
- 不改动 Tauri 后端或数据库
- 不改动音频系统

## Decisions

### D1: 间距系统 — 使用 CSS 变量定义间距 token

**选择**: 在 index.css 中定义 `--space-xs/sm/md/lg/xl` 变量，Village 组件统一引用。

**备选**: 直接使用 Tailwind spacing — 但像素风需要精确的 2/4/8/12/16px 步进，Tailwind 的 rem 体系不够精确。

**理由**: 像素游戏的间距必须是整数像素，CSS 变量可确保全局一致且易于调整。

### D2: 动效方案 — CSS transitions + @keyframes

**选择**: hover 效果用 CSS transition（150ms ease），入场/强调动效用 @keyframes + steps() 保持像素感。

**备选**: framer-motion — 但引入新依赖，且 spring 动画不符合像素美学。

**理由**: 项目已有成熟的 @keyframes 动画基础（loot-enter, sparkle, hit-shake 等），扩展这套体系最自然。steps() 时间函数天然产生像素风跳帧效果。

### D3: 信息密度策略 — 渐进式展开

**选择**:
- 已讨伐区默认折叠，仅显示计数 badge
- 空区域（如未鉴定区为空时）自动隐藏标题
- HuntBoard 卡片详情保持已有的展开/折叠机制

**备选**: 虚拟滚动 — 过度工程，当前任务量不需要。

**理由**: 日常使用中用户关注的是进行中和待战任务，已完成的只需偶尔查看。

### D4: PixelCard 变体扩展

**选择**: 新增 `elevated`（增强阴影 4px，用于活跃状态）和 `sunken`（内阴影，用于容器/背景区域）变体。

**理由**: 当前只有 dark/cloud/cream 背景变体，缺少深度层级表达。活跃任务需要从列表中"浮起"，而分区容器需要"凹陷"效果来建立层级。

### D5: Settlement 动画编排 — 分阶段顺序播放

**选择**: 击杀确认 → 怪物击败动画(300ms) → 战利品逐个入场(stagger 100ms) → 庆祝粒子。各阶段使用 setTimeout 编排。

**备选**: CSS animation-delay 链 — 但无法响应用户跳过操作。

**理由**: setTimeout 编排允许用户点击跳过剩余动画，直接进入结果界面。

## Risks / Trade-offs

- **[动画性能]** 过多 CSS 动画可能在低端设备卡顿 → 使用 `transform` 和 `opacity` 属性动画（GPU 加速），避免 layout 属性动画
- **[视觉一致性]** 新增动效可能与现有静态元素风格冲突 → 所有动效统一使用 steps() 时间函数保持像素跳帧感
- **[过度设计]** 微动效可能让界面显得"花哨" → 严格控制动画时长（hover 150ms, 入场 300ms, 强调 500ms），保持克制
