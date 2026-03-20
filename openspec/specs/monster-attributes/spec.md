## ADDED Requirements

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

### Requirement: Attribute visual display
The system SHALL display monster attributes as colored tags wherever the monster is shown (hunt list, inbox after identification).

#### Scenario: Attribute tags in hunt list
- **WHEN** user views a monster in the hunt list
- **THEN** each attribute is displayed as a small colored badge (work=blue, study=purple, creative=pink, life=green, other=gray)

### Requirement: Attribute storage with backward compatibility
The system SHALL store attributes in the existing `monster_variant` field as JSON `{"variant":"normal","attributes":["拖延","分心"]}`, maintaining backward compatibility with old plain string values ("normal", "rare").

#### Scenario: Read old format variant
- **WHEN** the system reads a monster_variant that is a plain string
- **THEN** it treats it as `{"variant":"<value>","attributes":[]}` for display purposes

#### Scenario: Read new format variant
- **WHEN** the system reads a monster_variant that is a JSON object
- **THEN** it parses the variant and attributes from the JSON
