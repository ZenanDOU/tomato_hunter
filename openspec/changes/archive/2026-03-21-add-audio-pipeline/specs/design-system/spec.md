## ADDED Requirements

### Requirement: Audio volume slider component
The system SHALL provide a PixelVolumeSlider component with pixel-style appearance consistent with the design system. The slider SHALL control master audio volume from 0 to 100, displayed as a segmented bar matching PixelProgressBar aesthetics.

#### Scenario: Volume slider renders in pixel style
- **WHEN** PixelVolumeSlider renders
- **THEN** it displays a segmented bar with 2px #333333 border, fill color #55BBEE, and pixel-style thumb

#### Scenario: Volume change updates audio
- **WHEN** user drags the volume slider to 60
- **THEN** the master audio volume is set to 0.6 and the setting persists to the database

### Requirement: Sound toggle button
The system SHALL provide a sound toggle integrated into the settings UI that enables/disables all audio. The toggle SHALL use the existing soundEnabled database setting and visually indicate current state.

#### Scenario: Toggle sound off
- **WHEN** user clicks the sound toggle while sound is enabled
- **THEN** soundEnabled is set to false, all audio stops, and the toggle shows muted state (🔇)

#### Scenario: Toggle sound on
- **WHEN** user clicks the sound toggle while sound is disabled
- **THEN** soundEnabled is set to true, audio resumes, and the toggle shows active state (🔊)
