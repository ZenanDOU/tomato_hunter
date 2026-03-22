import type { SfxPreset, HuntSfxEvent } from '../../types';

export const huntPresets: Record<HuntSfxEvent, SfxPreset> = {
  'attack-hit': {
    waveform: 'square',
    frequencyStart: 600,
    frequencyEnd: 200,
    duration: 0.15,
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.6, release: 0.05 },
    volume: 0.7,
    layers: [
      // Sharp impact
      {
        delay: 0,
        waveform: 'square',
        frequencyStart: 600,
        frequencyEnd: 200,
        duration: 0.12,
        envelope: { attack: 0.003, decay: 0.04, sustain: 0.7, release: 0.04 },
        volume: 0.7,
      },
      // Body thud
      {
        delay: 20,
        waveform: 'noise',
        frequencyStart: 150,
        frequencyEnd: 150,
        duration: 0.08,
        envelope: { attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.02 },
        volume: 0.5,
      },
    ],
  },
  'attack-miss': {
    waveform: 'noise',
    frequencyStart: 400,
    frequencyEnd: 400,
    duration: 0.2,
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.08 },
    volume: 0.5,
    layers: [
      // Whoosh
      {
        delay: 0,
        waveform: 'noise',
        frequencyStart: 600,
        frequencyEnd: 200,
        duration: 0.18,
        envelope: { attack: 0.01, decay: 0.06, sustain: 0.3, release: 0.06 },
        volume: 0.5,
      },
      // Descending whistle
      {
        delay: 30,
        waveform: 'triangle',
        frequencyStart: 800,
        frequencyEnd: 300,
        duration: 0.12,
        envelope: { attack: 0.005, decay: 0.04, sustain: 0.2, release: 0.04 },
        volume: 0.3,
      },
    ],
  },
  'monster-down': {
    waveform: 'square',
    frequencyStart: 200,
    frequencyEnd: 800,
    duration: 0.5,
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.2 },
    volume: 0.9,
    layers: [
      // Explosion burst
      {
        delay: 0,
        waveform: 'noise',
        frequencyStart: 300,
        frequencyEnd: 100,
        duration: 0.2,
        envelope: { attack: 0.005, decay: 0.08, sustain: 0.6, release: 0.08 },
        volume: 0.8,
      },
      // Victory ascending tone
      {
        delay: 60,
        waveform: 'square',
        frequencyStart: 262,
        frequencyEnd: 784,
        duration: 0.4,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.15 },
        volume: 0.9,
      },
      // Sparkle shimmer
      {
        delay: 150,
        waveform: 'triangle',
        frequencyStart: 1047,
        frequencyEnd: 1568,
        duration: 0.3,
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.15 },
        volume: 0.5,
      },
    ],
  },
  'monster-part-break': {
    waveform: 'pulse',
    frequencyStart: 500,
    frequencyEnd: 150,
    duration: 0.25,
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.1 },
    volume: 0.7,
    layers: [
      // Crack
      {
        delay: 0,
        waveform: 'pulse',
        frequencyStart: 500,
        frequencyEnd: 150,
        duration: 0.15,
        envelope: { attack: 0.003, decay: 0.06, sustain: 0.6, release: 0.05 },
        volume: 0.7,
        dutyCycle: 0.25,
      },
      // Debris scatter
      {
        delay: 40,
        waveform: 'noise',
        frequencyStart: 400,
        frequencyEnd: 100,
        duration: 0.2,
        envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.08 },
        volume: 0.5,
      },
    ],
  },
  'loot-drop': {
    waveform: 'triangle',
    frequencyStart: 400,
    frequencyEnd: 800,
    duration: 0.4,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.15 },
    volume: 0.7,
    layers: [
      // Ascending chime
      {
        delay: 0,
        waveform: 'triangle',
        frequencyStart: 523,
        frequencyEnd: 1047,
        duration: 0.35,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.12 },
        volume: 0.7,
      },
      // Sparkle
      {
        delay: 80,
        waveform: 'square',
        frequencyStart: 1319,
        frequencyEnd: 1568,
        duration: 0.25,
        envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.1 },
        volume: 0.4,
      },
      // Warm body
      {
        delay: 40,
        waveform: 'triangle',
        frequencyStart: 262,
        frequencyEnd: 392,
        duration: 0.3,
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.12 },
        volume: 0.5,
      },
    ],
  },
};
