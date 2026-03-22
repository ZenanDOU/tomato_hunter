## ADDED Requirements

### Requirement: PixelBackground component
The system SHALL provide a PixelBackground component that generates pixel-art scene backgrounds using offscreen Canvas. Generated backgrounds SHALL be cached as Canvas elements to avoid repainting.

#### Scenario: Background renders once and caches
- **WHEN** PixelBackground mounts with a scene config
- **THEN** the background is generated once (< 50ms), cached, and reused on re-renders without regeneration

### Requirement: Village background scene
The system SHALL render a village background with: sky gradient (light blue → white), distant mountain silhouettes (3 parallax layers), bottom grass color blocks, and randomly scattered small pixel patterns (trees, houses). The scene SHALL use a fixed seed for consistency across launches.

#### Scenario: Village background displays
- **WHEN** user is on the village screen
- **THEN** the background shows a multi-layered pixel landscape behind the UI content

### Requirement: Habitat backgrounds for focus phase
The system SHALL render distinct habitat-themed backgrounds during the focus phase, based on the current task's category. Each habitat has a unique base color, element outlines, and particle effects.

#### Scenario: Work task shows gear workshop background
- **WHEN** user is in focus phase with a work-category task
- **THEN** the background shows dark gray base with gear/pipe outlines and faint orange spark particles

#### Scenario: Creative task shows gallery background
- **WHEN** user is in focus phase with a creative-category task
- **THEN** the background shows deep purple base with picture frame outlines and falling paint flake particles

### Requirement: Particle system overlay
The system SHALL render 10-20 lightweight particles per habitat, using simple linear motion + opacity cycling on a Canvas layer. Particles SHALL use the shared animation loop at 8fps.

#### Scenario: Particles animate during focus
- **WHEN** user is in focus phase with habitat background active
- **THEN** particles move and fade smoothly at 8fps without impacting timer accuracy

### Requirement: Phase-specific background behavior
The system SHALL only display habitat backgrounds during the focus phase. Prep and review phases SHALL keep their current solid color backgrounds for readability. Rest/break phases SHALL display a light green background with grass and clouds.

#### Scenario: Prep phase has no habitat background
- **WHEN** user is in prep phase
- **THEN** the background is the current solid sky-blue color, not the habitat background

### Requirement: Rest background scene
The system SHALL render a rest background enhancing the existing #88DDAA base with a pixel grass strip at bottom and 2-3 slow-moving cloud shapes.

#### Scenario: Rest screen has scenic background
- **WHEN** user is on the rest/break screen
- **THEN** the background shows light green with grass and slow-moving clouds
