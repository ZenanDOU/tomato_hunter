## ADDED Requirements

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
