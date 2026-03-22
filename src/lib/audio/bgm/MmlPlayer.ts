import type { MmlTrack, MmlNote, WaveformType } from '../types';
import { synthEngine } from '../engine';
import { createWaveformSource } from '../engine/waveforms';
import { createReverb } from '../engine/effects';
import { BGM_CHANNEL_WAVEFORMS, CROSSFADE_DURATION, BGM_VOLUME } from '../config';

interface ChannelState {
  notes: MmlNote[];
  noteIndex: number;
  nextNoteTime: number;
  source: OscillatorNode | AudioBufferSourceNode | null;
  gain: GainNode | null;
}

class MmlPlayer {
  private trackId: string | null = null;
  private channels: ChannelState[] = [];
  private outputGain: GainNode | null = null;
  private reverbNode: { input: GainNode; output: GainNode } | null = null;
  private schedulerTimer: number | null = null;
  private playing = false;
  private paused = false;
  private _volume = BGM_VOLUME;
  private _reverbLevel = 0;

  // Lookahead scheduling parameters
  private readonly SCHEDULE_AHEAD = 0.1; // seconds
  private readonly SCHEDULER_INTERVAL = 50; // ms

  play(id: string, track: MmlTrack): void {
    this.stopInternal();
    void track; // track data stored in channels
    this.trackId = id;
    this.setupChannels(track);
    this.playing = true;
    this.paused = false;
    this.startScheduler();
  }

  stop(): void {
    this.stopInternal();
  }

  pause(): void {
    if (!this.playing || this.paused) return;
    this.paused = true;
    this.stopScheduler();
  }

  resume(): void {
    if (!this.playing || !this.paused) return;
    this.paused = false;
    this.startScheduler();
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.outputGain && synthEngine.context) {
      this.outputGain.gain.setValueAtTime(this._volume, synthEngine.context.currentTime);
    }
  }

  setReverbLevel(level: number): void {
    this._reverbLevel = level;
    // Reverb level change takes effect on next play/crossfade
  }

  crossfadeTo(id: string, track: MmlTrack, duration = CROSSFADE_DURATION): void {
    const ctx = synthEngine.context;
    if (!ctx || !synthEngine.destination) {
      this.play(id, track);
      return;
    }

    // Fade out current
    if (this.outputGain) {
      const oldGain = this.outputGain;
      oldGain.gain.setValueAtTime(oldGain.gain.value, ctx.currentTime);
      oldGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      // Schedule cleanup after fade
      setTimeout(() => {
        this.disconnectOldNodes(oldGain);
      }, duration * 1000 + 100);
    }

    // Stop scheduler for old track
    this.stopScheduler();
    // Don't clean up channels yet — let fade finish

    // Start new track with fade in
    void track; // track data stored in channels
    this.trackId = id;
    this.setupChannels(track);
    this.playing = true;
    this.paused = false;

    if (this.outputGain) {
      this.outputGain.gain.setValueAtTime(0, ctx.currentTime);
      this.outputGain.gain.linearRampToValueAtTime(this._volume, ctx.currentTime + duration);
    }

    this.startScheduler();
  }

  get currentTrackId(): string | null {
    return this.trackId;
  }

  get isPlaying(): boolean {
    return this.playing && !this.paused;
  }

  // ===== Internal =====

  private setupChannels(track: MmlTrack): void {
    const ctx = synthEngine.context;
    const dest = synthEngine.bgmDestination || synthEngine.destination;
    if (!ctx || !dest) return;

    // Output gain for volume + crossfade control
    this.outputGain = ctx.createGain();
    this.outputGain.gain.value = this._volume;

    // Optional reverb
    if (this._reverbLevel > 0) {
      this.reverbNode = createReverb(ctx, this._reverbLevel);
      this.outputGain.connect(this.reverbNode.input);
      this.reverbNode.output.connect(dest);
    } else {
      this.reverbNode = null;
      this.outputGain.connect(dest);
    }

    const now = ctx.currentTime;
    this.channels = track.channels.map((notes) => ({
      notes,
      noteIndex: 0,
      nextNoteTime: now,
      source: null,
      gain: null,
    }));
  }

  private startScheduler(): void {
    this.stopScheduler();
    this.schedulerTimer = window.setInterval(() => {
      this.scheduleNotes();
    }, this.SCHEDULER_INTERVAL);
  }

  private stopScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private scheduleNotes(): void {
    const ctx = synthEngine.context;
    if (!ctx || !this.outputGain || !this.playing || this.paused) return;

    const until = ctx.currentTime + this.SCHEDULE_AHEAD;

    for (let ch = 0; ch < this.channels.length; ch++) {
      const state = this.channels[ch];
      if (state.notes.length === 0) continue;

      while (state.nextNoteTime < until) {
        const note = state.notes[state.noteIndex];
        this.scheduleNote(ch, note, state.nextNoteTime);
        state.nextNoteTime += note.duration;
        state.noteIndex++;

        // Loop: wrap around
        if (state.noteIndex >= state.notes.length) {
          state.noteIndex = 0;
        }
      }
    }
  }

  private scheduleNote(chIndex: number, note: MmlNote, time: number): void {
    const ctx = synthEngine.context;
    if (!ctx || !this.outputGain) return;

    // Rest — just silence
    if (note.frequency === 0 || note.volume === 0) return;

    const waveform = BGM_CHANNEL_WAVEFORMS[chIndex] as WaveformType;
    const source = createWaveformSource(ctx, waveform, note.frequency);
    const noteGain = ctx.createGain();

    // Simple gate envelope for BGM (short attack/release to avoid clicks)
    const attackTime = 0.005;
    const releaseTime = 0.01;
    const noteDuration = Math.max(0, note.duration - releaseTime);

    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(note.volume, time + attackTime);
    noteGain.gain.setValueAtTime(note.volume, time + noteDuration);
    noteGain.gain.linearRampToValueAtTime(0, time + noteDuration + releaseTime);

    source.connect(noteGain);
    noteGain.connect(this.outputGain);

    source.start(time);
    if (source instanceof OscillatorNode) {
      source.stop(time + noteDuration + releaseTime + 0.01);
    } else {
      source.stop(time + noteDuration + releaseTime + 0.01);
    }
  }

  private stopInternal(): void {
    this.stopScheduler();
    this.playing = false;
    this.paused = false;

    // Disconnect all channels
    for (const ch of this.channels) {
      try { ch.source?.stop(); } catch { /* */ }
      ch.source?.disconnect();
      ch.gain?.disconnect();
    }
    this.channels = [];

    this.disconnectOldNodes(this.outputGain);
    this.outputGain = null;
    this.reverbNode = null;
    this.trackId = null;
  }

  private disconnectOldNodes(gain: GainNode | null): void {
    try { gain?.disconnect(); } catch { /* */ }
    try { this.reverbNode?.input.disconnect(); } catch { /* */ }
    try { this.reverbNode?.output.disconnect(); } catch { /* */ }
  }
}

export const mmlPlayer = new MmlPlayer();
