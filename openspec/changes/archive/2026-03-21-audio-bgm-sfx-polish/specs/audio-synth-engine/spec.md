## ADDED Requirements

### Requirement: BGM and SFX submix gain nodes
The SynthEngine SHALL provide two submix GainNodes (`bgmGain` and `sfxGain`) that route through the existing `masterGain`. BGM audio (MmlPlayer output) SHALL connect to `bgmGain`. SFX audio (SfxManager output) SHALL connect to `sfxGain`. Both submix gains SHALL be independently controllable via `setBgmGain(0-1)` and `setSfxGain(0-1)` methods.

#### Scenario: Audio routing hierarchy
- **WHEN** the AudioContext is initialized
- **THEN** the routing is: bgmGain → masterGain → destination, sfxGain → masterGain → destination

#### Scenario: BGM volume independent of SFX
- **WHEN** bgmGain is set to 0.3 and sfxGain is set to 0.8
- **THEN** BGM output is attenuated to 30% and SFX output is attenuated to 80%, both before masterGain scaling

#### Scenario: Master volume still controls overall level
- **WHEN** masterGain is set to 0.5, bgmGain to 0.6, sfxGain to 0.8
- **THEN** effective BGM level is 0.3 (0.5 × 0.6) and effective SFX level is 0.4 (0.5 × 0.8)

### Requirement: Submix gain node accessors
The SynthEngine SHALL expose `bgmDestination` and `sfxDestination` getters returning the respective submix GainNodes, for use by MmlPlayer and SfxManager as their output targets.

#### Scenario: MmlPlayer connects to bgmDestination
- **WHEN** MmlPlayer sets up channels for a new track
- **THEN** its outputGain connects to `synthEngine.bgmDestination` instead of `synthEngine.destination`

#### Scenario: SfxManager plays through sfxDestination
- **WHEN** SfxManager triggers a playTone call
- **THEN** the voice gain connects to `synthEngine.sfxDestination`
