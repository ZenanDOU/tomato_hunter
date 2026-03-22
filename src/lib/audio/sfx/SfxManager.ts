import type { SfxPreset, SfxLayer, SfxEvent, WaveformType } from '../types';
import { synthEngine, type VoiceHandle } from '../engine';

// SFX preset collections
import { huntPresets } from './presets/hunt';
import { timerPresets } from './presets/timer';
import { uiPresets } from './presets/ui';

const MAX_VOICES = 4;

class SfxManager {
  private presets = new Map<SfxEvent, SfxPreset>();
  private activeVoices: VoiceHandle[] = [];

  // Per-habitat overrides
  private habitatWaveform: WaveformType | null = null;
  private habitatReverb = 0;

  constructor() {
    this.loadPresets();
  }

  private loadPresets(): void {
    for (const [event, preset] of Object.entries(huntPresets)) {
      this.presets.set(event as SfxEvent, preset);
    }
    for (const [event, preset] of Object.entries(timerPresets)) {
      this.presets.set(event as SfxEvent, preset);
    }
    for (const [event, preset] of Object.entries(uiPresets)) {
      this.presets.set(event as SfxEvent, preset);
    }
  }

  /**
   * Set habitat-specific SFX variations.
   */
  setHabitatOverrides(waveform: WaveformType | null, reverbLevel: number): void {
    this.habitatWaveform = waveform;
    this.habitatReverb = reverbLevel;
  }

  clearHabitatOverrides(): void {
    this.habitatWaveform = null;
    this.habitatReverb = 0;
  }

  /**
   * Play a sound effect by event name.
   */
  play(event: SfxEvent): void {
    const preset = this.presets.get(event);
    if (!preset || !synthEngine.initialized || !synthEngine.enabled) return;

    const isHuntEvent = event.startsWith('attack-') || event === 'monster-down' || event === 'monster-part-break' || event === 'loot-drop';

    if (preset.layers && preset.layers.length > 0) {
      this.playLayers(preset.layers, isHuntEvent);
    } else {
      this.playSingle(preset, isHuntEvent);
    }
  }

  private playSingle(preset: SfxPreset | SfxLayer, isHuntEvent: boolean): void {
    this.cleanupFinished();
    while (this.activeVoices.length >= MAX_VOICES) {
      const oldest = this.activeVoices.shift();
      oldest?.stop();
    }

    const waveform = (isHuntEvent && this.habitatWaveform) ? this.habitatWaveform : preset.waveform;
    const reverbLevel = (isHuntEvent && this.habitatReverb > 0) ? this.habitatReverb : 0;

    const handle = synthEngine.playTone({
      waveform,
      frequency: preset.frequencyStart,
      frequencyEnd: preset.frequencyEnd,
      duration: preset.duration,
      envelope: preset.envelope,
      volume: preset.volume,
      dutyCycle: preset.dutyCycle,
      reverbLevel,
      destination: synthEngine.sfxDestination || undefined,
    });

    if (handle) {
      this.activeVoices.push(handle);
    }
  }

  private playLayers(layers: SfxLayer[], isHuntEvent: boolean): void {
    for (const layer of layers) {
      if (layer.delay <= 0) {
        this.playSingle(layer, isHuntEvent);
      } else {
        setTimeout(() => {
          if (synthEngine.initialized && synthEngine.enabled) {
            this.playSingle(layer, isHuntEvent);
          }
        }, layer.delay);
      }
    }
  }

  private cleanupFinished(): void {
    const now = synthEngine.context?.currentTime ?? 0;
    this.activeVoices = this.activeVoices.filter((v) => v.endTime > now);
  }

  stopAll(): void {
    for (const v of this.activeVoices) {
      v.stop();
    }
    this.activeVoices = [];
  }
}

export const sfxManager = new SfxManager();
