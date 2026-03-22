## ADDED Requirements

### Requirement: Shared animation loop
The system SHALL provide a single requestAnimationFrame loop that manages all animation subsystems. Sprite animations SHALL tick at 4fps, particle systems at 8fps.

#### Scenario: Sprite and particles use shared loop
- **WHEN** a PixelSprite with idle animation and a PixelBackground with particles are both active
- **THEN** both run in the same rAF loop with independent frame counters, not separate rAF callbacks

### Requirement: Page transition for village tabs
The system SHALL animate village tab switches with a slide-down entry using `steps(4)` easing over 100ms. The outgoing content unmounts immediately; the new content scans in from top.

#### Scenario: Switch from hunt list to workshop tab
- **WHEN** user clicks the workshop tab while viewing hunt list
- **THEN** hunt list content unmounts and workshop content slides in from above over 100ms with 4 discrete steps

### Requirement: Hunt phase transition flash
The system SHALL display a full-screen white flash (2 frames, ~80ms) when transitioning between hunt phases. The flash SHALL trigger after any window resize completes.

#### Scenario: Prep to focus transition
- **WHEN** prep phase ends and focus phase begins
- **THEN** the window resizes first, then a white flash plays over 80ms, then focus phase content appears

### Requirement: Monster hit animation
The system SHALL play a hit animation on the monster sprite when a pomodoro review is submitted: white overlay flash ×3 + horizontal shake ±2px, ~200ms total.

#### Scenario: Review submit triggers hit
- **WHEN** user submits the review form
- **THEN** the monster sprite plays the hit animation (3 white flashes + shake) before the settlement screen appears

### Requirement: Monster defeat animation
The system SHALL play a defeat animation when a monster's HP reaches 0: 2-frame defeat sequence + downward fade-out.

#### Scenario: Monster HP reaches zero
- **WHEN** the last HP point is removed from a monster
- **THEN** the sprite plays defeat frame 1 (shifted down 2px), then defeat frame 2 (shifted down 4px + bottom dissolve), then fades out

### Requirement: Loot drop animation
The system SHALL animate loot items appearing one by one on the settlement screen, with 200ms interval between each item. Each item enters from below with `translateY(8px→0)` + scale via `steps(3)` from 1.2→1.0.

#### Scenario: Three loot items animate in sequence
- **WHEN** settlement screen shows 3 loot drops
- **THEN** item 1 appears at 0ms, item 2 at 200ms, item 3 at 400ms, each with spring-up + scale animation

### Requirement: Button click flash
The system SHALL add a 1-frame white overlay flash on PixelButton click, matching the sprite hit visual style.

#### Scenario: Button clicked
- **WHEN** user clicks any PixelButton
- **THEN** a brief white overlay flash appears on the button for 1 animation frame before the press displacement

### Requirement: Animation constraints
All animations SHALL use integer pixel values for position transforms, `steps(N)` or `linear` easing only (no ease/cubic-bezier), and a maximum duration of 300ms. Scale transforms are exempt from the integer rule but SHALL use `steps(N)` easing.

#### Scenario: No sub-pixel blur in animations
- **WHEN** any animation runs
- **THEN** no element uses fractional pixel values for translateX/translateY, and no smooth easing curves are applied
