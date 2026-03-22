import type { Envelope } from '../types';

/**
 * Apply ADSR envelope to a GainNode starting at the given time.
 * Returns the time when the sustain phase ends (before release).
 */
export function applyEnvelope(
  gain: GainNode,
  envelope: Envelope,
  startTime: number,
  sustainDuration: number
): number {
  const { attack, decay, sustain, release } = envelope;
  const g = gain.gain;

  g.setValueAtTime(0, startTime);
  // Attack: ramp to 1
  g.linearRampToValueAtTime(1, startTime + attack);
  // Decay: ramp to sustain level
  g.linearRampToValueAtTime(sustain, startTime + attack + decay);
  // Sustain: hold
  const sustainEnd = startTime + attack + decay + sustainDuration;
  g.setValueAtTime(sustain, sustainEnd);
  // Release: ramp to 0
  g.linearRampToValueAtTime(0, sustainEnd + release);

  return sustainEnd + release;
}

/**
 * Trigger immediate release (for voice stealing or stop).
 */
export function triggerRelease(gain: GainNode, releaseTime: number): void {
  const now = gain.context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + releaseTime);
}
