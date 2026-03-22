import type { WaveformType, Envelope } from '../types';
import { createWaveformSource } from './waveforms';
import { applyEnvelope, triggerRelease } from './envelope';
import { createReverb } from './effects';

export interface VoiceHandle {
  source: OscillatorNode | AudioBufferSourceNode;
  gain: GainNode;
  endTime: number;
  stop: () => void;
}

/**
 * Unified synthesis engine. Single AudioContext, shared by SFX and BGM.
 * Lazily initialized on first user interaction.
 */
class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _bgmGain: GainNode | null = null;
  private _sfxGain: GainNode | null = null;
  private _enabled = true;
  private _volume = 1;
  private _bgmVolume = 0.6;
  private _sfxVolume = 0.8;
  private _initialized = false;
  private _initPromiseResolve: (() => void) | null = null;
  private _initPromise: Promise<void>;

  constructor() {
    this._initPromise = new Promise((resolve) => {
      this._initPromiseResolve = resolve;
    });
  }

  /** Call on first user interaction (click/keypress). */
  init(): AudioContext {
    if (this.ctx) return this.ctx;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this._enabled ? this._volume : 0;
    this.masterGain.connect(this.ctx.destination);

    this._bgmGain = this.ctx.createGain();
    this._bgmGain.gain.value = this._bgmVolume;
    this._bgmGain.connect(this.masterGain);

    this._sfxGain = this.ctx.createGain();
    this._sfxGain.gain.value = this._sfxVolume;
    this._sfxGain.connect(this.masterGain);

    this._initialized = true;
    this._initPromiseResolve?.();
    return this.ctx;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  get destination(): GainNode | null {
    return this.masterGain;
  }

  waitForInit(): Promise<void> {
    return this._initPromise;
  }

  // ----- Volume / Enable -----

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this._enabled) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx!.currentTime);
    }
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        enabled ? this._volume : 0,
        this.ctx!.currentTime
      );
    }
  }

  get volume(): number {
    return this._volume;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  // ----- Submix Volume -----

  get bgmDestination(): GainNode | null {
    return this._bgmGain;
  }

  get sfxDestination(): GainNode | null {
    return this._sfxGain;
  }

  setBgmGain(v: number): void {
    this._bgmVolume = Math.max(0, Math.min(1, v));
    if (this._bgmGain && this.ctx) {
      this._bgmGain.gain.setValueAtTime(this._bgmVolume, this.ctx.currentTime);
    }
  }

  setSfxGain(v: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, v));
    if (this._sfxGain && this.ctx) {
      this._sfxGain.gain.setValueAtTime(this._sfxVolume, this.ctx.currentTime);
    }
  }

  // ----- Lifecycle -----

  suspend(): void {
    if (this.ctx?.state === 'running') {
      this.ctx.suspend();
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ----- Synthesis -----

  /**
   * Play a single synthesized tone. Returns a VoiceHandle for control.
   */
  playTone(params: {
    waveform: WaveformType;
    frequency: number;
    duration: number;
    envelope: Envelope;
    volume?: number;
    dutyCycle?: number;
    reverbLevel?: number;
    frequencyEnd?: number;
    destination?: GainNode;
  }): VoiceHandle | null {
    if (!this.ctx || !this.masterGain || !this._enabled) return null;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const {
      waveform,
      frequency,
      duration,
      envelope,
      volume = 1,
      dutyCycle = 0.5,
      reverbLevel = 0,
      frequencyEnd,
      destination,
    } = params;

    const outputTarget = destination || this.masterGain;

    // Create source
    const source = createWaveformSource(ctx, waveform, frequency, dutyCycle);

    // Frequency sweep
    if (frequencyEnd !== undefined && source instanceof OscillatorNode) {
      source.frequency.setValueAtTime(frequency, now);
      source.frequency.linearRampToValueAtTime(frequencyEnd, now + duration);
    }

    // Gain with volume scaling
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = 0;

    // Scaled envelope
    const scaledEnvelope: Envelope = {
      ...envelope,
      sustain: envelope.sustain * volume,
    };

    const sustainDuration = Math.max(
      0,
      duration - envelope.attack - envelope.decay
    );
    const endTime = applyEnvelope(voiceGain, scaledEnvelope, now, sustainDuration);

    // Effects chain
    if (reverbLevel > 0) {
      const reverb = createReverb(ctx, reverbLevel);
      source.connect(voiceGain);
      voiceGain.connect(reverb.input);
      reverb.output.connect(outputTarget);
    } else {
      source.connect(voiceGain);
      voiceGain.connect(outputTarget);
    }

    // Start and schedule stop
    source.start(now);
    if (source instanceof OscillatorNode) {
      source.stop(endTime + 0.1);
    } else {
      // AudioBufferSourceNode (noise)
      source.stop(endTime + 0.1);
    }

    const handle: VoiceHandle = {
      source,
      gain: voiceGain,
      endTime,
      stop: () => {
        triggerRelease(voiceGain, 0.02);
        try { source.stop(ctx.currentTime + 0.05); } catch { /* already stopped */ }
      },
    };

    return handle;
  }

  /**
   * Create a persistent oscillator for BGM channel use.
   * Does NOT auto-stop — caller manages lifecycle.
   */
  createChannel(waveform: WaveformType, dutyCycle = 0.5): {
    source: OscillatorNode | AudioBufferSourceNode;
    gain: GainNode;
  } | null {
    if (!this.ctx || !this.masterGain) return null;

    const source = createWaveformSource(this.ctx, waveform, 440, dutyCycle);
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);

    return { source, gain };
  }
}

// Singleton
export const synthEngine = new SynthEngine();
