## ADDED Requirements

### Requirement: Consumable pricing in Tomato Essence
The system SHALL price all consumable items in Tomato Essence. Prices SHALL be stored in the equipment database table and displayed in the workshop UI.

#### Scenario: View consumable prices
- **WHEN** user opens the workshop consumables section
- **THEN** each consumable shows its price in Tomato Essence (e.g., "15 🫘") and a buy button

#### Scenario: Purchase consumable
- **WHEN** user clicks buy on a consumable and has sufficient Tomato Essence
- **THEN** the Tomato Essence balance decreases by the item price and the consumable quantity increases by 1

#### Scenario: Insufficient balance
- **WHEN** user attempts to buy a consumable but lacks sufficient Tomato Essence
- **THEN** the buy button is disabled and shows "余额不足"

### Requirement: Consumable price table
The system SHALL use the following base prices for consumables:

| Item | Price |
|------|-------|
| 烟雾弹（暂停） | 15 |
| 时间延伸（+3分钟） | 10 |
| 休息延伸（+2分钟） | 8 |
| 时间压缩（-5分钟） | 20 |
| 策略跳过 | 12 |
| 复盘跳过 | 12 |
| 双倍掉落 | 30 |
| 番茄肥料 | 25 |

#### Scenario: Smoke bomb costs 15 essence
- **WHEN** user buys a smoke bomb (烟雾弹)
- **THEN** 15 Tomato Essence is deducted from balance

### Requirement: Crafting recipe material mapping
The system SHALL define crafting recipes for non-default weapons and armor using category-specific materials from monster drops.

#### Scenario: Craft dagger requires gear materials
- **WHEN** user crafts a dagger (匕首)
- **THEN** the system requires and deducts: 齿轮零件×5 + 精密齿轮×1

#### Scenario: Craft hammer requires study materials
- **WHEN** user crafts a hammer (重锤)
- **THEN** the system requires and deducts: 知识结晶×8 + 智慧宝石×2

#### Scenario: Craft leather armor requires life materials
- **WHEN** user crafts leather armor (皮甲)
- **THEN** the system requires and deducts: 生活纤维×5 + 生命露珠×1

#### Scenario: Craft heavy armor requires creative + universal materials
- **WHEN** user crafts heavy armor (重甲)
- **THEN** the system requires and deducts: 墨水碎片×5 + 灵感精华×1 + 通用碎片×3

### Requirement: Default equipment is free
The system SHALL grant sword (手剑) and cotton armor (棉甲) to all players for free. These items SHALL NOT require crafting or materials.

#### Scenario: New player starts with defaults
- **WHEN** a new player starts the game
- **THEN** the player owns and has equipped: 手剑 (sword, default weapon) and 棉甲 (cotton armor, default armor), with 0 consumables

### Requirement: Double loot consumable effect
The system SHALL support a "Double Loot" consumable that doubles all material drops for the next completed pomodoro.

#### Scenario: Double loot applied
- **WHEN** user activates Double Loot before a hunt and completes the pomodoro
- **THEN** all material drop quantities are doubled (common and rare)

#### Scenario: Double loot consumed on completion
- **WHEN** user completes a pomodoro with Double Loot active
- **THEN** the Double Loot effect is consumed (single use) regardless of drop results
