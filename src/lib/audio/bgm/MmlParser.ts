import type { MmlNote, MmlTrack } from '../types';

// Note name → semitone offset from C
const NOTE_MAP: Record<string, number> = {
  c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11,
};

// Frequency of C4 (middle C)
const C4_FREQ = 261.63;

function noteFrequency(semitone: number, octave: number): number {
  // semitone 0 = C, octave 4 = middle C
  const midiNote = (octave + 1) * 12 + semitone;
  const c4Midi = 60;
  return C4_FREQ * Math.pow(2, (midiNote - c4Midi) / 12);
}

interface ParserState {
  octave: number;
  defaultLength: number; // denominator: 4 = quarter note
  volume: number;        // 0-15
  tempo: number;         // BPM
}

function noteDuration(length: number, dotted: boolean, tempo: number): number {
  // whole note duration = 4 beats, beat = 60/tempo seconds
  const beats = 4 / length;
  const base = beats * (60 / tempo);
  return dotted ? base * 1.5 : base;
}

/**
 * Parse a single MML channel string into a sequence of notes.
 */
export function parseMmlChannel(input: string, globalTempo: number): MmlNote[] {
  const notes: MmlNote[] = [];
  const state: ParserState = {
    octave: 4,
    defaultLength: 4,
    volume: 12,
    tempo: globalTempo,
  };

  // Pre-process: expand loops
  const expanded = expandLoops(input);
  const tokens = tokenize(expanded);

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    // Octave commands
    if (tok === '>') {
      state.octave = Math.min(6, state.octave + 1);
      i++;
      continue;
    }
    if (tok === '<') {
      state.octave = Math.max(3, state.octave - 1);
      i++;
      continue;
    }

    // Octave set: o3-o6
    if (tok === 'o' && i + 1 < tokens.length && /^\d$/.test(tokens[i + 1])) {
      state.octave = Math.max(3, Math.min(6, parseInt(tokens[i + 1])));
      i += 2;
      continue;
    }

    // Volume: v0-v15
    if (tok === 'v' && i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
      state.volume = Math.max(0, Math.min(15, parseInt(tokens[i + 1])));
      i += 2;
      continue;
    }

    // Tempo: t60-t200
    if (tok === 't' && i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
      state.tempo = Math.max(60, Math.min(200, parseInt(tokens[i + 1])));
      i += 2;
      continue;
    }

    // Default length: l1-l16
    if (tok === 'l' && i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
      state.defaultLength = parseInt(tokens[i + 1]);
      i += 2;
      continue;
    }

    // Rest: r with optional length
    if (tok === 'r') {
      let length = state.defaultLength;
      let dotted = false;
      if (i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
        length = parseInt(tokens[i + 1]);
        i++;
      }
      if (i + 1 < tokens.length && tokens[i + 1] === '.') {
        dotted = true;
        i++;
      }
      notes.push({
        frequency: 0,
        duration: noteDuration(length, dotted, state.tempo),
        volume: 0,
      });
      i++;
      continue;
    }

    // Note: c d e f g a b with optional +/-, length, dot, tie
    if (NOTE_MAP[tok] !== undefined) {
      let semitone = NOTE_MAP[tok];
      let idx = i + 1;

      // Sharp / flat
      if (idx < tokens.length && (tokens[idx] === '+' || tokens[idx] === '-')) {
        semitone += tokens[idx] === '+' ? 1 : -1;
        idx++;
      }

      // Length
      let length = state.defaultLength;
      if (idx < tokens.length && /^\d+$/.test(tokens[idx])) {
        length = parseInt(tokens[idx]);
        idx++;
      }

      // Dotted
      let dotted = false;
      if (idx < tokens.length && tokens[idx] === '.') {
        dotted = true;
        idx++;
      }

      let dur = noteDuration(length, dotted, state.tempo);

      // Tie: accumulate duration
      while (idx < tokens.length && tokens[idx] === '&') {
        idx++; // skip &
        // expect same note or just a length
        if (idx < tokens.length && NOTE_MAP[tokens[idx]] !== undefined) {
          idx++; // skip note name (tied, same pitch)
          // skip optional sharp/flat
          if (idx < tokens.length && (tokens[idx] === '+' || tokens[idx] === '-')) idx++;
        }
        let tieLength = state.defaultLength;
        if (idx < tokens.length && /^\d+$/.test(tokens[idx])) {
          tieLength = parseInt(tokens[idx]);
          idx++;
        }
        let tieDotted = false;
        if (idx < tokens.length && tokens[idx] === '.') {
          tieDotted = true;
          idx++;
        }
        dur += noteDuration(tieLength, tieDotted, state.tempo);
      }

      notes.push({
        frequency: noteFrequency(semitone, state.octave),
        duration: dur,
        volume: state.volume / 15,
      });

      i = idx;
      continue;
    }

    // Unknown token — skip with warning
    console.warn(`[MmlParser] Unknown token: "${tok}" — skipping`);
    i++;
  }

  return notes;
}

/**
 * Parse a full .mml file into a MmlTrack.
 */
export function parseMmlFile(content: string): MmlTrack {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  let title = 'Untitled';
  let tempo = 120;
  const channelData: string[] = ['', '', '', ''];

  for (const line of lines) {
    if (line.startsWith('@title')) {
      title = line.replace('@title', '').trim();
    } else if (line.startsWith('@tempo')) {
      tempo = parseInt(line.replace('@tempo', '').trim()) || 120;
    } else if (/^CH[1-4]:/.test(line)) {
      const chIdx = parseInt(line[2]) - 1;
      channelData[chIdx] = line.slice(4).trim();
    }
  }

  return {
    title,
    tempo,
    channels: [
      parseMmlChannel(channelData[0], tempo),
      parseMmlChannel(channelData[1], tempo),
      parseMmlChannel(channelData[2], tempo),
      parseMmlChannel(channelData[3], tempo),
    ],
  };
}

// ===== Tokenizer =====

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    // Skip whitespace
    if (/\s/.test(ch)) { i++; continue; }
    // Multi-digit number
    if (/\d/.test(ch)) {
      let num = '';
      while (i < input.length && /\d/.test(input[i])) {
        num += input[i++];
      }
      tokens.push(num);
      continue;
    }
    // Single character tokens
    tokens.push(ch);
    i++;
  }
  return tokens;
}

// ===== Loop Expansion =====

function expandLoops(input: string): string {
  let result = input;
  // Iteratively expand innermost loops: [content]N
  let maxIter = 20; // safety limit
  while (maxIter-- > 0) {
    const match = result.match(/\[([^\[\]]+)\](\d+)/);
    if (!match) break;
    const content = match[1];
    const count = parseInt(match[2]);
    const repeated = Array(count).fill(content).join(' ');
    result = result.replace(match[0], repeated);
  }
  return result;
}
