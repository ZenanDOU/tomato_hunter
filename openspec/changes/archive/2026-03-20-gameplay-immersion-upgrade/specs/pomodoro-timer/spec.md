## ADDED Requirements

### Requirement: Pixel art style for hunt overlay
The system SHALL use pixel art visual style in the hunt overlay with pixel font for timer and phase labels.

#### Scenario: Prep phase visual style
- **WHEN** user is in the preparation phase
- **THEN** the overlay shows phase label "⚔️ 准备出击" with `.pixel-title` class, timer in pixel font

#### Scenario: Focus phase visual style
- **WHEN** user is in the focus phase
- **THEN** the timer displays in `.pixel-title` class, buttons have `.pixel-border` class

#### Scenario: Review phase visual style
- **WHEN** user is in the review phase
- **THEN** the phase label "📝 回顾阶段" uses `.pixel-title` class, submit button text is "完成复盘，领取战利品"
