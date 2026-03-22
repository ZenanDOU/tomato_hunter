## Context

当前音频引擎（SynthEngine + MmlPlayer + SfxManager）功能完整，但内容和接线层存在明显差距：

- **SFX 无层次感**：每个音效 = 1 个 `playTone()` 调用（1 个振荡器 + 频率扫频 + ADSR），听起来像合成器测试音
- **9/16 SFX 事件从未被触发**：attack-miss、monster-down、monster-part-break、phase-end、focus-complete、menu-open、menu-close、notification、error
- **无场景过渡音效**：阶段切换（村庄→准备→专注→审视→休息）硬切无声
- **rest BGM ~50 秒循环**：15 分钟长休息重复感严重
- **单一 master volume**：无法分别调节 BGM 和 SFX

关键约束：专注时段不需要 BGM（设计为安静/白噪声/定时提醒），未来通过 DLC 曲库扩展。因此 BGM 优化集中在非专注场景。

## Goals / Non-Goals

**Goals:**
- SFX 具备"游戏感"：关键音效多层叠加，短交互音效干脆利落
- 所有已定义 SFX 事件 100% 接入游戏流程
- 新增场景过渡和交互音效，消除"硬切"感
- rest BGM 扩展到 2-3 分钟，环境音化降低循环感知
- 其他 BGM 适度扩展到 ~90 秒
- BGM/SFX 独立音量控制，持久化到数据库
- 村庄 BGM 自动播放

**Non-Goals:**
- 不改变 4 声道 MML 架构或波形类型
- 不为专注时段添加 BGM
- 不实现动态 BGM 分层或自适应音乐系统
- 不修改 MmlParser 语法

## Decisions

### D1: 多层 SFX 预设格式

**方案**：扩展 `SfxPreset` 接口，新增可选 `layers` 字段。当存在 layers 时，每层是一个独立的 tone 参数 + `delay` 偏移（毫秒）。`SfxManager.play()` 对每层分别调用 `synthEngine.playTone()`，用 `setTimeout` 调度延迟层。

```typescript
interface SfxLayer {
  delay: number;         // ms offset from trigger
  waveform: WaveformType;
  frequencyStart: number;
  frequencyEnd: number;
  duration: number;
  envelope: Envelope;
  volume: number;
  dutyCycle?: number;
}

interface SfxPreset {
  // 单层（向后兼容）
  waveform: WaveformType;
  frequencyStart: number;
  frequencyEnd: number;
  duration: number;
  envelope: Envelope;
  volume: number;
  dutyCycle?: number;
  // 多层（可选）
  layers?: SfxLayer[];
}
```

播放逻辑：如果 `layers` 存在，忽略顶层参数，按层播放；否则按原有逻辑播放。每层独立消耗一个 voice slot，但由于层持续时间短（<0.5s），voice stealing 的实际影响极小。

**替代方案**：在音频引擎层面实现 multi-oscillator voice——改动更大、更复杂，不值得。

**理由**：最小侵入性修改，保持引擎简单，让复杂性在预设数据层面解决。

### D2: 音效设计原则

| 音效类别 | 设计目标 | 典型层数 | 音量范围 |
|---|---|---|---|
| **Hunt 关键**（monster-down, loot-drop）| 史诗感、多层叠加 | 2-3 层 | 0.5-0.9 |
| **Hunt 常规**（attack-hit, attack-miss）| 打击感、干脆 | 1-2 层 | 0.5-0.8 |
| **Timer**（phase-start/end, focus-complete）| 清晰信号 | 1-2 层 | 0.3-0.7 |
| **UI**（button-click, menu-open）| 轻柔、不抢注意力 | 1 层 | 0.2-0.4 |
| **过渡**（transition-in/out）| 空间感、whoosh | 1 层 | 0.3-0.5 |

音高语义：
- 正面反馈（monster-down, loot-drop, focus-complete, equip）→ 上升音高
- 负面/警告（attack-miss, error, countdown-warning）→ 下降音高或噪声
- 中性交互（button-click, menu-open/close）→ 短促、音高微变

### D3: BGM/SFX 独立音量路由

**方案**：在 SynthEngine 的 `masterGain` 下新增两个子混音节点：

```
AudioContext → masterGain → bgmGain → destination
                          → sfxGain → destination
```

不对——应该是：

```
bgmGain ─┐
          ├─ masterGain → AudioContext.destination
sfxGain ─┘
```

- `MmlPlayer.outputGain` 连接到 `synthEngine.bgmGain`（而非 `synthEngine.destination`）
- `SfxManager` 的 `playTone()` 调用传入 `synthEngine.sfxGain` 作为目标
- `masterGain` 控制全局音量 + 开关
- `bgmGain` / `sfxGain` 分别控制子通道音量

**Settings Store 扩展**：
- 新增 `bgm_volume`、`sfx_volume` 两个 setting key（0-100 整数）
- 默认值：bgm_volume = 60, sfx_volume = 80
- 现有 `volume` key 保留作为 master volume

### D4: rest BGM 环境音化策略

rest.mml 扩写方向：
- tempo 降低到 60-65（极慢）
- CH1/CH2 使用长音符（全音符/二分音符）+ 大量休止
- CH3 bass 用全音符缓慢移动
- CH4 噪声极稀疏（每 4-8 小节一个轻声点缀）
- 动态从 v6 到 v3 缓慢变化
- 目标效果：接近环境音/冥想音乐，循环点不明显

### D5: 场景过渡音效设计

在阶段切换时播放短暂的过渡 SFX：
- `transition-in`：噪声 whoosh + 上升扫频，0.25s，模拟"进入"
- `transition-out`：下降扫频 + 淡出噪声，0.2s，模拟"离开"

触发点：
- 准备→专注：transition-out（离开准备阶段的空间感）
- 专注→审视：transition-in（回到交互界面）
- 审视→结算：无额外音效（已有 attack-hit + loot-drop）
- 结算→休息：transition-out（进入休息空间）
- 休息→下一轮准备：transition-in

### D6: Village BGM 启动

在 `AudioManager.init()` 的 `bindInitOnInteraction` 回调中，检测当前是否为主窗口（非 hunt 窗口），如是则调用 `playBgm('village')`。

检测方式：通过 `window.__TAURI_INTERNALS__` 或 URL hash/search params 区分窗口。

## Risks / Trade-offs

- **[多层 SFX voice 竞争]** 3 层 SFX 瞬间消耗 3 个 voice slot → 但层持续时间短（<0.5s），cleanupFinished() 会快速回收；worst case voice stealing 只影响同时播放的旧 SFX
- **[BGM/SFX 路由重构]** MmlPlayer 和 SfxManager 的输出目标需要改变 → 改动集中在连接点，不影响播放逻辑
- **[rest.mml 环境音化]** 极慢极安静的曲目可能让用户觉得"没有音乐" → 可以通过维持 CH3 bass 的存在感来兜底
- **[Settings 数据迁移]** 新增 bgm_volume/sfx_volume key → 使用 INSERT OR IGNORE 默认值，无需 migration
