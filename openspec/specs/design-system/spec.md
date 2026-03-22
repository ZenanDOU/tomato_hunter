## ADDED Requirements

### Requirement: Unified color palette from Tomato Train brand
The system SHALL define a CSS theme using the Tomato Train color palette as CSS variables, applied globally.

#### Scenario: Theme variables available
- **WHEN** any component renders
- **THEN** the following CSS variables are available: --color-sky (#55BBEE), --color-grass (#5BBF47), --color-tomato (#EE4433), --color-sunny (#FFD93D), --color-cloud (#FFFFFF), --color-pixel-black (#333333), --color-orange (#FF8844), --color-cream (#FFF8E8), --color-deep-blue (#3366AA), --color-pink (#FFCCDD)

### Requirement: PixelButton component with five states
The system SHALL provide a PixelButton component implementing Normal, Hover, Pressed, Disabled, and CTA states with pixel-style borders.

#### Scenario: CTA button style
- **WHEN** PixelButton variant is "cta"
- **THEN** fill is #EE4433, border is 2px #333333, text is white

#### Scenario: Disabled button style
- **WHEN** PixelButton is disabled
- **THEN** fill is #CCCCCC, border is 2px #999999, text is #999999

### Requirement: PixelCard component
The system SHALL provide a PixelCard container with 2px pixel-black border, right-bottom shadow, and configurable background (cloud white or cream).

#### Scenario: Card with shadow
- **WHEN** PixelCard renders
- **THEN** it has 2px #333333 outline and 2px right-bottom shadow

### Requirement: PixelProgressBar component
The system SHALL provide a PixelProgressBar with segmented pure-color fill (no gradients), 2px border, pixel-style appearance.

#### Scenario: HP progress bar
- **WHEN** PixelProgressBar shows monster HP
- **THEN** fill color is tomato red #EE4433, background is white, border is 2px #333333

### Requirement: Audio volume slider component
The system SHALL provide a PixelVolumeSlider component with pixel-style appearance consistent with the design system. The slider SHALL control master audio volume from 0 to 100, displayed as a segmented bar matching PixelProgressBar aesthetics.

#### Scenario: Volume slider renders in pixel style
- **WHEN** PixelVolumeSlider renders
- **THEN** it displays a segmented bar with 2px #333333 border, fill color #55BBEE, and pixel-style thumb

#### Scenario: Volume change updates audio
- **WHEN** user drags the volume slider to 60
- **THEN** the master audio volume is set to 0.6 and the setting persists to the database

### Requirement: Sound toggle button
The system SHALL provide a sound toggle integrated into the settings UI that enables/disables all audio. The toggle SHALL use the existing soundEnabled database setting and visually indicate current state.

#### Scenario: Toggle sound off
- **WHEN** user clicks the sound toggle while sound is enabled
- **THEN** soundEnabled is set to false, all audio stops, and the toggle shows muted state (🔇)

#### Scenario: Toggle sound on
- **WHEN** user clicks the sound toggle while sound is disabled
- **THEN** soundEnabled is set to true, audio resumes, and the toggle shows active state (🔊)

### Requirement: 32x32 animated pixel sprites
The system SHALL render monster sprites at 32x32 resolution with multi-frame animations: idle (2 frames at 4fps loop), hit (1 frame triggered on damage), defeat (2 frames triggered on HP=0). The canonical SpriteData type SHALL be defined in src/types/index.ts.

#### Scenario: Monster idle animation
- **WHEN** a monster sprite is displayed in PrepPhase
- **THEN** it renders at 32x32 with a 2-frame breathing/floating loop at 4fps

#### Scenario: Fallback for missing sprites
- **WHEN** a species has no 32x32 SpriteData
- **THEN** the system falls back to legacy 16x16 at 2x scale, then to emoji character

### Requirement: Expanded color palette per habitat
The system SHALL support 8-12 color palettes per habitat for sprites, up from 4-6. Palette indices use numbers (not single-char encoding) to support palettes exceeding 10 colors.

#### Scenario: Palette with 12 colors renders correctly
- **WHEN** a sprite uses palette index 11
- **THEN** the correct 12th color from the palette array is rendered

### Requirement: Visual consistency - approved color palette
The system SHALL only use approved palette colors in UI components. Core UI: sky #55BBEE, tomato #EE4433, sunny #FFD93D, grass #5BBF47, cloud #FFFFFF, pixel-black #333333, orange #FF8844, cream #FFF8E8, deep-blue #3366AA, pink #FFCCDD. Extended: light-blue #DDEEFF, mint #88DDAA, monster-bg #443355. Functional grays: #CCCCCC, #999999, #AAAAAA, #EEEEEE, #666666.

#### Scenario: No Tailwind default colors in UI
- **WHEN** any UI component renders
- **THEN** no Tailwind default number-scale colors (stone-*, amber-*, red-*, blue-*, purple-*, green-*) are used

### Requirement: Unified pixel focus states
All focusable elements SHALL use a pixel-style focus indicator: `outline-[#FFD93D] outline-2` (sunny yellow), replacing browser default focus rings.

#### Scenario: Button receives focus
- **WHEN** a PixelButton receives keyboard focus
- **THEN** a 2px sunny yellow (#FFD93D) outline appears around it

### Requirement: Remove non-pixel-style ProgressBar
The system SHALL remove or replace the legacy ProgressBar.tsx component that uses non-pixel styles (rounded corners, Tailwind default colors, smooth transitions). PixelProgressBar SHALL be the only progress bar component.

#### Scenario: No rounded progress bars
- **WHEN** any progress indication is shown
- **THEN** it uses PixelProgressBar with square corners and pixel-border styling

### Requirement: Spotlight overlay component
The system SHALL provide a SpotlightOverlay component that renders a semi-transparent dark overlay with a rectangular cutout around a target element. The component SHALL use the pixel-style design system aesthetics.

#### Scenario: Spotlight renders around target
- **WHEN** SpotlightOverlay receives a target element reference
- **THEN** a dark overlay (rgba(0,0,0,0.7)) covers the entire viewport with a rectangular cutout matching the target element's bounding rect plus 8px padding

#### Scenario: Spotlight repositions on resize
- **WHEN** the window is resized while SpotlightOverlay is active
- **THEN** the cutout position updates to match the target element's new position

### Requirement: Pixel tooltip component
The system SHALL provide a PixelTooltip component with pixel-style border (2px #333333), cream background (#FFF8E8), and configurable arrow direction. The tooltip SHALL support title text, description text, and action buttons.

#### Scenario: Tooltip renders with content
- **WHEN** PixelTooltip is rendered with title "侦查" and description "在这里创建任务"
- **THEN** it displays a pixel-bordered box with title in bold, description below, and 2px pixel-black border with right-bottom shadow

#### Scenario: Tooltip arrow points to target
- **WHEN** PixelTooltip position is "bottom" relative to target
- **THEN** an upward-pointing pixel arrow appears at the top edge of the tooltip, pointing toward the target element

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
