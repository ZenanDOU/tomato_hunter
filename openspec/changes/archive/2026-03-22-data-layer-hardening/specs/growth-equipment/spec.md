## MODIFIED Requirements

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
