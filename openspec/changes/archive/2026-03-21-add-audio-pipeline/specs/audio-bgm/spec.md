## ADDED Requirements

### Requirement: Custom MML dialect parser
The system SHALL parse a custom MML dialect into an internal note sequence representation. The dialect SHALL support: notes (c d e f g a b), sharps/flats (c+ d-), octave (o3-o6), note length (1 2 4 8 16, dotted with .), rest (r), volume (v0-v15), tempo (t60-t200), loops ([...]N), and ties (&).

#### Scenario: Parse simple melody
- **WHEN** the parser receives "t120 o4 l8 c d e f g a b > c"
- **THEN** it produces a sequence of 8 notes at tempo 120, octave 4, eighth notes, with the last note at octave 5

#### Scenario: Parse loop structure
- **WHEN** the parser receives "[c d e f]3"
- **THEN** it produces 12 notes (the 4-note pattern repeated 3 times)

#### Scenario: Parse error handling
- **WHEN** the parser encounters an unrecognized token
- **THEN** it skips the token, logs a warning, and continues parsing the rest

### Requirement: 4-channel sequencer
The system SHALL play MML tracks through 4 fixed channels: CH1 (square wave), CH2 (square wave), CH3 (triangle wave), CH4 (noise). Each channel plays its own MML sequence concurrently.

#### Scenario: All 4 channels play simultaneously
- **WHEN** an MML track with 4 channel definitions is loaded
- **THEN** all 4 channels begin playback at the same time, synchronized to the track tempo

#### Scenario: Channel uses its assigned waveform
- **WHEN** CH3 plays a note
- **THEN** the note is rendered using triangle waveform from the unified SynthEngine

### Requirement: Track looping and crossfade
The system SHALL loop BGM tracks seamlessly. When switching between tracks, the system SHALL crossfade over a configurable duration (default 1 second).

#### Scenario: Seamless loop
- **WHEN** a BGM track reaches its end
- **THEN** playback restarts from the beginning with no audible gap

#### Scenario: Track crossfade on scene change
- **WHEN** the game transitions from village to a habitat
- **THEN** the village BGM fades out and the habitat BGM fades in over 1 second

### Requirement: BGM track file format
MML track files SHALL use the .mml extension and follow this structure: a header line with metadata (title, composer, tempo), followed by 4 channel blocks each prefixed with their channel identifier (CH1: through CH4:).

#### Scenario: Valid .mml file structure
- **WHEN** an MML file contains header + 4 channel blocks
- **THEN** the parser extracts each channel's MML string and passes it to the dialect parser

### Requirement: Playback control API
The system SHALL expose play(trackId), stop(), pause(), resume(), setVolume(0-1), and crossfadeTo(trackId, duration) methods on the BGM player.

#### Scenario: Pause and resume
- **WHEN** pause() is called during playback
- **THEN** all channels freeze at their current position and resume from that point when resume() is called
