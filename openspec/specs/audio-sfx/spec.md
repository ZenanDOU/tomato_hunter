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
- **WHEN** any of these events fires: phase-start, phase-end, countdown-warning, focus-complete, break-start, focus-alert
- **THEN** the corresponding timer category SFX preset plays

#### Scenario: UI SFX events
- **WHEN** any of these events fires: button-click, menu-open, menu-close, notification, error, transition-in, transition-out, equip, unequip, farm-harvest
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

### Requirement: Multi-layer SFX presets
The SfxPreset type SHALL support an optional `layers` array. Each layer defines an independent tone with a `delay` offset (milliseconds from trigger). When `layers` is present, the SfxManager SHALL play each layer as a separate `playTone()` call, ignoring the top-level tone parameters. When `layers` is absent, behavior is unchanged (single tone from top-level parameters).

#### Scenario: Multi-layer monster-down sound
- **WHEN** the `monster-down` SFX triggers and its preset has 3 layers (explosion at 0ms, ascending tone at 50ms, sparkle at 150ms)
- **THEN** three `playTone()` calls are scheduled with the specified delays, creating a layered composite sound

#### Scenario: Single-layer backward compatibility
- **WHEN** a preset has no `layers` field (e.g., `button-click`)
- **THEN** playback uses the top-level waveform/frequency/envelope parameters as before

#### Scenario: Layer voice accounting
- **WHEN** a 3-layer SFX plays and 2 other SFX voices are active
- **THEN** voice stealing removes the oldest voice to stay within the polyphony limit; the newest layers are prioritized

### Requirement: Scene transition SFX events
The system SHALL provide two SFX presets for scene transitions: `transition-in` (ascending noise whoosh, ~0.25s) and `transition-out` (descending whoosh, ~0.2s). These SHALL belong to the `ui` SFX category.

#### Scenario: Transition-in plays when entering interactive phase
- **WHEN** the game transitions from focus to review, or from rest to next prep phase
- **THEN** the `transition-in` SFX plays

#### Scenario: Transition-out plays when leaving interactive phase
- **WHEN** the game transitions from prep to focus, or from settlement to rest
- **THEN** the `transition-out` SFX plays

### Requirement: Equipment SFX events
The system SHALL provide SFX presets for equipment interactions: `equip` (ascending tone, positive feedback) and `unequip` (descending tone, neutral feedback). These events SHALL belong to the `ui` SFX category.

#### Scenario: Equip sound plays when equipping item
- **WHEN** the user equips a weapon or armor in the Workshop
- **THEN** the `equip` SFX preset plays

#### Scenario: Unequip sound plays when removing item
- **WHEN** the user unequips a weapon or armor in the Workshop
- **THEN** the `unequip` SFX preset plays

### Requirement: Farm harvest SFX event
The system SHALL provide an SFX preset for `farm-harvest` (bright, rewarding ascending tone, ~0.3s). This event SHALL belong to the `ui` SFX category.

#### Scenario: Harvest sound plays when collecting tomatoes
- **WHEN** the user harvests tomatoes from the Tomato Farm
- **THEN** the `farm-harvest` SFX preset plays

### Requirement: All defined SFX events must be wired
Every SFX event defined in the preset files SHALL have at least one `playSfx()` call in the application code. No SFX preset SHALL exist without a corresponding trigger point.

#### Scenario: Hunt SFX events are all triggered
- **WHEN** reviewing the codebase for hunt SFX calls
- **THEN** all of attack-hit, attack-miss, monster-down, monster-part-break, and loot-drop have at least one playSfx() call in game components

#### Scenario: Timer SFX events are all triggered
- **WHEN** reviewing the codebase for timer SFX calls
- **THEN** all of phase-start, phase-end, countdown-warning, focus-complete, break-start, and focus-alert have at least one playSfx() call

#### Scenario: UI SFX events are all triggered
- **WHEN** reviewing the codebase for UI SFX calls
- **THEN** all UI events (button-click, menu-open, menu-close, notification, error, transition-in, transition-out, equip, unequip, farm-harvest) have at least one playSfx() call

### Requirement: Independent SFX volume control
The AudioManager SHALL expose a `setSfxVolume(0-1)` method that controls SFX volume independently from BGM volume and master volume. The SFX volume SHALL be persisted to the database as `sfx_volume` (0-100 integer, default 80).

#### Scenario: SFX volume adjusted independently
- **WHEN** user sets SFX volume to 50% while BGM volume remains at 60%
- **THEN** SFX plays at 50% of master volume, BGM plays at 60% of master volume

#### Scenario: SFX volume persisted across sessions
- **WHEN** user sets SFX volume to 70% and restarts the app
- **THEN** SFX volume loads as 70% from the database

### Requirement: SFX volume consistency by category
SFX presets within the same category SHALL maintain consistent volume ranges. Hunt category: 0.5-0.9 (prominent combat feedback). Timer category: 0.3-0.7 (clear signals without startling). UI category: 0.2-0.4 (subtle, non-intrusive). Positive feedback sounds SHALL use ascending pitch; negative/warning sounds SHALL use descending pitch or noise waveform.

#### Scenario: Hunt SFX volume range
- **WHEN** any hunt category SFX preset is inspected
- **THEN** its base volume parameter (or each layer's volume) falls within 0.5-0.9

#### Scenario: UI SFX volume range
- **WHEN** any UI category SFX preset is inspected
- **THEN** its base volume parameter falls within 0.2-0.4

#### Scenario: Positive feedback uses ascending pitch
- **WHEN** a positive feedback SFX fires (monster-down, loot-drop, focus-complete, equip, farm-harvest)
- **THEN** the primary layer's frequencyEnd is higher than frequencyStart
