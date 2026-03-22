## Why

音频系统架构完整但"手感"不足以达到 Steam 精品独立游戏标准。三个核心问题：

1. **SFX 单薄无层次**：所有音效都是单振荡器频率扫频，听起来像功能测试音而非游戏音效。缺少多层叠加带来的"打击感"和"爽感"——这是 Steam 用户体验的最大差异化杠杆
2. **SFX 接线不完整**：16 个已定义事件中仅 7 个被触发，缺少场景过渡音效
3. **rest BGM 过短**：15 分钟长休息期间 ~50 秒的循环会产生听觉疲劳；其他场景（准备 2-3 分钟、审视 3 分钟、村庄主动交互）现有长度尚可接受
4. **音量控制粗糙**：只有一个 master volume，缺少 BGM/SFX 独立控制

专注时段设计上以安静为主（静音/白噪声/定时提醒），不需要 BGM，后续可通过授权曲库 DLC 扩展。

## What Changes

- **SFX 多层合成**：扩展 SfxPreset 支持多层（layers）定义，每层可设独立延迟偏移，让关键音效（monster-down、loot-drop、focus-complete 等）具备叠加层次感
- **SFX 接入补全**：将 9 个未触发的已定义 SFX 事件全部接入对应组件
- **新增 SFX 事件**：场景过渡音效（transition-in/transition-out）、装备交互（equip/unequip）、农场收获（farm-harvest）
- **SFX 参数全面调优**：按分类统一音量范围，正面反馈上升音高，负面反馈下降/噪声
- **rest BGM 扩写**：从 ~50 秒扩展到 2-3 分钟，环境音化设计减少循环感知
- **其他 BGM 适度扩写**：village 和 5 个 habitat 曲目从 ~40-60 秒扩展到 ~90 秒
- **BGM/SFX 独立音量**：SynthEngine 引入 bgmGain/sfxGain 子混音，settings store 持久化两套音量
- **Village BGM 自动播放**：主窗口 AudioContext 就绪后自动启动

## Capabilities

### New Capabilities

_无新增能力模块，所有改动在现有 spec 范围内。_

### Modified Capabilities

- `audio-bgm`: rest 曲目最低 2 分钟要求；村庄 BGM 自动播放；BGM 独立音量控制
- `audio-sfx`: 多层 SfxPreset 格式；新增 SFX 事件；SFX 独立音量控制；全事件接线要求
- `audio-synth-engine`: bgmGain/sfxGain 子混音路由

## Impact

- `src/lib/audio/engine/SynthEngine.ts` — 新增 bgmGain / sfxGain 子混音节点
- `src/lib/audio/types.ts` — SfxPreset 扩展 layers 字段，扩展 SfxEvent 类型
- `src/lib/audio/sfx/SfxManager.ts` — 多层播放逻辑，路由到 sfxGain
- `src/lib/audio/sfx/presets/*.ts` — 重写所有预设，增加层次
- `src/lib/audio/bgm/MmlPlayer.ts` — 路由到 bgmGain
- `src/lib/audio/bgm/tracks/rest.mml` — 大幅扩写
- `src/lib/audio/bgm/tracks/*.mml` — 适度扩写
- `src/lib/audio/AudioManager.ts` — setBgmVolume / setSfxVolume API，村庄 BGM 自动播放
- `src/stores/settingsStore.ts` — bgmVolume / sfxVolume 持久化
- `src/HuntApp.tsx` — 接入战斗/计时器 SFX + 场景过渡音效
- `src/components/**/*.tsx` — 接入 UI / 装备 / 农场 SFX
