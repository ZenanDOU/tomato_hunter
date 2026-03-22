## ADDED Requirements

### Requirement: Unified AudioContext singleton
The system SHALL create a single AudioContext instance shared across all audio subsystems (SFX and BGM). The AudioContext SHALL be lazily initialized on first user interaction to comply with browser autoplay policies.

#### Scenario: Lazy initialization on user click
- **WHEN** user performs their first interaction (click/keypress) and no AudioContext exists
- **THEN** a single AudioContext is created and stored as a singleton

#### Scenario: Shared context across subsystems
- **WHEN** SfxManager and MmlPlayer both request an AudioContext
- **THEN** both receive the same AudioContext instance

### Requirement: Four base waveform types
The system SHALL provide four waveform generators: square wave, triangle wave, pulse wave (variable duty cycle), and noise. These waveforms SHALL be the only sound sources for both SFX and BGM.

#### Scenario: Square wave generation
- **WHEN** a square waveform is requested
- **THEN** an OscillatorNode with type "square" is created at the specified frequency

#### Scenario: Pulse wave with duty cycle
- **WHEN** a pulse waveform is requested with duty cycle 0.25
- **THEN** a custom PeriodicWave is created approximating a 25% pulse width

#### Scenario: Noise generation
- **WHEN** a noise waveform is requested
- **THEN** an AudioBufferSourceNode is created with white noise buffer data

### Requirement: ADSR envelope control
The system SHALL support Attack-Decay-Sustain-Release (ADSR) envelope shaping on any audio node, with configurable time values in seconds and sustain level as a 0-1 float.

#### Scenario: Envelope applied to note
- **WHEN** a note triggers with envelope {attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2}
- **THEN** gain ramps from 0 to 1 in 0.01s, decays to 0.7 in 0.1s, holds at 0.7 during sustain, then fades to 0 in 0.2s on release

### Requirement: Effects chain
The system SHALL provide optional reverb and delay effects that can be applied per-channel. Reverb level SHALL be configurable from 0 (dry) to 1 (fully wet).

#### Scenario: Reverb applied to BGM channel
- **WHEN** a BGM channel has reverbLevel 0.6
- **THEN** the channel output is mixed 40% dry / 60% wet through a ConvolverNode

#### Scenario: No effects by default
- **WHEN** no effects are specified
- **THEN** audio passes through dry (no processing)

### Requirement: AudioContext lifecycle management
The system SHALL suspend the AudioContext when the application window loses focus and resume it when focus returns. The system SHALL respect the global soundEnabled setting.

#### Scenario: Window blur suspends audio
- **WHEN** the Tauri window loses focus
- **THEN** the AudioContext is suspended (all audio pauses)

#### Scenario: Sound disabled globally
- **WHEN** soundEnabled is false
- **THEN** the AudioContext master gain is set to 0 and no new audio nodes are created
