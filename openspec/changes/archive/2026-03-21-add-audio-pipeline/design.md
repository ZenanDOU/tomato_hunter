## Context

Tomato Hunter 是一款 Tauri 2 + React 的像素风番茄钟猎人游戏。当前完全无音频——数据库和 store 中有 `soundEnabled` 占位，但无合成引擎、无音频文件、无播放逻辑。

游戏有 5 个栖息地，各自有鲜明的视觉主题（齿轮机械、空灵画廊、神秘图书馆、自然花园、诡异沼泽）。视觉系统使用 16×16 像素 sprite + zpix 字体，整体是复古 8-bit 像素美学。

音频系统需要：
- 与像素视觉风格音色统一（chiptune 风）
- SFX 和 BGM 共用合成内核，避免音色割裂
- 音频资产文本化（JSON 参数 / MML 乐谱），可由 Claude 自动生成和迭代

## Goals / Non-Goals

**Goals:**
- 建立统一合成内核，SFX 和 BGM 共享波形基底
- 实现参数化 SFX 系统，覆盖狩猎/计时器/UI 全场景
- 实现自定义 MML 方言解析器 + 4 声道序列播放器
- 建立栖息地风格映射表，作为生成和运行时双重锚点
- 提供 Claude prompt 模板，形成可重复的音频生成工作流
- 激活已有 soundEnabled 设置，添加音量控制

**Non-Goals:**
- 不实现实时音频录制或麦克风输入
- 不引入外部音频生成 API（Suno、ElevenLabs 等）
- 不支持导入 .mp3/.wav 等预制音频文件（纯合成）
- 不实现音频编辑器 UI（音频创作通过 Claude 管线完成）
- 不做 AudioWorklet 高性能优化（MVP 阶段主线程足够）

## Decisions

### D1: 统一合成内核而非分离引擎

**选择**: 自实现一个 Web Audio API 合成层，SFX 和 BGM 共用。

**替代方案**:
- A) 用 jsfxr 库做 SFX + 独立 MML 库做 BGM → 两套合成引擎，音色空间不同，听感割裂
- B) 全部用 Tone.js → 依赖体积大（~150KB min），API 过于复杂
- C) 自实现统一合成层 ✅

**理由**: 项目只需 4 种波形（方波、三角波、脉冲波、噪声），复杂度可控。统一内核确保 SFX 的"攻击命中"和 BGM 的旋律音色来自同一组振荡器，听感天然一致。零外部依赖。

### D2: 自定义 MML 方言最小子集

**选择**: 定义项目专用的 MML 方言，而非兼容现有 MML 标准。

**替代方案**:
- A) 兼容 MML 标准（如 MusicMacroLanguage wiki 规范）→ 语法庞大，解析复杂
- B) 用 MIDI JSON 代替 → 不够人类可读，Claude 生成不直观
- C) 最小自定义方言 ✅

**方言规范核心**:
```
声道: CH1(方波) CH2(方波) CH3(三角波) CH4(噪声)
音符: c d e f g a b (升半音 c+ 降半音 d-)
八度: o3-o6 (o4 = 中央C区)
音长: 4=四分 8=八分 16=十六分 2=二分 1=全音符 (附点用.)
休止: r
音量: v0-v15
速度: t60-t200 (BPM)
循环: [...]N (N次循环)
连音: & (tie)
```

**理由**: 语法小则 Claude 生成准确率高，解析器实现简单。锁死方言后写一份 prompt 模板，生成结果语法一致性有保障。

### D3: 栖息地风格映射表作为配置数据

**选择**: 维护一个 TypeScript 配置对象，同时服务于 Claude prompt 约束和运行时音频参数。

**结构**:
```typescript
type HabitatAudioProfile = {
  id: string;              // habitat ID
  mood: string[];          // 情绪关键词
  scale: string;           // 调式 (minor, dorian, lydian, major-pentatonic, whole-tone)
  bpmRange: [number, number];
  dominantWaveform: WaveformType;
  reverbLevel: number;     // 0-1
  signature: string;       // 特征描述 (金属节奏loop, 琶音, etc.)
};
```

**理由**: 单一数据源，避免 prompt 模板和代码中的映射不一致。Claude 生成时从该表提取约束参数。

### D4: 模块架构

```
src/lib/audio/
├── engine/
│   ├── SynthEngine.ts      # 统一合成内核 (OscillatorNode + GainNode + 包络)
│   ├── waveforms.ts        # 波形定义 (square, triangle, pulse, noise)
│   └── effects.ts          # 混响、延迟等效果链
├── sfx/
│   ├── SfxManager.ts       # 音效管理器 (加载参数、触发播放)
│   └── presets/             # 各场景音效参数 JSON
│       ├── hunt.json        # 攻击、命中、闪避、怪物倒下
│       ├── timer.json       # 阶段切换、倒计时提示、完成
│       └── ui.json          # 按钮点击、菜单切换、通知
├── bgm/
│   ├── MmlParser.ts         # MML 方言解析器 → Note 序列
│   ├── MmlPlayer.ts         # 4 声道序列播放器
│   └── tracks/              # MML 乐谱文件
│       ├── village.mml      # 村庄主题
│       ├── habitat-*.mml    # 5 个栖息地战斗曲
│       └── rest.mml         # 休息阶段
├── config/
│   ├── habitatProfiles.ts   # 栖息地风格映射表
│   └── audioConstants.ts    # 全局音频常量
└── index.ts                 # 统一导出 + AudioManager 门面
```

### D5: 音频生命周期管理

**播放策略**:
- **村庄**: 循环播放 village.mml，低音量背景
- **进入栖息地**: 淡出村庄曲，淡入对应 habitat-*.mml
- **专注阶段**: BGM 持续，节拍与 BPM 同步
- **休息阶段**: 切换到 rest.mml，轻柔氛围
- **窗口焦点丢失**: 降低音量但不停止（保持节奏感）

**AudioContext 管理**:
- 延迟创建：首次用户交互后初始化（浏览器自动播放策略）
- 单例模式：全应用共享一个 AudioContext
- 挂起/恢复：Tauri 窗口 blur/focus 时控制

## Risks / Trade-offs

**[MML 解析器复杂度超预期]** → 先实现最小子集（音符+八度+音长+速度+循环），连音/附点等高级特性渐进添加。MVP 可以先硬编码几段测试旋律。

**[Web Audio API 兼容性]** → Tauri 内嵌 WebView 版本固定，提前测试目标平台（Windows WebView2 基于 Chromium，支持完整）。macOS/Linux 需额外验证。

**[专注阶段 CPU 占用]** → 4 声道合成负载极低（远小于视频播放）。但需避免在 requestAnimationFrame 中频繁创建/销毁 AudioNode。用对象池复用振荡器。

**[Claude 生成质量不稳定]** → 通过严格的方言规范 + few-shot 示例 + 结构化 prompt 模板约束。生成后可通过解析器语法检查自动验证。

**[Tauri CSP 限制]** → Web Audio API 的 AudioBuffer 创建可能需要 `blob:` 或 `data:` URL。需在 `tauri.conf.json` 的 CSP 中添加对应策略。
