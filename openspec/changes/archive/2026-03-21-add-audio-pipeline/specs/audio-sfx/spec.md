## ADDED Requirements

### Requirement: Parameter-driven SFX synthesis
The system SHALL synthesize sound effects from JSON parameter objects at runtime. Each SFX preset SHALL define waveform type, frequency start/end, ADSR envelope, frequency sweep, and optional vibrato/tremolo.

#### Scenario: Attack hit sound from JSON preset
- **WHEN** event "hunt:attack-hit" fires and soundEnabled is true
- **THEN** the SfxManager reads the corresponding preset from hunt.json and triggers a one-shot synthesis using the unified SynthEngine

#### Scenario: SFX respects global volume
- **WHEN** a sound effect plays and master volume is 0.5
- **THEN** the SFX output gain is scaled to 0.5

### Requirement: SFX preset categories
The system SHALL organize SFX presets into three categories: hunt (combat events), timer (pomodoro phase events), and ui (interface interactions).

#### Scenario: Hunt SFX events
- **WHEN** any of these events fires: attack-hit, attack-miss, monster-down, monster-part-break, loot-drop
- **THEN** the corresponding hunt category SFX preset plays

#### Scenario: Timer SFX events
- **WHEN** any of these events fires: phase-start, phase-end, countdown-warning (last 60s), focus-complete, break-start
- **THEN** the corresponding timer category SFX preset plays

#### Scenario: UI SFX events
- **WHEN** any of these events fires: button-click, menu-open, menu-close, notification, error
- **THEN** the corresponding ui category SFX preset plays

### Requirement: SFX preset JSON schema
Each SFX preset SHALL conform to this structure: waveform (square|triangle|pulse|noise), frequencyStart (Hz), frequencyEnd (Hz), duration (seconds), envelope (ADSR object), pitchSweep (optional semitones/s), volume (0-1).

#### Scenario: Valid preset loads successfully
- **WHEN** SfxManager loads a preset with all required fields
- **THEN** the preset is registered and ready for triggering

#### Scenario: Invalid preset rejected
- **WHEN** SfxManager encounters a preset missing required fields
- **THEN** a warning is logged and the preset is skipped (no crash)

### Requirement: SFX polyphony limit
The system SHALL allow a maximum of 4 simultaneous SFX voices. If a new SFX triggers when 4 are active, the oldest voice SHALL be stopped.

#### Scenario: Fifth SFX replaces oldest
- **WHEN** 4 SFX are playing and a new one triggers
- **THEN** the oldest active SFX stops immediately and the new one plays
