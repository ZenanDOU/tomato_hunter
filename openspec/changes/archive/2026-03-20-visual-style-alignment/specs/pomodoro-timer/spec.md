## MODIFIED Requirements

### Requirement: Pixel art style for hunt overlay
The system SHALL use the Tomato Train color palette in the hunt overlay, with phase-specific color schemes: prep phase uses sky blue #55BBEE, focus phase uses deep blue #3366AA, review phase uses cream #FFF8E8, settlement uses cloud white with sunny yellow accents.

#### Scenario: Prep phase visual style
- **WHEN** user is in the preparation phase
- **THEN** background is sky blue #55BBEE, text is pixel black, buttons use PixelButton component, monster info displayed in PixelCard

#### Scenario: Focus phase visual style
- **WHEN** user is in the focus phase
- **THEN** background is deep blue #3366AA, timer text is white, progress bar uses PixelProgressBar with tomato red fill

#### Scenario: Review phase visual style
- **WHEN** user is in the review phase
- **THEN** background is cream #FFF8E8, text is pixel black, submit button uses PixelButton CTA variant

#### Scenario: Settlement visual style
- **WHEN** user sees the settlement screen
- **THEN** background is cloud white, title uses sunny yellow #FFD93D accent, loot items displayed in PixelCard
