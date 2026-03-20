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
The system SHALL support three equipment types: weapons (modify timer rhythm), armor (modify tolerance), and consumable items.

#### Scenario: Weapon changes timer parameters
- **WHEN** user equips a weapon with effect {"type":"timer","focus_minutes":50,"break_minutes":10,"long_break_minutes":20,"rounds_before_long_break":4}
- **THEN** the next hunt uses these timer parameters instead of the defaults

#### Scenario: Armor defines pause tolerance
- **WHEN** user equips armor with effect {"type":"tolerance","max_pause_duration_seconds":180,"allow_brief_interrupt":true,"brief_interrupt_seconds":60}
- **THEN** the tolerance parameters are applied during hunts

#### Scenario: Consumable single use
- **WHEN** user uses a consumable item (e.g., smoke bomb for pause)
- **THEN** the item quantity decreases by 1 and is removed from inventory when quantity reaches 0

### Requirement: Recipe-based crafting system
The system SHALL allow users to craft equipment in the workshop using collected materials. Recipes define required materials and quantities.

#### Scenario: Craft equipment with sufficient materials
- **WHEN** user has all required materials for a recipe and clicks "制作"
- **THEN** the system deducts the materials and adds the equipment to the player's inventory

#### Scenario: Cannot craft without sufficient materials
- **WHEN** user lacks one or more required materials
- **THEN** the craft button is disabled and shows "素材不足"

#### Scenario: Recipe discovery via rare materials
- **WHEN** user obtains a rare material for the first time
- **THEN** the system unlocks any equipment recipes that require that material and shows "新配方发现！"

### Requirement: Loadout management
The system SHALL allow users to equip one weapon, one armor, and multiple consumable items as their active loadout.

#### Scenario: Equip weapon
- **WHEN** user selects a weapon from their inventory
- **THEN** the loadout's weapon_id is updated and the weapon's timer effect applies to future hunts

#### Scenario: Equip armor
- **WHEN** user selects an armor from their inventory
- **THEN** the loadout's armor_id is updated and the armor's tolerance effect applies to future hunts

#### Scenario: Default starter gear
- **WHEN** a new player starts the game
- **THEN** the player owns and has equipped: 标准短刀 (25min weapon), 皮甲 (basic armor), and 3x 烟雾弹 (pause consumable)

### Requirement: Strategy-based growth without number inflation
The system SHALL NOT implement level systems, experience points, talent trees, or percentage-based stat boosts. Growth comes from unlocking more equipment options and learning effective build strategies.

#### Scenario: No level-up mechanic
- **WHEN** a user completes many pomodoros
- **THEN** no experience bar, level counter, or numeric power increase is shown

#### Scenario: Growth through equipment diversity
- **WHEN** a user discovers new recipes and crafts equipment
- **THEN** they gain access to more timer configurations and tolerance settings, expanding their strategic options
