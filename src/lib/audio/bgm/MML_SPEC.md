# Tomato Hunter MML Dialect Specification

## File Format

```
@title Track Name
@tempo 120

CH1: <mml sequence>
CH2: <mml sequence>
CH3: <mml sequence>
CH4: <mml sequence>
```

## Channel Assignments

| Channel | Waveform | Role |
|---------|----------|------|
| CH1 | Square | Melody / Lead |
| CH2 | Square | Harmony / Counter-melody |
| CH3 | Triangle | Bass |
| CH4 | Noise | Percussion / Rhythm |

## Token Reference

### Notes
`c d e f g a b` — Natural notes (lowercase only)

### Sharps / Flats
`c+ d-` — Sharp (+) or flat (-) after note name

### Octave
`o3` to `o6` — Set current octave (o4 = middle C region)
`>` — Octave up, `<` — Octave down

### Note Length
Default length set by `l` command. Per-note override by appending number.
- `1` = whole note
- `2` = half note
- `4` = quarter note
- `8` = eighth note
- `16` = sixteenth note
- `.` = dotted (1.5x duration)

### Rest
`r` — Rest, uses current default length. Append number for specific length: `r8`

### Volume
`v0` to `v15` — Set channel volume (v15 = max)

### Tempo
`t60` to `t200` — Set tempo in BPM (applies globally to all channels)

### Default Length
`l4` — Set default note length to quarter note

### Loops
`[c d e f]3` — Repeat contents 3 times. Nestable.

### Tie
`c4&c4` — Tie two notes (combine duration, no re-attack)

## Example

```
@title Village Theme
@tempo 100

CH1: v12 o4 l8 [e g a b > c < b a g]2 e4 r4
CH2: v8 o3 l4 c e g e c e g e
CH3: v10 o3 l2 c g a e
CH4: v6 l8 [r c r c r c r c]2
```

## Constraints
- All octave values must be 3-6
- Volume values must be 0-15
- Tempo must be 60-200
- Loop nesting depth max: 3
- Channel identifiers must be CH1-CH4
