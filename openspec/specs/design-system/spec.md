## ADDED Requirements

### Requirement: Unified color palette from Tomato Train brand
The system SHALL define a CSS theme using the Tomato Train color palette as CSS variables, applied globally.

#### Scenario: Theme variables available
- **WHEN** any component renders
- **THEN** the following CSS variables are available: --color-sky (#55BBEE), --color-grass (#5BBF47), --color-tomato (#EE4433), --color-sunny (#FFD93D), --color-cloud (#FFFFFF), --color-pixel-black (#333333), --color-orange (#FF8844), --color-cream (#FFF8E8), --color-deep-blue (#3366AA), --color-pink (#FFCCDD)

### Requirement: PixelButton component with five states
The system SHALL provide a PixelButton component implementing Normal, Hover, Pressed, Disabled, and CTA states with pixel-style borders.

#### Scenario: CTA button style
- **WHEN** PixelButton variant is "cta"
- **THEN** fill is #EE4433, border is 2px #333333, text is white

#### Scenario: Disabled button style
- **WHEN** PixelButton is disabled
- **THEN** fill is #CCCCCC, border is 2px #999999, text is #999999

### Requirement: PixelCard component
The system SHALL provide a PixelCard container with 2px pixel-black border, right-bottom shadow, and configurable background (cloud white or cream).

#### Scenario: Card with shadow
- **WHEN** PixelCard renders
- **THEN** it has 2px #333333 outline and 2px right-bottom shadow

### Requirement: PixelProgressBar component
The system SHALL provide a PixelProgressBar with segmented pure-color fill (no gradients), 2px border, pixel-style appearance.

#### Scenario: HP progress bar
- **WHEN** PixelProgressBar shows monster HP
- **THEN** fill color is tomato red #EE4433, background is white, border is 2px #333333
