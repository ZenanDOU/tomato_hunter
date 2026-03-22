## MODIFIED Requirements

### Requirement: Consumable timer modifiers
The system SHALL support consumables that modify the active timer during a hunt. Consumable names SHALL use narrative-style naming consistent with the hunting world theme.

#### Scenario: Pause with smoke bomb (烟雾弹)
- **WHEN** user uses "烟雾弹" to pause
- **THEN** the timer pauses for up to 3 minutes

#### Scenario: Extend focus with persistence potion (持久药水)
- **WHEN** user uses "持久药水" during review phase (before completing)
- **THEN** focus phase extends by 3 minutes (timer rewinds to focus phase with 3 minutes remaining)

#### Scenario: Extend break with hot spring ticket (温泉券)
- **WHEN** user uses "温泉券" during break phase
- **THEN** break timer extends by 2 minutes

#### Scenario: Shorten focus with gale charm (疾风符咒)
- **WHEN** user uses "疾风符咒" during focus phase
- **THEN** remaining focus time is reduced by 5 minutes (minimum 1 minute remaining)

#### Scenario: Skip strategy with hunter instinct (猎人直觉)
- **WHEN** user uses "猎人直觉" during prep phase
- **THEN** prep phase ends immediately and focus phase begins

#### Scenario: Skip review with battle notes (战场速记)
- **WHEN** user uses "战场速记" after focus phase
- **THEN** review phase is skipped, pomodoro is marked complete with empty completion note, and loot/damage proceeds normally

#### Scenario: Double loot with lucky charm (幸运护符)
- **WHEN** user uses "幸运护符" before a hunt
- **THEN** the next hunt's material drops are doubled

#### Scenario: Fertilizer with harvest prayer (丰收祈愿)
- **WHEN** user uses "丰收祈愿"
- **THEN** farm output doubles for 60 minutes of focus time

### Requirement: Consumable naming convention
The system SHALL use narrative-style names for all consumable items that fit the hunting/adventure world theme, rather than functional descriptions.

#### Scenario: Consumable names in database
- **WHEN** the equipment table stores consumable items
- **THEN** names SHALL be: 烟雾弹, 持久药水, 温泉券, 疾风符咒, 猎人直觉, 战场速记, 幸运护符, 丰收祈愿

#### Scenario: Consumable names in workshop UI
- **WHEN** the workshop displays consumable items for purchase
- **THEN** items SHALL show their narrative names with functional descriptions as secondary text
