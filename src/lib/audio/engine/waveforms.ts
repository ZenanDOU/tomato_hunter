import type { WaveformType } from '../types';

/**
 * Create an oscillator or buffer source for the given waveform type.
 */
export function createWaveformSource(
  ctx: AudioContext,
  type: WaveformType,
  frequency: number,
  dutyCycle = 0.5
): OscillatorNode | AudioBufferSourceNode {
  if (type === 'noise') {
    return createNoiseSource(ctx);
  }

  const osc = ctx.createOscillator();
  osc.frequency.value = frequency;

  if (type === 'pulse') {
    osc.setPeriodicWave(createPulseWave(ctx, dutyCycle));
  } else {
    osc.type = type; // 'square' | 'triangle'
  }

  return osc;
}

function createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 2; // 2 seconds of noise, looped
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function createPulseWave(ctx: AudioContext, dutyCycle: number): PeriodicWave {
  // Approximate pulse wave with Fourier series
  const harmonics = 32;
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);
  real[0] = 0;
  imag[0] = 0;
  for (let n = 1; n <= harmonics; n++) {
    // Pulse wave Fourier coefficient: (2 / nπ) * sin(nπd) where d = duty cycle
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * dutyCycle);
  }
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}
