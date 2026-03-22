import { parseMmlFile } from '../bgm/MmlParser';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an MML file string.
 */
export function validateMml(content: string): ValidationResult {
  const errors: string[] = [];

  // Check basic structure
  if (!content.includes('@title')) {
    errors.push('Missing @title header');
  }
  if (!content.includes('@tempo')) {
    errors.push('Missing @tempo header');
  }

  // Check channel presence
  for (let i = 1; i <= 4; i++) {
    if (!content.includes(`CH${i}:`)) {
      errors.push(`Missing CH${i} channel`);
    }
  }

  // Try parsing
  try {
    const track = parseMmlFile(content);

    // Validate tempo range
    if (track.tempo < 60 || track.tempo > 200) {
      errors.push(`Tempo ${track.tempo} out of range (60-200)`);
    }

    // Check channels have notes
    for (let i = 0; i < 4; i++) {
      if (track.channels[i].length === 0) {
        errors.push(`CH${i + 1} has no notes`);
      }
    }
  } catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an SFX preset JSON object.
 */
export function validateSfxPreset(key: string, preset: unknown): ValidationResult {
  const errors: string[] = [];
  const p = preset as Record<string, unknown>;

  if (!p || typeof p !== 'object') {
    return { valid: false, errors: [`${key}: not an object`] };
  }

  // Required fields
  const waveforms = ['square', 'triangle', 'pulse', 'noise'];
  if (!waveforms.includes(p.waveform as string)) {
    errors.push(`${key}: waveform must be one of ${waveforms.join(', ')}`);
  }

  if (typeof p.frequencyStart !== 'number' || p.frequencyStart < 20 || p.frequencyStart > 4000) {
    errors.push(`${key}: frequencyStart must be 20-4000`);
  }
  if (typeof p.frequencyEnd !== 'number' || p.frequencyEnd < 20 || p.frequencyEnd > 4000) {
    errors.push(`${key}: frequencyEnd must be 20-4000`);
  }
  if (typeof p.duration !== 'number' || p.duration < 0.01 || p.duration > 2.0) {
    errors.push(`${key}: duration must be 0.01-2.0`);
  }
  if (typeof p.volume !== 'number' || p.volume < 0 || p.volume > 1) {
    errors.push(`${key}: volume must be 0-1`);
  }

  // Envelope
  const env = p.envelope as Record<string, unknown> | undefined;
  if (!env || typeof env !== 'object') {
    errors.push(`${key}: missing envelope object`);
  } else {
    for (const field of ['attack', 'decay', 'sustain', 'release']) {
      if (typeof env[field] !== 'number') {
        errors.push(`${key}: envelope.${field} must be a number`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a full SFX preset collection JSON.
 */
export function validateSfxJson(json: string): ValidationResult {
  const allErrors: string[] = [];

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { valid: false, errors: [`JSON parse error: ${e instanceof Error ? e.message : String(e)}`] };
  }

  for (const [key, value] of Object.entries(parsed)) {
    const result = validateSfxPreset(key, value);
    allErrors.push(...result.errors);
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}
