## ADDED Requirements

### Requirement: DailyPlanBoard 分区间距与视觉分隔
DailyPlanBoard 的三个分区（进行中、待战、已讨伐）SHALL 使用统一的 `--space-md`（8px）间距分隔，每个分区 SHALL 使用 sunken 变体 PixelCard 作为容器以建立视觉层级。

#### Scenario: 分区间距一致
- **WHEN** DailyPlanBoard 显示多个分区
- **THEN** 每个分区之间的间距为 8px，分区内部内容与边框间距为 8px

#### Scenario: 分区使用凹陷容器
- **WHEN** 进行中/待战/已讨伐分区渲染
- **THEN** 每个分区使用 PixelCard bg="sunken" 包裹，产生内阴影效果

### Requirement: 已讨伐区默认折叠并显示摘要
已讨伐分区 SHALL 默认折叠状态，仅显示标题和已击杀任务数量 badge。点击标题 SHALL 展开完整列表。

#### Scenario: 默认折叠状态
- **WHEN** DailyPlanBoard 渲染且存在已讨伐任务
- **THEN** 已讨伐分区仅显示标题行 "已讨伐" 和 PixelBadge 显示数量（如 "3"），列表内容不可见

#### Scenario: 展开已讨伐区
- **WHEN** 用户点击已讨伐分区标题
- **THEN** 列表内容以 slide-down 动画展开，动画时长 200ms

#### Scenario: 无已讨伐任务时隐藏
- **WHEN** 当日无已讨伐任务
- **THEN** 已讨伐分区整体不渲染

### Requirement: HuntBoard 空状态智能隐藏
HuntBoard 中无内容的分区 SHALL 自动隐藏标题和容器，仅保留有内容的分区。

#### Scenario: 未鉴定区为空
- **WHEN** 没有 unidentified 状态的任务
- **THEN** 未鉴定分区标题和容器不渲染，就绪分区自动占据完整空间

#### Scenario: 就绪区为空
- **WHEN** 没有 ready/hunting 状态的任务
- **THEN** 就绪分区显示空状态提示 "还没有就绪的任务，去鉴定一些吧"

### Requirement: HuntBoard 卡片呼吸感
HuntBoard 中的任务卡片 SHALL 使用统一的间距和视觉节奏，每张卡片之间 SHALL 有 `--space-sm`（4px）间距。

#### Scenario: 卡片间距
- **WHEN** 就绪分区显示多个任务卡片
- **THEN** 每张卡片之间的间距为 4px

#### Scenario: 活跃任务卡片浮起
- **WHEN** 任务状态为 hunting（进行中）
- **THEN** 该卡片使用 elevated 变体 PixelCard，阴影增大至 4px，视觉上从列表中"浮起"

### Requirement: Workshop 材料库存紧凑网格
Workshop 的材料库存 SHALL 使用紧凑的网格布局替代当前的 flex-wrap 布局，每个材料项以图标+数量的方式显示。

#### Scenario: 网格布局
- **WHEN** 材料库存区渲染
- **THEN** 材料项以 grid 布局排列，每行 4-6 个（根据容器宽度自适应），每项显示图标和数量

#### Scenario: 材料数量为零
- **WHEN** 某材料数量为 0
- **THEN** 该材料项以半透明样式显示（opacity 0.4）

### Requirement: VillageLayout 标签页切换动效
标签页内容切换 SHALL 附带像素风过渡动画，新内容以 scanline 方式从上到下刷新显示。

#### Scenario: 切换标签页
- **WHEN** 用户点击不同的标签页
- **THEN** 旧内容淡出（100ms），新内容以从上到下的 scanline 扫描效果入场（200ms，使用 steps(8) 时间函数）

#### Scenario: 首次渲染无动画
- **WHEN** VillageLayout 首次挂载
- **THEN** 默认标签页内容直接显示，不播放过渡动画

### Requirement: 可交互元素 hover 反馈
Village 中所有可交互元素（按钮、卡片、链接）SHALL 具有一致的 hover 视觉反馈。

#### Scenario: 按钮 hover
- **WHEN** 鼠标悬停在 PixelButton 上
- **THEN** 按钮向上偏移 1px（transform: translateY(-1px)），阴影增大 1px，过渡时间 150ms

#### Scenario: 卡片 hover
- **WHEN** 鼠标悬停在可交互的 PixelCard 上
- **THEN** 卡片边框颜色从 pixel-black 变为当前主题色（如 sky），过渡时间 150ms

#### Scenario: 标签页 hover
- **WHEN** 鼠标悬停在非活跃标签页上
- **THEN** 标签页背景色过渡至 sunny 色 (#FFD93D)，过渡时间 150ms
