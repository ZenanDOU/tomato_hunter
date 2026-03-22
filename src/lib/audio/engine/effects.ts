/**
 * Create a simple algorithmic reverb using a generated impulse response.
 */
export function createReverb(ctx: AudioContext, reverbLevel: number): {
  input: GainNode;
  output: GainNode;
} {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const convolver = ctx.createConvolver();

  dry.gain.value = 1 - reverbLevel;
  wet.gain.value = reverbLevel;
  convolver.buffer = generateImpulseResponse(ctx, 1.5, 2.0);

  input.connect(dry);
  input.connect(convolver);
  convolver.connect(wet);
  dry.connect(output);
  wet.connect(output);

  return { input, output };
}

/**
 * Generate a simple impulse response for convolution reverb.
 */
function generateImpulseResponse(
  ctx: AudioContext,
  duration: number,
  decay: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  return buffer;
}
