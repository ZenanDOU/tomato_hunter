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

### Requirement: Rest BGM minimum 2-minute loop
The rest.mml track SHALL contain enough musical content to produce a loop of at least 2 minutes at its given tempo. The composition SHALL use ambient/meditative styling: long note values (whole/half notes), sparse percussion, gradual dynamic shifts, to minimize perceived repetition during 15-minute long breaks.

#### Scenario: Rest track loop duration
- **WHEN** rest.mml is played at its specified tempo
- **THEN** one full loop lasts at least 120 seconds before repeating

#### Scenario: Ambient character reduces repetition perception
- **WHEN** rest.mml loops during a 15-minute break
- **THEN** the music uses slow tempo (60-65 BPM), predominantly whole/half notes, and volume variations (v3-v8) across sections so the loop boundary is not easily noticed

### Requirement: Non-rest BGM minimum 90-second loop
Village.mml and all habitat-*.mml tracks SHALL contain enough musical content to produce a loop of at least 90 seconds at their given tempo.

#### Scenario: Village track loop duration
- **WHEN** village.mml is played at its specified tempo
- **THEN** one full loop lasts at least 90 seconds before repeating

#### Scenario: Habitat tracks loop duration
- **WHEN** any habitat-*.mml track is played at its specified tempo
- **THEN** one full loop lasts at least 90 seconds before repeating

### Requirement: BGM dynamic volume variation
Each BGM track SHALL use MML volume commands (v0-v15) to create dynamic contrast. Each track SHALL have at least one section with reduced volume (creating a "quiet passage") compared to the main theme.

#### Scenario: Volume contrast between sections
- **WHEN** a BGM track plays through one full loop
- **THEN** at least two channels change their volume level by at least 3 steps (e.g., v12 to v8) at some point in the track

### Requirement: Village BGM auto-start
The AudioManager SHALL automatically start playing the village BGM track when the AudioContext is initialized in the main window. The hunt window SHALL NOT auto-start any BGM.

#### Scenario: Village BGM plays on first interaction in main window
- **WHEN** the user first interacts with the main window (triggering AudioContext initialization)
- **THEN** the village BGM begins playing automatically

#### Scenario: Hunt window does not auto-start BGM
- **WHEN** the hunt window AudioContext initializes
- **THEN** no BGM auto-starts; habitat BGM is managed by the hunt flow

### Requirement: Independent BGM volume control
The AudioManager SHALL expose a `setBgmVolume(0-1)` method that controls BGM volume independently from SFX volume and master volume. The BGM volume SHALL be persisted to the database as `bgm_volume` (0-100 integer, default 60).

#### Scenario: BGM volume adjusted independently
- **WHEN** user sets BGM volume to 30% while SFX volume remains at 80%
- **THEN** BGM plays at 30% of master volume, SFX plays at 80% of master volume

#### Scenario: BGM volume persisted across sessions
- **WHEN** user sets BGM volume to 40% and restarts the app
- **THEN** BGM volume loads as 40% from the database
