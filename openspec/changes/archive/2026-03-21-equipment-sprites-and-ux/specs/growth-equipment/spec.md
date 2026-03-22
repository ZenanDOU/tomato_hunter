## ADDED Requirements

### Requirement: Equipment pixel sprites
Each weapon and armor equipment item SHALL have an associated 32x32 pixel sprite. Sprites SHALL be rendered using the existing PixelSprite component. Consumable items do NOT require sprites.

#### Scenario: Weapon sprite displayed in workshop
- **WHEN** a weapon (sword, dagger, hammer) is rendered in the Workshop
- **THEN** its 32x32 pixel sprite is displayed alongside the equipment name

#### Scenario: Armor sprite displayed in workshop
- **WHEN** an armor (cotton, leather, heavy) is rendered in the Workshop
- **THEN** its 32x32 pixel sprite is displayed alongside the equipment name

#### Scenario: Missing sprite fallback
- **WHEN** an equipment item has no associated sprite
- **THEN** a text-based fallback icon is shown instead

### Requirement: Equipment card collapsed view
Equipment cards in the Workshop SHALL display a collapsed view by default, showing only: the sprite, the equipment name, a one-line summary of the core effect, and the current status (equipped/locked/craftable). The full description and action buttons SHALL be hidden in collapsed view.

#### Scenario: Collapsed weapon card
- **WHEN** a weapon card is in collapsed state
- **THEN** it shows the sprite, name, short description (e.g., "25 min standard rhythm"), and status tag

#### Scenario: Collapsed armor card
- **WHEN** an armor card is in collapsed state
- **THEN** it shows the sprite, name, short description (e.g., "Silent mode"), and status tag

### Requirement: Equipment card expanded view
Clicking an equipment card SHALL toggle an expanded detail panel showing: the full description/rules, crafting material requirements (if applicable), and action buttons (equip/craft).

#### Scenario: Expand equipment card
- **WHEN** user clicks a collapsed equipment card
- **THEN** the card expands to show the full description, material requirements, and action buttons

#### Scenario: Collapse equipment card
- **WHEN** user clicks an expanded equipment card header
- **THEN** the card collapses back to the summary view

### Requirement: Consumable card simplified view
Consumable item cards SHALL show a collapsed view with name and price, expandable to show the effect description.

#### Scenario: Collapsed consumable card
- **WHEN** a consumable item is rendered in the Workshop
- **THEN** it shows name, price button, and owned quantity — without the full effect description

#### Scenario: Expanded consumable card
- **WHEN** user clicks a consumable card
- **THEN** the effect description is revealed below
