// ===== Waveform Types =====

export type WaveformType = 'square' | 'triangle' | 'pulse' | 'noise';

// ===== ADSR Envelope =====

export interface Envelope {
  attack: number;   // seconds
  decay: number;    // seconds
  sustain: number;  // 0-1
  release: number;  // seconds
}

// ===== SFX Preset =====

export interface SfxLayer {
  delay: number;             // ms offset from trigger
  waveform: WaveformType;
  frequencyStart: number;    // Hz
  frequencyEnd: number;      // Hz
  duration: number;          // seconds
  envelope: Envelope;
  volume: number;            // 0-1
  dutyCycle?: number;        // 0-1, for pulse wave only
}

export interface SfxPreset {
  waveform: WaveformType;
  frequencyStart: number;    // Hz
  frequencyEnd: number;      // Hz
  duration: number;          // seconds
  envelope: Envelope;
  pitchSweep?: number;       // semitones/s
  volume: number;            // 0-1
  dutyCycle?: number;        // 0-1, for pulse wave only
  layers?: SfxLayer[];       // multi-layer composite sound
}

export type SfxCategory = 'hunt' | 'timer' | 'ui';

export type HuntSfxEvent = 'attack-hit' | 'attack-miss' | 'monster-down' | 'monster-part-break' | 'loot-drop';
export type TimerSfxEvent = 'phase-start' | 'phase-end' | 'countdown-warning' | 'focus-complete' | 'break-start' | 'focus-alert';
export type UiSfxEvent = 'button-click' | 'menu-open' | 'menu-close' | 'notification' | 'error' | 'transition-in' | 'transition-out' | 'equip' | 'unequip' | 'farm-harvest';
export type SfxEvent = HuntSfxEvent | TimerSfxEvent | UiSfxEvent;

// ===== MML =====

export interface MmlNote {
  frequency: number;   // Hz, 0 = rest
  duration: number;    // seconds
  volume: number;      // 0-15 → normalized to 0-1
}

export interface MmlTrack {
  title: string;
  tempo: number;
  channels: [MmlNote[], MmlNote[], MmlNote[], MmlNote[]];
}

// ===== Habitat Audio Profile =====

export interface HabitatAudioProfile {
  id: string;
  name: string;
  mood: string[];
  scale: string;
  bpmRange: [number, number];
  dominantWaveform: WaveformType;
  reverbLevel: number;      // 0-1
  signature: string;
}

// ===== Audio Manager =====

export interface AudioState {
  soundEnabled: boolean;
  volume: number;       // 0-1
  currentBgm: string | null;
  currentHabitat: string | null;
}
