## Why

游戏当前完全没有音频体验——无音效、无配乐。作为一款像素风番茄钟猎人游戏，声音反馈对于狩猎沉浸感、专注节奏感、栖息地氛围区分都至关重要。同时，团队希望建立一条 Claude 可驱动的文本化音频生成管线（参数 JSON → SFX，MML 乐谱 → BGM），让音频资产可以像代码一样版本管理和自动迭代。

## What Changes

- 新增统一合成内核（Unified Synth Engine）：基于 Web Audio API，提供方波、三角波、脉冲波、噪声四种基础波形，SFX 和 BGM 共用同一套振荡器，保证音色一致性
- 新增参数化音效系统：参考 jsfxr 参数模型，通过 JSON 参数集定义每个游戏事件的音效，单次触发合成
- 新增 MML 配乐系统：自实现轻量 MML 解析器 + 序列播放器，锁定自定义 MML 方言最小子集，4 声道（方波×2 + 三角波 + 噪声）
- 新增栖息地风格映射表：将 5 个栖息地的情绪关键词映射到具体音乐参数约束（调式、BPM、主导波形、混响、特征模式），作为 Claude 生成和运行时配置的共用锚点
- 新增 Claude 音频生成 prompt 模板：包含 MML 方言规范 + 风格映射约束，确保生成结果语法和风格一致
- 激活已有 `soundEnabled` 设置：连接到实际音频播放控制，添加音量调节

## Capabilities

### New Capabilities
- `audio-synth-engine`: 统一合成内核——Web Audio API 封装层，提供波形生成、包络控制、效果处理，SFX 和 BGM 共用
- `audio-sfx`: 参数化音效系统——JSON 参数驱动的游戏事件音效，覆盖狩猎/计时器/UI 全场景
- `audio-bgm`: MML 配乐系统——自定义方言解析器 + 4 声道序列播放器 + 栖息地主题曲
- `audio-style-mapping`: 栖息地风格映射——情绪关键词到音乐参数的映射表，Claude 生成锚点
- `audio-generation-pipeline`: Claude 驱动的音频生成管线——prompt 模板 + MML 方言规范 + 参数化工作流

### Modified Capabilities
- `design-system`: 新增音频控制 UI 组件（音量滑块、静音切换），接入已有 soundEnabled 设置

## Impact

- **前端新增模块**: `src/lib/audio/` 目录，包含合成引擎、SFX 管理器、MML 解析器、BGM 播放器
- **音频资产**: `src/assets/audio/` 目录，存放 SFX 参数 JSON 和 MML 乐谱文本文件
- **Store 变更**: `useSettingsStore` 扩展音量控制；可能新增 `useAudioStore` 管理播放状态
- **依赖**: 无新外部依赖，纯 Web Audio API 实现
- **性能**: 合成引擎运行在 AudioWorklet/主线程，需注意计时器专注阶段的 CPU 占用
- **Tauri 配置**: CSP 可能需要允许 `blob:` URL（用于 AudioBuffer 创建）
