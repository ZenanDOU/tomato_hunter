## 1. 引擎层：BGM/SFX 子混音路由

- [x] 1.1 在 SynthEngine 中新增 bgmGain / sfxGain 子混音节点，init() 时创建并路由到 masterGain
- [x] 1.2 新增 bgmDestination / sfxDestination getter，以及 setBgmGain() / setSfxGain() 方法
- [x] 1.3 修改 MmlPlayer.setupChannels()，outputGain 连接到 synthEngine.bgmDestination
- [x] 1.4 修改 SfxManager.play()，playTone 的输出路由到 synthEngine.sfxDestination（需扩展 playTone 参数或引入 destinationOverride）

## 2. SFX 多层预设系统

- [x] 2.1 在 types.ts 中定义 SfxLayer 接口，SfxPreset 添加可选 layers 字段
- [x] 2.2 在 types.ts 中扩展 UiSfxEvent 类型，添加 transition-in、transition-out、equip、unequip、farm-harvest
- [x] 2.3 修改 SfxManager.play()，支持 layers 多层调度（setTimeout + 逐层 playTone）

## 3. SFX 预设重写与新增

- [x] 3.1 重写 hunt.ts 预设：monster-down 改为 2-3 层（爆裂+上升+闪烁）；attack-hit 改为 2 层（打击+余音）；调整所有音量到 0.5-0.9 范围
- [x] 3.2 重写 timer.ts 预设：focus-complete 改为 2 层（上升+和弦）；调整所有音量到 0.3-0.7 范围
- [x] 3.3 重写 ui.ts 预设：调整所有音量到 0.2-0.4 范围；新增 transition-in、transition-out、equip、unequip、farm-harvest 预设

## 4. SFX 接线 — 战斗与计时器

- [x] 4.1 在 HuntApp.tsx 中接入 attack-miss（攻击未命中）、monster-down（怪物击杀）、monster-part-break（部位破坏）
- [x] 4.2 在 HuntApp.tsx 中接入 phase-end（阶段结束）、focus-complete（专注完成）
- [x] 4.3 在 HuntApp.tsx 中接入 transition-in / transition-out（阶段过渡时触发）

## 5. SFX 接线 — UI 与交互

- [x] 5.1 在 Workshop.tsx 中接入 equip / unequip
- [x] 5.2 在 TomatoFarm.tsx 中接入 farm-harvest（改为在 HuntApp 番茄获得时触发）
- [x] 5.3 在相关组件中接入 menu-open / menu-close（面板打开/关闭）
- [x] 5.4 在相关组件中接入 notification / error（预设就绪，无通知系统暂不接线）

## 6. BGM 扩写

- [x] 6.1 扩写 rest.mml — 环境音化设计，tempo 62，全音符为主，ABA' 三段式
- [x] 6.2 扩写 village.mml — 丰富旋律与动态变化，ABA' 三段式
- [x] 6.3 扩写 habitat-gear-workshop.mml — ABA' 三段式
- [x] 6.4 扩写 habitat-withered-gallery.mml — ABA' 三段式
- [x] 6.5 扩写 habitat-forgotten-library.mml — ABA' 三段式
- [x] 6.6 扩写 habitat-abandoned-garden.mml — ABA' 三段式
- [x] 6.7 扩写 habitat-mist-swamp.mml — ABA' 三段式

## 7. 音量控制与 Village BGM

- [x] 7.1 扩展 settingsStore：新增 bgmVolume / sfxVolume 字段，fetchSettings 加载，persist 到数据库
- [x] 7.2 AudioManager 暴露 setBgmVolume() / setSfxVolume() 方法，连通到 synthEngine 子混音
- [x] 7.3 修改 AudioManager.init()，主窗口 AudioContext 就绪后自动 playBgm('village')
- [x] 7.4 Settings UI 中添加 BGM/SFX 独立音量滑块（复用 PixelVolumeSlider 组件）
