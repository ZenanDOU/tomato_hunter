## ADDED Requirements

### Requirement: 32x32 animated pixel sprites
The system SHALL render monster sprites at 32x32 resolution with multi-frame animations: idle (2 frames at 4fps loop), hit (1 frame triggered on damage), defeat (2 frames triggered on HP=0). The canonical SpriteData type SHALL be defined in src/types/index.ts.

#### Scenario: Monster idle animation
- **WHEN** a monster sprite is displayed in PrepPhase
- **THEN** it renders at 32x32 with a 2-frame breathing/floating loop at 4fps

#### Scenario: Fallback for missing sprites
- **WHEN** a species has no 32x32 SpriteData
- **THEN** the system falls back to legacy 16x16 at 2x scale, then to emoji character

### Requirement: Expanded color palette per habitat
The system SHALL support 8-12 color palettes per habitat for sprites, up from 4-6. Palette indices use numbers (not single-char encoding) to support palettes exceeding 10 colors.

#### Scenario: Palette with 12 colors renders correctly
- **WHEN** a sprite uses palette index 11
- **THEN** the correct 12th color from the palette array is rendered

### Requirement: Visual consistency - approved color palette
The system SHALL only use approved palette colors in UI components. Core UI: sky #55BBEE, tomato #EE4433, sunny #FFD93D, grass #5BBF47, cloud #FFFFFF, pixel-black #333333, orange #FF8844, cream #FFF8E8, deep-blue #3366AA, pink #FFCCDD. Extended: light-blue #DDEEFF, mint #88DDAA, monster-bg #443355. Functional grays: #CCCCCC, #999999, #AAAAAA, #EEEEEE, #666666.

#### Scenario: No Tailwind default colors in UI
- **WHEN** any UI component renders
- **THEN** no Tailwind default number-scale colors (stone-*, amber-*, red-*, blue-*, purple-*, green-*) are used

### Requirement: Unified pixel focus states
All focusable elements SHALL use a pixel-style focus indicator: `outline-[#FFD93D] outline-2` (sunny yellow), replacing browser default focus rings.

#### Scenario: Button receives focus
- **WHEN** a PixelButton receives keyboard focus
- **THEN** a 2px sunny yellow (#FFD93D) outline appears around it

### Requirement: Remove non-pixel-style ProgressBar
The system SHALL remove or replace the legacy ProgressBar.tsx component that uses non-pixel styles (rounded corners, Tailwind default colors, smooth transitions). PixelProgressBar SHALL be the only progress bar component.

#### Scenario: No rounded progress bars
- **WHEN** any progress indication is shown
- **THEN** it uses PixelProgressBar with square corners and pixel-border styling
