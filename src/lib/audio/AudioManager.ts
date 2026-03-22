import { synthEngine, bindInitOnInteraction } from './engine';
import { createWaveformSource } from './engine/waveforms';
import { sfxManager } from './sfx';
import { mmlPlayer, parseMmlFile, trackSources } from './bgm';
import { habitatProfiles, categoryToHabitat } from './config';
import type { SfxEvent, MmlTrack, WaveformType } from './types';
import { CROSSFADE_DURATION } from './config';

export type AudioMode = 'silent' | 'white-noise' | 'interval-alert';

/**
 * Facade class unifying SFX + BGM initialization and global control.
 */
class AudioManager {
  private _initialized = false;
  private trackCache = new Map<string, MmlTrack>();
  // Armor audio state
  private whiteNoiseSource: AudioBufferSourceNode | null = null;
  private whiteNoiseGain: GainNode | null = null;
  private intervalTimer: number | null = null;
  private currentArmorMode: AudioMode | null = null;

  /**
   * Initialize audio system. Call once from app entry.
   * Binds to first user interaction for AudioContext creation.
   */
  init(options?: { autoPlayVillageBgm?: boolean }): void {
    if (this._initialized) return;
    this._initialized = true;

    bindInitOnInteraction(() => {
      if (options?.autoPlayVillageBgm) {
        this.playBgm('village');
      }
    });
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // ===== Volume / Enable =====

  setVolume(v: number): void {
    synthEngine.setVolume(v);
  }

  setBgmVolume(v: number): void {
    synthEngine.setBgmGain(v);
  }

  setSfxVolume(v: number): void {
    synthEngine.setSfxGain(v);
  }

  setEnabled(enabled: boolean): void {
    synthEngine.setEnabled(enabled);
    if (!enabled) {
      mmlPlayer.stop();
      sfxManager.stopAll();
    }
  }

  // ===== SFX =====

  playSfx(event: SfxEvent): void {
    sfxManager.play(event);
  }

  // ===== BGM =====

  playBgm(trackId: string): void {
    if (!synthEngine.initialized || !synthEngine.enabled) return;
    if (mmlPlayer.currentTrackId === trackId) return;

    const track = this.getTrack(trackId);
    if (!track) return;

    if (mmlPlayer.isPlaying) {
      mmlPlayer.crossfadeTo(trackId, track, CROSSFADE_DURATION);
    } else {
      mmlPlayer.play(trackId, track);
    }
  }

  stopBgm(): void {
    mmlPlayer.stop();
  }

  // ===== Habitat Integration =====

  /**
   * Enter a habitat — sets SFX overrides and switches BGM.
   */
  enterHabitat(category: string): void {
    const habitatId = categoryToHabitat[category];
    if (!habitatId) return;

    const profile = habitatProfiles[habitatId];
    if (!profile) return;

    // SFX overrides
    sfxManager.setHabitatOverrides(profile.dominantWaveform, profile.reverbLevel);

    // BGM reverb
    mmlPlayer.setReverbLevel(profile.reverbLevel);

    // Switch to habitat track
    this.playBgm(`habitat-${habitatId}`);
  }

  /**
   * Leave habitat — clear overrides, switch to village or rest BGM.
   */
  leaveHabitat(toRest = false): void {
    sfxManager.clearHabitatOverrides();
    mmlPlayer.setReverbLevel(0);
    this.playBgm(toRest ? 'rest' : 'village');
  }

  // ===== Armor Focus Audio =====

  /**
   * Enter focus phase with armor-driven audio.
   * Stops BGM, then activates the appropriate audio mode.
   */
  enterFocusWithArmor(mode: AudioMode): void {
    this.exitFocusAudio(); // clean up any previous
    this.stopBgm();
    this.currentArmorMode = mode;

    if (!synthEngine.initialized || !synthEngine.enabled) return;
    const ctx = synthEngine.context;
    const dest = synthEngine.destination;
    if (!ctx || !dest) return;

    switch (mode) {
      case 'silent':
        // Nothing to play
        break;
      case 'white-noise': {
        const source = createWaveformSource(ctx, 'noise' as WaveformType, 0);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);
        source.connect(gain);
        gain.connect(dest);
        source.start();
        this.whiteNoiseSource = source as AudioBufferSourceNode;
        this.whiteNoiseGain = gain;
        break;
      }
      case 'interval-alert': {
        // Play alert every 3 minutes (180 seconds)
        this.intervalTimer = window.setInterval(() => {
          this.playSfx('focus-alert' as SfxEvent);
        }, 180_000);
        break;
      }
    }
  }

  /**
   * Exit focus phase audio — fade out white noise, clear interval timer.
   */
  exitFocusAudio(): void {
    this.currentArmorMode = null;

    // Fade out white noise
    if (this.whiteNoiseGain && this.whiteNoiseSource) {
      const ctx = synthEngine.context;
      if (ctx) {
        this.whiteNoiseGain.gain.setValueAtTime(
          this.whiteNoiseGain.gain.value,
          ctx.currentTime
        );
        this.whiteNoiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        const src = this.whiteNoiseSource;
        setTimeout(() => { try { src.stop(); } catch { /* */ } }, 600);
      } else {
        try { this.whiteNoiseSource.stop(); } catch { /* */ }
      }
      this.whiteNoiseSource = null;
      this.whiteNoiseGain = null;
    }

    // Clear interval timer
    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  get isInFocusAudio(): boolean {
    return this.currentArmorMode !== null;
  }

  // ===== Track Management =====

  private getTrack(id: string): MmlTrack | null {
    if (this.trackCache.has(id)) return this.trackCache.get(id)!;

    const source = trackSources[id];
    if (!source) {
      console.warn(`[AudioManager] Track not found: ${id}`);
      return null;
    }

    const track = parseMmlFile(source);
    this.trackCache.set(id, track);
    return track;
  }
}

export const audioManager = new AudioManager();
