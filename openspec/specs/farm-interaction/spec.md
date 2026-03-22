### Requirement: Watering interaction
The system SHALL provide a free watering action in the tomato farm. Watering SHALL have a 30-minute real-time cooldown. After watering, the next focus phase's tomato essence production SHALL increase by 50%.

#### Scenario: Water the farm
- **WHEN** user clicks the 浇水 button and cooldown has expired
- **THEN** the farm enters「润泽」state, a water droplet animation plays on the farm view, and the 浇水 button shows the remaining cooldown timer

#### Scenario: Watering on cooldown
- **WHEN** user attempts to water and cooldown has not expired
- **THEN** the 浇水 button is disabled and shows remaining cooldown time (e.g., "12:30")

#### Scenario: Watering production boost applies to next focus
- **WHEN** farm is in「润泽」state and user completes a focus phase
- **THEN** tomato essence produced during that focus phase is multiplied by 1.5 (rounded down), and the「润泽」state is consumed

#### Scenario: Watering cooldown resets on app restart
- **WHEN** user restarts the app
- **THEN** the watering cooldown resets to 0 (available immediately)

### Requirement: Fertilizing interaction
The system SHALL provide a fertilizing action that consumes 1 Tomato Fertilizer consumable (equipment ID 15). Fertilizing SHALL trigger the existing fertilizer effect (double production for 60 minutes of focus time) with added visual feedback.

#### Scenario: Fertilize the farm
- **WHEN** user clicks the 施肥 button and has at least 1 Tomato Fertilizer in inventory
- **THEN** the system consumes 1 fertilizer, activates the double production effect, and plays a plant-glow animation on the farm

#### Scenario: No fertilizer available
- **WHEN** user has 0 Tomato Fertilizer in inventory
- **THEN** the 施肥 button is disabled with tooltip "需要番茄肥料（可在工坊购买）"

#### Scenario: Watering and fertilizing stack additively
- **WHEN** farm has both「润泽」state and active fertilizer effect
- **THEN** the production multiplier SHALL be 2.5x (base 1.0 + watering 0.5 + fertilizer 1.0), not multiplicative

### Requirement: Farm visual enhancement
The system SHALL display the tomato farm with a warm, cozy visual design featuring soil rows, growing tomato plants at varying growth stages, and ambient visual elements that convey a sense of nurturing and harvest.

#### Scenario: Farm displays plant growth stages
- **WHEN** user views the tomato farm
- **THEN** tomatoes are displayed as pixel-art plants in soil rows, with growth stages based on farm tomato count tiers: sprout (1-10), growing (11-25), mature (26-50), abundant (50+)

#### Scenario: Active effects shown on farm
- **WHEN** farm has active watering or fertilizer effects
- **THEN** the farm view shows visual indicators: water droplets for watering, golden glow for fertilizer, with remaining duration displayed

#### Scenario: Farm stats displayed clearly
- **WHEN** user views the farm
- **THEN** the farm shows: 农场番茄 count, 番茄素余额, current production rate (including any active multipliers), and active effect status
