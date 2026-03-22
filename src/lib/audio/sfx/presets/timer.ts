import type { SfxPreset, TimerSfxEvent } from '../../types';

export const timerPresets: Record<TimerSfxEvent, SfxPreset> = {
  'phase-start': {
    waveform: 'triangle',
    frequencyStart: 523,
    frequencyEnd: 784,
    duration: 0.3,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 },
    volume: 0.5,
  },
  'phase-end': {
    waveform: 'triangle',
    frequencyStart: 784,
    frequencyEnd: 523,
    duration: 0.4,
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.15 },
    volume: 0.5,
  },
  'countdown-warning': {
    waveform: 'square',
    frequencyStart: 880,
    frequencyEnd: 880,
    duration: 0.1,
    envelope: { attack: 0.005, decay: 0.03, sustain: 0.7, release: 0.03 },
    volume: 0.4,
  },
  'focus-complete': {
    waveform: 'triangle',
    frequencyStart: 523,
    frequencyEnd: 1047,
    duration: 0.6,
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.6, release: 0.25 },
    volume: 0.7,
    layers: [
      // Ascending completion tone
      {
        delay: 0,
        waveform: 'triangle',
        frequencyStart: 523,
        frequencyEnd: 1047,
        duration: 0.5,
        envelope: { attack: 0.02, decay: 0.12, sustain: 0.6, release: 0.2 },
        volume: 0.7,
      },
      // Harmony chord
      {
        delay: 80,
        waveform: 'triangle',
        frequencyStart: 659,
        frequencyEnd: 1319,
        duration: 0.4,
        envelope: { attack: 0.03, decay: 0.1, sustain: 0.4, release: 0.2 },
        volume: 0.4,
      },
    ],
  },
  'break-start': {
    waveform: 'triangle',
    frequencyStart: 659,
    frequencyEnd: 523,
    duration: 0.5,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.2 },
    volume: 0.4,
  },
  'focus-alert': {
    waveform: 'triangle',
    frequencyStart: 440,
    frequencyEnd: 660,
    duration: 0.3,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.1 },
    volume: 0.35,
  },
};
