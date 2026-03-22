## MODIFIED Requirements

### Requirement: Three equipment types with distinct effects
The system SHALL support three equipment types: weapons (define timer rhythm/mode), armor (define focus phase audio experience), and consumable items (purchased with Tomato Essence).

#### Scenario: Weapon defines timer mode
- **WHEN** user equips a weapon
- **THEN** the next hunt uses that weapon's timer mode (sword/dagger/hammer) with its unique flow logic

#### Scenario: Armor defines focus audio
- **WHEN** user equips an armor
- **THEN** the next hunt's focus phase uses that armor's audio mode (silent/white-noise/interval-alert)

#### Scenario: Consumable purchased with Tomato Essence
- **WHEN** user buys a consumable item from the workshop
- **THEN** the item quantity increases by 1 and Tomato Essence balance decreases by the item's price

### Requirement: Loadout management
The system SHALL allow users to equip one weapon, one armor, and multiple consumable items as their active loadout.

#### Scenario: Equip weapon
- **WHEN** user selects a weapon from their inventory
- **THEN** the loadout's weapon_id is updated and the weapon's timer mode applies to future hunts

#### Scenario: Equip armor
- **WHEN** user selects an armor from their inventory
- **THEN** the loadout's armor_id is updated and the armor's audio mode applies to future hunts

#### Scenario: Default starter gear
- **WHEN** a new player starts the game
- **THEN** the player owns and has equipped: 手剑 (sword, default weapon) and 棉甲 (cotton armor, default armor), with 0 consumables

### Requirement: Recipe-based crafting system
The system SHALL allow users to craft weapons and armor in the workshop using collected materials. Consumables are NOT craftable — they are purchased with Tomato Essence.

#### Scenario: Craft equipment with sufficient materials
- **WHEN** user has all required materials for a recipe and clicks "制作"
- **THEN** the system deducts the materials and adds the equipment to the player's inventory

#### Scenario: Cannot craft without sufficient materials
- **WHEN** user lacks one or more required materials
- **THEN** the craft button is disabled and shows "素材不足"

#### Scenario: Recipe discovery via rare materials
- **WHEN** user obtains a rare material for the first time
- **THEN** the system unlocks any equipment recipes that require that material and shows "新配方发现！"

## REMOVED Requirements

### Requirement: Armor defines pause tolerance
**Reason**: Armor now defines focus phase audio experience instead of pause tolerance. Pause is handled by the smoke bomb consumable.
**Migration**: All existing armor tolerance effects are removed. Armor effect JSON changes from `{"type":"tolerance",...}` to `{"type":"audio","audio_mode":"silent|white-noise|interval-alert"}`.
