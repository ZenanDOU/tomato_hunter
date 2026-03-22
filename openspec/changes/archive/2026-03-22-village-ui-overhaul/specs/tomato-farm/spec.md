## ADDED Requirements

### Requirement: Watering action in farm view
The system SHALL display a 浇水 button in the tomato farm view. The button SHALL show cooldown status and trigger the watering interaction defined in the farm-interaction capability.

#### Scenario: Watering button displayed
- **WHEN** user opens the tomato farm
- **THEN** the farm view shows a 浇水 button with water droplet icon, enabled when cooldown has expired

#### Scenario: Watering button during cooldown
- **WHEN** watering is on cooldown
- **THEN** the button shows remaining time and is disabled

### Requirement: Fertilizing action in farm view
The system SHALL display a 施肥 button in the tomato farm view. The button SHALL show fertilizer inventory count and trigger the fertilizing interaction defined in the farm-interaction capability.

#### Scenario: Fertilizing button with inventory
- **WHEN** user has fertilizer in inventory
- **THEN** the farm view shows a 施肥 button with fertilizer count badge

#### Scenario: Fertilizing button without inventory
- **WHEN** user has no fertilizer
- **THEN** the button is disabled with tooltip pointing to the workshop

## MODIFIED Requirements

### Requirement: Tomato Farm visual display
The system SHALL display the farm with an enhanced warm visual design featuring pixel-art soil rows and growing tomato plants instead of a simple tomato wall grid. The display SHALL include current Tomato Essence balance with 🫘 icon, production rate per minute (reflecting active multipliers), active effect indicators, and interaction buttons (浇水/施肥).

#### Scenario: Farm overview display
- **WHEN** user opens the Tomato Farm
- **THEN** the view shows: pixel-art farm scene with plants at growth stages based on tomato count, "农场番茄: N 颗", "番茄素余额: M 🫘", "产出速率: K/分钟", active effect badges, and 浇水/施肥 action buttons

## REMOVED Requirements

### Requirement: Battle history in farm view
**Reason**: Battle history is relocated to the hunter profile tab's「战斗日志」section, where it fits better alongside statistics and bestiary as part of the hunter's complete record.
**Migration**: Access battle history through the 档案 tab's 战斗日志 section.
