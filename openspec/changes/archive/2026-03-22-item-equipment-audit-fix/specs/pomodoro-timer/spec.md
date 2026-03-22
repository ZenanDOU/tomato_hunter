## ADDED Requirements

### Requirement: Rest phase extend break consumable
The system SHALL allow players to use the "休息延伸" consumable (ID 9) during the break/long_break phase to extend the current rest by 2 minutes.

#### Scenario: Use extend break during rest
- **WHEN** player is in break or long_break phase and owns at least one 休息延伸
- **THEN** the RestScreen SHALL display a "休息延伸" button showing the owned quantity

#### Scenario: Consume extend break
- **WHEN** player clicks the 休息延伸 button
- **THEN** the system SHALL consume one 休息延伸 item and extend the current break timer by 2 minutes

#### Scenario: Hide when not owned
- **WHEN** player does not own any 休息延伸
- **THEN** the button SHALL NOT be displayed

### Requirement: Prep phase skip consumable
The system SHALL allow players to use the "策略跳过" consumable (ID 11) during the prep phase to skip directly to the focus phase.

#### Scenario: Use skip prep during prep phase
- **WHEN** player is in prep phase and owns at least one 策略跳过
- **THEN** the PrepPhase SHALL display a "跳过策略" button showing the owned quantity

#### Scenario: Consume skip prep
- **WHEN** player clicks the 跳过策略 button
- **THEN** the system SHALL consume one 策略跳过 item and immediately advance to the focus phase

#### Scenario: Hide when not owned
- **WHEN** player does not own any 策略跳过
- **THEN** the button SHALL NOT be displayed

### Requirement: Review phase skip consumable
The system SHALL allow players to use the "复盘跳过" consumable (ID 12) during the review phase to skip the review and proceed with default values.

#### Scenario: Use skip review during review phase
- **WHEN** player is in review phase and owns at least one 复盘跳过
- **THEN** the ReviewPhase SHALL display a "跳过复盘" button showing the owned quantity

#### Scenario: Consume skip review
- **WHEN** player clicks the 跳过复盘 button
- **THEN** the system SHALL consume one 复盘跳过 item and call the review completion handler with default values (empty completion note "（跳过复盘）", no reflection type, empty reflection text)

#### Scenario: Hide when not owned
- **WHEN** player does not own any 复盘跳过
- **THEN** the button SHALL NOT be displayed
