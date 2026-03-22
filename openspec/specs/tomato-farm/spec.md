## ADDED Requirements

### Requirement: Tomato Farm replaces Tomato Sanctuary
The system SHALL replace the Tomato Sanctuary (番茄收容所) with a Tomato Farm (番茄农场). Rescued tomatoes SHALL be displayed as farm inhabitants rather than sanctuary entries.

#### Scenario: Navigate to Tomato Farm
- **WHEN** user clicks the 🍅 tab in the village
- **THEN** the system displays the Tomato Farm view with: farm tomato count, current tomato essence balance, and production rate indicator

#### Scenario: Rescued tomato enters farm
- **WHEN** a monster is defeated (HP reaches 0)
- **THEN** the rescued tomato is added to the farm's tomato population count

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

### Requirement: Tomato Essence balance tracking
The system SHALL maintain a persistent Tomato Essence balance that accumulates across sessions. The balance SHALL be displayed in the farm view and the workshop.

#### Scenario: Balance persists across sessions
- **WHEN** user closes and reopens the app
- **THEN** the Tomato Essence balance is preserved from the previous session

#### Scenario: Balance displayed in workshop
- **WHEN** user opens the workshop
- **THEN** the current Tomato Essence balance is shown at the top of the consumables section

### Requirement: Tomato Farm visual display
The system SHALL display the farm with an enhanced warm visual design featuring pixel-art soil rows and growing tomato plants instead of a simple tomato wall grid. The display SHALL include current Tomato Essence balance with 🫘 icon, production rate per minute (reflecting active multipliers), active effect indicators, and interaction buttons (浇水/施肥).

#### Scenario: Farm overview display
- **WHEN** user opens the Tomato Farm
- **THEN** the view shows: pixel-art farm scene with plants at growth stages based on tomato count, "农场番茄: N 颗", "番茄素余额: M 🫘", "产出速率: K/分钟", active effect badges, and 浇水/施肥 action buttons

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

### Requirement: Fertilizing action in farm view
The system SHALL display a 施肥 button in the tomato farm view. The button SHALL show fertilizer inventory count and trigger the fertilizing interaction defined in the farm-interaction capability.

#### Scenario: Fertilizing button with inventory
- **WHEN** user has fertilizer in inventory
- **THEN** the farm view shows a 施肥 button with fertilizer count badge

#### Scenario: Fertilizing button without inventory
- **WHEN** user has no fertilizer
- **THEN** the button is disabled with tooltip pointing to the workshop

### Requirement: Tomato Fertilizer effect
The system SHALL support a "Tomato Fertilizer" consumable that doubles the farm's Tomato Essence production rate for 60 minutes of focus time (not wall-clock time).

#### Scenario: Fertilizer doubles production
- **WHEN** user activates Tomato Fertilizer and has 15 farm tomatoes (base rate: 2/min)
- **THEN** the production rate becomes 4/min for the next 60 minutes of focus time

#### Scenario: Fertilizer timer only counts focus time
- **WHEN** user activates Tomato Fertilizer and spends 20 minutes in focus then 5 minutes on break
- **THEN** 20 minutes of fertilizer time is consumed (40 minutes remain), not 25 minutes
