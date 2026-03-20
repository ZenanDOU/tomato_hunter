## ADDED Requirements

### Requirement: Monster family ecosystem
The system SHALL organize all monster species into 5 families, each corresponding to a task category, with a shared habitat and evolutionary progression from juvenile to adult to king tier.

#### Scenario: Family data available
- **WHEN** the bestiary is loaded
- **THEN** each species belongs to exactly one family and has a tier (juvenile/adult/king), habitat description, and visual description for pixel art reference

#### Scenario: Evolution chain coherence
- **WHEN** a user encounters species from the same family at different difficulties
- **THEN** the species share visual traits and family name, making the evolutionary relationship apparent

### Requirement: Species-specific fixed traits
The system SHALL assign each species 1-2 fixed traits that describe its core behavior. Traits use the format "ability name · effect description" (e.g., "缠绕·冗长拖沓").

#### Scenario: Traits display on monster card
- **WHEN** a monster's species is determined
- **THEN** the system displays the species' fixed traits (not random attributes) as the monster's characteristics

#### Scenario: Trait progression within family
- **WHEN** comparing species in the same evolution chain
- **THEN** juvenile has 1 trait, adult has 2 traits, king has 2 traits with stronger effects
