### Requirement: Starter items on onboarding completion
The system SHALL grant 5 units of 时间压缩 (equipment ID 10) to the player when onboarding is completed for the first time.

#### Scenario: New user completes onboarding
- **WHEN** `onboarding_completed` is set to true for the first time and `starter_items_granted` is false
- **THEN** 5 units of 时间压缩 are added to player_equipment and `starter_items_granted` is set to true in settings

#### Scenario: Onboarding already completed
- **WHEN** `starter_items_granted` is already true
- **THEN** no additional items are granted

### Requirement: First kill reward
The system SHALL grant 2 units of 烟雾弹 (equipment ID 7) to the player upon their first monster kill.

#### Scenario: Player kills first monster
- **WHEN** a monster's status changes to "killed" for the first time and `first_kill_reward_granted` is false
- **THEN** 2 units of 烟雾弹 are added to player_equipment and `first_kill_reward_granted` is set to true in settings

#### Scenario: Subsequent kills
- **WHEN** a monster is killed and `first_kill_reward_granted` is already true
- **THEN** no additional reward items are granted

### Requirement: First kill reward notification
The system SHALL display a reward notification card when the first kill reward is granted, introducing consumable item mechanics.

#### Scenario: First kill reward card display
- **WHEN** the first kill reward is granted
- **THEN** a pixel-styled card is displayed showing: the reward (2x 烟雾弹), a brief explanation of consumable usage ("消耗品可以在狩猎中使用，帮助你应对各种情况"), and how to obtain more ("在工坊中用番茄精华购买更多道具")

#### Scenario: Reward card dismissal
- **WHEN** user acknowledges the reward card
- **THEN** the card is dismissed and normal flow continues

### Requirement: Grant items utility
The system SHALL provide a method to grant items to the player by equipment ID and quantity, inserting or updating the player_equipment record.

#### Scenario: Grant items to player with no existing stock
- **WHEN** grantItems is called with equipment ID 10 and quantity 5, and the player owns 0 of that item
- **THEN** player_equipment is inserted with equipment_id=10, quantity=5

#### Scenario: Grant items to player with existing stock
- **WHEN** grantItems is called with equipment ID 7 and quantity 2, and the player already owns 1 of that item
- **THEN** player_equipment is updated to quantity=3 for equipment_id=7
