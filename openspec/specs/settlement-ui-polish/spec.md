## ADDED Requirements

### Requirement: Settlement 击杀确认动画编排
击杀确认流程 SHALL 按阶段顺序播放动画：怪物击败 → 战利品入场 → 庆祝效果，形成完整的戏剧节奏。

#### Scenario: 怪物击败动画
- **WHEN** 用户确认击杀
- **THEN** 怪物精灵播放 defeat 动画（抖动 + 淡出，300ms），然后自动进入战利品展示

#### Scenario: 战利品逐个入场
- **WHEN** 怪物击败动画完成
- **THEN** 战利品项以 stagger 方式从下方弹入（每项间隔 100ms），入场动画使用 steps(4) 时间函数保持像素感

#### Scenario: 庆祝粒子
- **WHEN** 所有战利品展示完毕
- **THEN** 播放 sparkle 庆祝粒子效果（500ms），金色粒子从中心向四周扩散

#### Scenario: 用户跳过动画
- **WHEN** 用户在动画播放期间点击任意位置
- **THEN** 所有动画立即完成，直接显示最终结果界面

### Requirement: Settlement 视觉层级优化
Settlement 界面 SHALL 使用更清晰的视觉层级区分不同信息区域。

#### Scenario: 标题区域
- **WHEN** Settlement 显示击杀庆祝
- **THEN** 标题使用 sunny 色背景条 + pixel-border，文字使用 deep-blue 色

#### Scenario: 战利品区域
- **WHEN** 战利品列表渲染
- **THEN** 每个战利品项使用 cream 背景 PixelCard，图标在左、名称和数量在右

#### Scenario: 首次发现奖励突出
- **WHEN** 战利品包含首次击杀奖励
- **THEN** 首次奖励项使用 sunny 色边框 + 闪烁动画（pulse 1s infinite steps(2)），与普通战利品视觉区分

### Requirement: RestScreen 呼吸感背景
RestScreen SHALL 使用缓慢变化的像素背景动效营造休息氛围。

#### Scenario: 背景动效
- **WHEN** RestScreen 渲染
- **THEN** PixelBackground 组件以 "rest" 场景渲染，添加缓慢的色调循环动画（mint → light-blue → mint，周期 8s，steps(4)）

#### Scenario: 进度条呼吸动画
- **WHEN** 休息计时器运行中
- **THEN** PixelProgressBar 的填充色以 pulse 方式轻微明暗变化（opacity 0.8-1.0，周期 2s）

### Requirement: RestScreen 信息布局优化
RestScreen 的信息卡片 SHALL 使用更紧凑的布局，减少不必要的空白。

#### Scenario: 健康提示卡片
- **WHEN** 健康提示渲染
- **THEN** 使用 cream 背景 PixelCard，内容紧凑排列（图标 + 标题同行，提示文本在下方），最大宽度 320px 居中

#### Scenario: 下一任务预览
- **WHEN** 有下一个待战任务
- **THEN** 在休息界面底部显示简洁的预览条：怪物图标 + 任务名称 + 预估时间，使用 cloud 背景
