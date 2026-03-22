## ADDED Requirements

### Requirement: Category-based material drops
The system SHALL drop materials after each completed pomodoro based on the task's category. Common materials are guaranteed; rare materials have a probability-based drop rate.

#### Scenario: Guaranteed common drop
- **WHEN** a pomodoro completes successfully
- **THEN** the system drops at least 1 category-specific common material and 1 universal common material

#### Scenario: Rare material drop
- **WHEN** a pomodoro completes successfully
- **THEN** there is a 20% base chance (+ 5% per consecutive pomodoro, max 50%) of dropping a rare material from the task's category pool

#### Scenario: Consecutive completion bonus
- **WHEN** a user completes 3 or more pomodoros consecutively
- **THEN** the common material drop quantity increases by 1 per 3 consecutive completions

#### Scenario: Rare variant bonus loot
- **WHEN** a pomodoro is completed against a rare variant monster
- **THEN** the rare material drop chance is doubled

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

### Requirement: Recipe-based crafting system
The system SHALL allow users to craft weapons and armor in the workshop using collected materials. Consumables are NOT craftable — they are purchased with Tomato Essence. The crafting material deduction SHALL use atomic SQL operations to prevent double-spending when concurrent craft requests occur.

#### Scenario: Craft equipment with sufficient materials
- **WHEN** user has all required materials for a recipe and clicks "制作"
- **THEN** the system deducts the materials atomically within a transaction using `UPDATE ... WHERE quantity >= needed`, adds the equipment to the player's inventory, and verifies all deductions succeeded before committing

#### Scenario: Cannot craft without sufficient materials
- **WHEN** user lacks one or more required materials
- **THEN** the craft button is disabled and shows "素材不足"

#### Scenario: Concurrent craft requests
- **WHEN** two craft requests for the same recipe execute simultaneously and only enough materials exist for one
- **THEN** exactly one request SHALL succeed and one SHALL fail; materials SHALL never go negative

#### Scenario: Craft fails midway through material deduction
- **WHEN** the database fails while deducting the 2nd of 3 required materials
- **THEN** all material deductions SHALL be rolled back (no partial deduction), and the user sees an error

#### Scenario: Recipe discovery via rare materials
- **WHEN** user obtains a rare material for the first time
- **THEN** the system unlocks any equipment recipes that require that material and shows "新配方发现！"

#### Scenario: First rare material unlocks recipe
- **WHEN** player receives a rare material (rarity = "rare") and their previous quantity of that material was 0
- **THEN** the system SHALL set `unlocked = 1` for all equipment whose recipe includes that material ID, and return the list of newly unlocked equipment names

#### Scenario: Subsequent rare material does not re-trigger
- **WHEN** player receives a rare material they already own (previous quantity > 0)
- **THEN** no unlock action is performed

#### Scenario: New recipe discovery notification
- **WHEN** one or more equipment recipes are unlocked after a hunt
- **THEN** the review completion flow SHALL display a "新配方发现！" notification listing the unlocked equipment names

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

### Requirement: Strategy-based growth without number inflation
The system SHALL NOT implement level systems, experience points, talent trees, or percentage-based stat boosts. Growth comes from unlocking more equipment options and learning effective build strategies.

#### Scenario: No level-up mechanic
- **WHEN** a user completes many pomodoros
- **THEN** no experience bar, level counter, or numeric power increase is shown

#### Scenario: Growth through equipment diversity
- **WHEN** a user discovers new recipes and crafts equipment
- **THEN** they gain access to more timer configurations and tolerance settings, expanding their strategic options

### Requirement: Consumable naming convention
The system SHALL use narrative-style names for all consumable items that fit the hunting/adventure world theme, rather than functional descriptions.

#### Scenario: Consumable names in database
- **WHEN** the equipment table stores consumable items
- **THEN** names SHALL be: 烟雾弹, 持久药水, 温泉券, 疾风符咒, 猎人直觉, 战场速记, 幸运护符, 丰收祈愿

#### Scenario: Consumable names in workshop UI
- **WHEN** the workshop displays consumable items for purchase
- **THEN** items SHALL show their narrative names with functional descriptions as secondary text

<!-- REMOVED: Requirement: Armor defines pause tolerance -->
<!-- Reason: Armor now defines focus phase audio experience instead of pause tolerance. Pause is handled by the smoke bomb consumable. -->
<!-- Migration: All existing armor tolerance effects are removed. Armor effect JSON changes from {"type":"tolerance",...} to {"type":"audio","audio_mode":"silent|white-noise|interval-alert"}. -->

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

### Requirement: Crafting feedback
The system SHALL provide clear visual and audio feedback when the player crafts equipment in the Workshop.

#### Scenario: Successful craft
- **WHEN** player clicks "制作" and crafting succeeds
- **THEN** the system SHALL play a craft sound effect and the button SHALL briefly display "制作成功！✅" for 1.5 seconds before reverting to normal state

#### Scenario: Equip after craft
- **WHEN** player successfully crafts equipment they don't yet own
- **THEN** the crafted equipment SHALL appear in the inventory and be available for immediate equipping
