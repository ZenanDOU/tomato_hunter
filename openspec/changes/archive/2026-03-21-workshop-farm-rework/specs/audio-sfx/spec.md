## ADDED Requirements

### Requirement: White noise ambient audio for leather armor
The system SHALL generate continuous white noise using the SynthEngine's noise waveform when the user has leather armor (皮甲) equipped and enters focus phase. The white noise SHALL play at a configurable volume and stop when focus phase ends.

#### Scenario: White noise starts on focus entry
- **WHEN** user enters focus phase with 皮甲 equipped and soundEnabled is true
- **THEN** the AudioManager starts a continuous noise buffer playback at volume 0.3

#### Scenario: White noise stops on focus exit
- **WHEN** focus phase ends (transitions to review, or user retreats)
- **THEN** the white noise fades out over 0.5 seconds

### Requirement: Interval alert audio for heavy armor
The system SHALL play a distinct chime sound effect every 3 minutes during the focus phase when the user has heavy armor (重甲) equipped.

#### Scenario: Alert plays every 3 minutes
- **WHEN** user is in focus phase with 重甲 equipped and 3 minutes have elapsed since last alert (or focus start)
- **THEN** a focus-alert SFX preset plays (triangle wave, ascending tone, 0.3s duration)

#### Scenario: No alert in first 3 minutes
- **WHEN** user enters focus phase with 重甲
- **THEN** the first alert plays at the 3-minute mark, not at focus start

### Requirement: Armor overrides habitat BGM during focus
The system SHALL stop habitat BGM when entering focus phase, regardless of armor type. Non-focus phases (prep, review, break, village) SHALL continue to use habitat/scene BGM as before.

#### Scenario: BGM stops on focus entry
- **WHEN** user transitions from prep to focus phase
- **THEN** habitat BGM fades out; armor audio behavior takes over (silent / white noise / interval alert)

#### Scenario: BGM resumes after focus
- **WHEN** focus phase ends and transitions to review or break
- **THEN** the appropriate scene BGM resumes
