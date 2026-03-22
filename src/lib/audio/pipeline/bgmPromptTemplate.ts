import { exportProfilesAsText, habitatProfiles } from '../config';

/**
 * Generate a Claude prompt for creating a BGM track for a specific habitat.
 */
export function renderBgmPrompt(habitatId: string): string {
  const profile = habitatProfiles[habitatId];
  if (!profile) throw new Error(`Unknown habitat: ${habitatId}`);

  return `你是一个 chiptune 作曲家。请为像素风番茄钟猎人游戏创作一段 BGM。

## MML 方言规范

使用以下严格的 MML 方言语法。不要使用任何规范外的记号。

### 文件格式
\`\`\`
@title <曲名>
@tempo <BPM>

CH1: <MML序列>  (方波 - 主旋律)
CH2: <MML序列>  (方波 - 和声/副旋律)
CH3: <MML序列>  (三角波 - 低音)
CH4: <MML序列>  (噪声 - 节奏)
\`\`\`

### 可用记号
- 音符: c d e f g a b (仅小写)
- 升降: + (升半音) - (降半音)，紧跟音符后
- 八度: o3 到 o6 (o4 = 中央C区)，> 升一个八度，< 降一个八度
- 音长: 1(全) 2(二分) 4(四分) 8(八分) 16(十六分)，紧跟音符/休止后
- 附点: . (1.5倍时值)
- 休止: r (可加音长 r8)
- 音量: v0 到 v15
- 速度: t60 到 t200
- 默认音长: l4 (设默认为四分音符)
- 循环: [内容]N (重复N次，最多嵌套3层)
- 连音: & (连接两音时值)

## 目标栖息地

**${profile.name}** (${profile.id})
- 情绪: ${profile.mood.join(', ')}
- 调式: ${profile.scale}
- BPM: ${profile.bpmRange[0]}-${profile.bpmRange[1]}
- 主导波形: ${profile.dominantWaveform}
- 混响程度: ${profile.reverbLevel}
- 特征模式: ${profile.signature}

## 所有栖息地参考 (确保风格区分度)

${exportProfilesAsText()}

## 示例 (村庄主题)

\`\`\`
@title Village Theme
@tempo 100

CH1: v12 o4 l8 e g a b > c < b a g e g a b > c e d c < b4 r4
CH2: v8 o3 l4 c e g e c e g e
CH3: v10 o3 l2 c g a e
CH4: v5 l8 [r c r c r c r c]4
\`\`\`

## 要求

1. 严格使用上述 MML 方言，不使用任何规范外的记号
2. BPM 必须在 ${profile.bpmRange[0]}-${profile.bpmRange[1]} 范围内
3. 使用 ${profile.scale} 调式
4. 乐曲长度: 8-16 小节，可循环
5. 4 个声道都必须有内容
6. CH4 (噪声) 只使用 c 和 r (噪声无音高)
7. 输出纯 MML 文本，不要添加额外说明

请直接输出 MML 文件内容:`;
}
