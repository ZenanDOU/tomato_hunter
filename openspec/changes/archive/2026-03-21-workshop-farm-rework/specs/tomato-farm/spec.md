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

### Requirement: Tomato Essence balance tracking
The system SHALL maintain a persistent Tomato Essence balance that accumulates across sessions. The balance SHALL be displayed in the farm view and the workshop.

#### Scenario: Balance persists across sessions
- **WHEN** user closes and reopens the app
- **THEN** the Tomato Essence balance is preserved from the previous session

#### Scenario: Balance displayed in workshop
- **WHEN** user opens the workshop
- **THEN** the current Tomato Essence balance is shown at the top of the consumables section

### Requirement: Tomato Farm visual display
The system SHALL display the farm with a tomato population grid (similar to the old tomato wall), current Tomato Essence balance with 🫘 icon, production rate per minute, and today's total production.

#### Scenario: Farm overview display
- **WHEN** user opens the Tomato Farm
- **THEN** the view shows: tomato grid (capped at 50 visible with "+N" overflow), "农场番茄: N 颗", "番茄素余额: M 🫘", "产出速率: K/分钟"

### Requirement: Tomato Fertilizer effect
The system SHALL support a "Tomato Fertilizer" consumable that doubles the farm's Tomato Essence production rate for 60 minutes of focus time (not wall-clock time).

#### Scenario: Fertilizer doubles production
- **WHEN** user activates Tomato Fertilizer and has 15 farm tomatoes (base rate: 2/min)
- **THEN** the production rate becomes 4/min for the next 60 minutes of focus time

#### Scenario: Fertilizer timer only counts focus time
- **WHEN** user activates Tomato Fertilizer and spends 20 minutes in focus then 5 minutes on break
- **THEN** 20 minutes of fertilizer time is consumed (40 minutes remain), not 25 minutes
