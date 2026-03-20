## ADDED Requirements

### Requirement: Monster procrastination-type attribute tags
The system SHALL generate 1-3 attribute tags for each monster based on task category and difficulty. Attributes represent the type of procrastination the monster embodies (e.g., work→拖延/分心/焦虑, creative→完美主义/灵感枯竭/自我怀疑).

#### Scenario: Attribute generation on identify
- **WHEN** a task is identified (侦查敌情)
- **THEN** the system assigns attributes from a category-specific procrastination pool using a deterministic hash based on task name

#### Scenario: Difficulty affects attribute count
- **WHEN** a monster is simple difficulty → 1 attribute
- **WHEN** a monster is medium or hard difficulty → 2 attributes
- **WHEN** a monster is epic or legendary difficulty → 3 attributes

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
