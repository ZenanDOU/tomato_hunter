## MODIFIED Requirements

### Requirement: Monster body part splitting
The system SHALL allow users to split monsters into a user-defined number of body parts (minimum 2, maximum equal to `total_hp`). The first 3 parts SHALL use the species-specific icons, labels, and hints from the bestiary; additional parts SHALL use generic identifiers.

#### Scenario: Default split count based on difficulty
- **WHEN** user opens the split form for an epic monster with 6 total_hp
- **THEN** the form defaults to 4 body parts with approximately equal pomodoro distribution

#### Scenario: Default split count for simple monster
- **WHEN** user opens the split form for a simple monster with 2 total_hp
- **THEN** the form defaults to 2 body parts, each with 1 pomodoro

#### Scenario: Add extra body part
- **WHEN** user clicks "添加部位" in the split form (current parts < total_hp)
- **THEN** a new part is appended with a generic icon/label and 1 pomodoro, and the remaining pomodoros are redistributed

#### Scenario: Remove body part
- **WHEN** user clicks "移除部位" in the split form (current parts > 2)
- **THEN** the last part is removed and its pomodoros are added to the previous part

#### Scenario: Species-specific parts for first 3
- **WHEN** user splits a 齿轮虫 into 5 parts
- **THEN** parts 1-3 show 🔩 甲壳 / ⚙️ 内核 / 🦿 足节, and parts 4-5 show generic icons with labels "部位 4" / "部位 5"

#### Scenario: Maximum split count capped at total_hp
- **WHEN** a monster has total_hp of 3
- **THEN** the "添加部位" button is disabled when 3 parts exist (each part needs at least 1 pomodoro)

#### Scenario: Body part stored with correct key
- **WHEN** a split is created with 4 parts
- **THEN** the body_part field stores species keys for parts 1-3 (e.g., "shell", "core", "legs") and "extra-1" for part 4

## ADDED Requirements

### Requirement: Even pomodoro distribution on split count change
The system SHALL redistribute pomodoros evenly when the number of parts changes, using `floor(total_hp / count)` per part with the remainder added to the first part.

#### Scenario: Redistribute on add
- **WHEN** user adds a 5th part to a monster with 8 total_hp
- **THEN** pomodoros are redistributed: part 1 gets 2 (floor 1 + remainder 3... no), parts get [2, 1, 1, 1, 1]... let me recalculate: floor(8/5)=1, remainder=3, so first 3 parts get 2, last 2 get 1: [2, 2, 2, 1, 1]

#### Scenario: Redistribute on remove
- **WHEN** user removes a part from a 4-part split of a monster with 6 total_hp
- **THEN** remaining 3 parts are redistributed to [2, 2, 2]
