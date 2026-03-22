## ADDED Requirements

### Requirement: Rare material unlocks equipment recipes
The system SHALL automatically unlock equipment recipes when the player obtains a rare material for the first time. The unlock check SHALL happen during the loot application process after each completed pomodoro.

#### Scenario: First rare material unlocks recipe
- **WHEN** player receives a rare material (rarity = "rare") and their previous quantity of that material was 0
- **THEN** the system SHALL set `unlocked = 1` for all equipment whose recipe includes that material ID, and return the list of newly unlocked equipment names

#### Scenario: Subsequent rare material does not re-trigger
- **WHEN** player receives a rare material they already own (previous quantity > 0)
- **THEN** no unlock action is performed

#### Scenario: New recipe discovery notification
- **WHEN** one or more equipment recipes are unlocked after a hunt
- **THEN** the review completion flow SHALL display a "新配方发现！" notification listing the unlocked equipment names

### Requirement: Crafting feedback
The system SHALL provide clear visual and audio feedback when the player crafts equipment in the Workshop.

#### Scenario: Successful craft
- **WHEN** player clicks "制作" and crafting succeeds
- **THEN** the system SHALL play a craft sound effect and the button SHALL briefly display "制作成功！✅" for 1.5 seconds before reverting to normal state

#### Scenario: Equip after craft
- **WHEN** player successfully crafts equipment they don't yet own
- **THEN** the crafted equipment SHALL appear in the inventory and be available for immediate equipping
