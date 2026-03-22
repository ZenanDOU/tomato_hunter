import { habitatProfiles } from '../config';
import type { SfxCategory } from '../types';

/**
 * Generate a Claude prompt for creating SFX presets.
 */
export function renderSfxPrompt(category: SfxCategory, habitatId?: string): string {
  const habitatContext = habitatId && habitatProfiles[habitatId]
    ? `
## 栖息地上下文 (影响音色风格)

**${habitatProfiles[habitatId].name}**
- 情绪: ${habitatProfiles[habitatId].mood.join(', ')}
- 主导波形: ${habitatProfiles[habitatId].dominantWaveform}
- 混响: ${habitatProfiles[habitatId].reverbLevel}
`
    : '';

  const events: Record<SfxCategory, string[]> = {
    hunt: ['attack-hit', 'attack-miss', 'monster-down', 'monster-part-break', 'loot-drop'],
    timer: ['phase-start', 'phase-end', 'countdown-warning', 'focus-complete', 'break-start'],
    ui: ['button-click', 'menu-open', 'menu-close', 'notification', 'error'],
  };

  return `你是一个 8-bit 音效设计师。请为像素风番茄钟猎人游戏创作音效参数。

## SFX Preset JSON Schema

每个音效必须符合以下 TypeScript 类型:

\`\`\`typescript
interface SfxPreset {
  waveform: 'square' | 'triangle' | 'pulse' | 'noise';
  frequencyStart: number;    // Hz (20-4000)
  frequencyEnd: number;      // Hz (20-4000)
  duration: number;          // seconds (0.01-2.0)
  envelope: {
    attack: number;   // seconds (0.001-0.5)
    decay: number;    // seconds (0.01-1.0)
    sustain: number;  // 0-1
    release: number;  // seconds (0.01-1.0)
  };
  pitchSweep?: number;       // semitones/s (optional)
  volume: number;            // 0-1
  dutyCycle?: number;        // 0-1, for pulse wave only
}
\`\`\`

## 目标类别: ${category}

需要为以下事件创建音效:
${events[category].map((e) => `- ${e}`).join('\n')}
${habitatContext}
## 示例

\`\`\`json
{
  "button-click": {
    "waveform": "square",
    "frequencyStart": 1200,
    "frequencyEnd": 1000,
    "duration": 0.05,
    "envelope": { "attack": 0.003, "decay": 0.02, "sustain": 0.4, "release": 0.02 },
    "volume": 0.3
  }
}
\`\`\`

## 要求

1. 所有音效使用 8-bit 风格波形 (square, triangle, pulse, noise)
2. duration 建议 0.05-0.6 秒 (UI 音效更短，战斗/完成音效更长)
3. 音量 0.3-0.9 范围，UI 偏低，重要事件偏高
4. 输出纯 JSON，key 为事件名

请直接输出 JSON:`;
}
