## MODIFIED Requirements

### Requirement: Monster procrastination-type attribute tags
The system SHALL display species-specific fixed traits instead of randomly generated procrastination labels. Each species defines 1-2 traits as part of its identity.

#### Scenario: Traits come from species definition
- **WHEN** a monster is generated
- **THEN** the displayed traits are the species' fixed traits (e.g., 齿轮虫 always shows "🔩 卡壳·启动困难"), not randomly selected from a pool

#### Scenario: Trait display format
- **WHEN** traits are displayed on a monster card
- **THEN** each trait shows as "icon ability·effect" (e.g., "🔗 缠绕·冗长拖沓")

#### Scenario: Backward compatibility
- **WHEN** reading an old monster_variant with random attributes
- **THEN** the system still displays them correctly, but new monsters use species traits
