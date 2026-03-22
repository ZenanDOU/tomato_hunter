## MODIFIED Requirements

### Requirement: Watering action in farm view
The system SHALL display a 浇水 button in the tomato farm view. The button SHALL show cooldown status and trigger the watering interaction defined in the farm-interaction capability. Watering state (is_watered, watering_cooldown_end) SHALL be persisted in the database so that the state survives app restarts.

#### Scenario: Watering button displayed
- **WHEN** user opens the tomato farm
- **THEN** the farm view shows a 浇水 button with water droplet icon, enabled when cooldown has expired

#### Scenario: Watering button during cooldown
- **WHEN** watering is on cooldown
- **THEN** the button shows remaining time and is disabled

#### Scenario: Watering state persists across restart
- **WHEN** user waters the farm, closes the app, and reopens it
- **THEN** the watering bonus SHALL still be active if the cooldown has not expired, and the cooldown timer SHALL show the correct remaining time

#### Scenario: Watering cooldown expires while app is closed
- **WHEN** user waters the farm, closes the app, and reopens it after the 30-minute cooldown has expired
- **THEN** the watering bonus SHALL be inactive, and the 浇水 button SHALL be enabled again

### Requirement: Tomato Essence passive production
The system SHALL produce Tomato Essence (番茄素) passively during focus phases. Production rate SHALL be calculated as `floor(farm_tomato_count / 10) + 1` per minute of focus time.

#### Scenario: Base production rate with few tomatoes
- **WHEN** user has 5 tomatoes in the farm and completes 20 minutes of focus
- **THEN** the system produces 20 Tomato Essence (1 per minute × 20 minutes)

#### Scenario: Increased production with more tomatoes
- **WHEN** user has 25 tomatoes in the farm and completes 20 minutes of focus
- **THEN** the system produces 60 Tomato Essence (3 per minute × 20 minutes)

#### Scenario: Production only during focus phase
- **WHEN** user is in prep, review, or break phase
- **THEN** no Tomato Essence is produced

#### Scenario: Watering consumed correctly during production tick
- **WHEN** the production tick fires and `is_watered` is true
- **THEN** the watering multiplier SHALL be applied for the current tick, and `is_watered` SHALL be set to false in the database after consumption
