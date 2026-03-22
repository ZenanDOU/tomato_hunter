/** Default crossfade duration in seconds */
export const CROSSFADE_DURATION = 1.0;

/** Default BGM volume (relative to master) */
export const BGM_VOLUME = 0.6;

/** Default SFX volume (relative to master) */
export const SFX_VOLUME = 0.8;

/** Max simultaneous SFX voices */
export const MAX_SFX_VOICES = 4;

/** BGM channel count (square x2 + triangle + noise) */
export const BGM_CHANNELS = 4;

/** BGM channel waveform assignments */
export const BGM_CHANNEL_WAVEFORMS = [
  'square',   // CH1
  'square',   // CH2
  'triangle', // CH3
  'noise',    // CH4
] as const;
