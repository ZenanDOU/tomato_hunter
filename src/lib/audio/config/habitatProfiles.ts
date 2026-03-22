import type { HabitatAudioProfile } from '../types';

export const habitatProfiles: Record<string, HabitatAudioProfile> = {
  'gear-workshop': {
    id: 'gear-workshop',
    name: '齿轮工坊废墟',
    mood: ['机械', '紧迫'],
    scale: 'minor',
    bpmRange: [130, 150],
    dominantWaveform: 'pulse',
    reverbLevel: 0.2,
    signature: '金属节奏loop',
  },
  'withered-gallery': {
    id: 'withered-gallery',
    name: '枯竭画廊',
    mood: ['空灵', '忧郁'],
    scale: 'dorian',
    bpmRange: [70, 90],
    dominantWaveform: 'triangle',
    reverbLevel: 0.8,
    signature: '琶音',
  },
  'forgotten-library': {
    id: 'forgotten-library',
    name: '遗忘图书馆',
    mood: ['神秘', '沉静'],
    scale: 'lydian',
    bpmRange: [60, 80],
    dominantWaveform: 'square',
    reverbLevel: 0.5,
    signature: '持续音',
  },
  'abandoned-garden': {
    id: 'abandoned-garden',
    name: '荒废花园',
    mood: ['自然', '温暖'],
    scale: 'major-pentatonic',
    bpmRange: [90, 110],
    dominantWaveform: 'triangle',
    reverbLevel: 0.4,
    signature: '跳音旋律',
  },
  'mist-swamp': {
    id: 'mist-swamp',
    name: '迷雾沼泽',
    mood: ['诡异', '不安'],
    scale: 'whole-tone',
    bpmRange: [50, 70],
    dominantWaveform: 'noise',
    reverbLevel: 0.9,
    signature: '不规则节奏',
  },
};

// Category → habitat ID mapping (matches bestiary habitat system)
export const categoryToHabitat: Record<string, string> = {
  work: 'gear-workshop',
  creative: 'withered-gallery',
  study: 'forgotten-library',
  life: 'abandoned-garden',
  other: 'mist-swamp',
};

/**
 * Export profiles as structured text for Claude prompt embedding.
 */
export function exportProfilesAsText(): string {
  return Object.values(habitatProfiles)
    .map((p) =>
      [
        `### ${p.name} (${p.id})`,
        `- 情绪: ${p.mood.join(', ')}`,
        `- 调式: ${p.scale}`,
        `- BPM: ${p.bpmRange[0]}-${p.bpmRange[1]}`,
        `- 主导波形: ${p.dominantWaveform}`,
        `- 混响: ${p.reverbLevel}`,
        `- 特征: ${p.signature}`,
      ].join('\n')
    )
    .join('\n\n');
}
