## ADDED Requirements

### Requirement: 间距 token 系统
设计系统 SHALL 定义一组像素对齐的间距 CSS 变量，供所有组件引用。

#### Scenario: 间距变量可用
- **WHEN** 任何组件渲染
- **THEN** 以下 CSS 变量可用：--space-xs (2px), --space-sm (4px), --space-md (8px), --space-lg (12px), --space-xl (16px)

### Requirement: 交互动效 token
设计系统 SHALL 定义一组动效相关的 CSS 变量，确保全局动效节奏一致。

#### Scenario: 动效变量可用
- **WHEN** 任何组件渲染
- **THEN** 以下 CSS 变量可用：--transition-fast (150ms), --transition-normal (200ms), --transition-slow (300ms), --ease-pixel (steps(4)), --ease-pixel-fine (steps(8))

### Requirement: PixelCard elevated 变体
PixelCard SHALL 支持 elevated 变体，提供增强的浮起阴影效果，用于表示活跃或重要状态。

#### Scenario: elevated 变体渲染
- **WHEN** PixelCard variant 为 "elevated"
- **THEN** box-shadow 为 4px 4px 0 0 rgba(0,0,0,0.2)，比默认阴影（2px）更深

#### Scenario: elevated 与 hover 组合
- **WHEN** elevated PixelCard 被 hover
- **THEN** 阴影进一步增大至 5px 5px 0 0 rgba(0,0,0,0.25)

### Requirement: PixelCard sunken 变体
PixelCard SHALL 支持 sunken 变体，提供内凹阴影效果，用于表示容器或背景区域。

#### Scenario: sunken 变体渲染
- **WHEN** PixelCard variant 为 "sunken"
- **THEN** box-shadow 为 inset 2px 2px 0 0 rgba(0,0,0,0.1)，outline 为 2px solid #CCCCCC

### Requirement: PixelBadge 组件
设计系统 SHALL 提供 PixelBadge 组件，用于显示计数或状态标签。

#### Scenario: 数字 badge 渲染
- **WHEN** PixelBadge 接收 count 属性
- **THEN** 渲染为 inline-flex 圆角矩形（border-radius 2px），背景色 tomato (#EE4433)，白色文字，最小宽度 20px，高度 18px，font-size 10px

#### Scenario: 颜色变体
- **WHEN** PixelBadge variant 为 "success"
- **THEN** 背景色为 grass (#5BBF47)

#### Scenario: 颜色变体 info
- **WHEN** PixelBadge variant 为 "info"
- **THEN** 背景色为 sky (#55BBEE)

### Requirement: PixelButton hover 增强
PixelButton 的 hover 状态 SHALL 提供统一的微位移反馈。

#### Scenario: 默认 hover 效果
- **WHEN** 鼠标悬停在非 disabled 的 PixelButton 上
- **THEN** 按钮 transform: translateY(-1px)，box-shadow 向下增加 1px，transition 时长 var(--transition-fast)

#### Scenario: disabled 无 hover
- **WHEN** 鼠标悬停在 disabled 的 PixelButton 上
- **THEN** 无视觉变化，cursor 为 not-allowed

### Requirement: Scanline 过渡动画关键帧
设计系统 SHALL 提供 scanline-enter 关键帧动画，用于内容区域的像素风入场效果。

#### Scenario: scanline-enter 动画
- **WHEN** 元素使用 animation: scanline-enter
- **THEN** 元素从 clip-path: inset(0 0 100% 0) 过渡到 clip-path: inset(0 0 0 0)，使用 steps(8) 时间函数，时长 200ms

### Requirement: slide-down 展开动画关键帧
设计系统 SHALL 提供 slide-down 关键帧动画，用于折叠区域的展开效果。

#### Scenario: slide-down 动画
- **WHEN** 元素使用 animation: slide-down
- **THEN** 元素从 max-height: 0 + opacity: 0 过渡到 max-height: var(--expand-height) + opacity: 1，时长 200ms
