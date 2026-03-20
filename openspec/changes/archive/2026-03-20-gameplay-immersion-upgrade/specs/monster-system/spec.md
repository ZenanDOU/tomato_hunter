## MODIFIED Requirements

### Requirement: AI monster generation with procrastination monster narrative
The system SHALL generate procrastination-themed monster names and battle descriptions for each task. Monsters are independent enemies that occupy the tomato farm, not corrupted tomatoes.

#### Scenario: Online monster generation
- **WHEN** user identifies a task (侦查敌情) and a Claude API key is configured
- **THEN** the system calls Claude API with a procrastination monster prompt: "番茄农场被拖延怪物入侵。为这个任务生成一只拖延怪物，它占领了农场的一片区域，囚禁了一些番茄。" Returns name + battle description.

#### Scenario: Offline fallback generation
- **WHEN** the API key is not configured or the API call fails
- **THEN** the system generates using expanded pools: 32+ procrastination-themed adjectives (贪睡的、刷手机的、发呆的...) and 11+ nouns per category, with 7 narrative description templates ("这只[adj]拖延怪物占据了农场的一角，囚禁了[n]颗番茄")

#### Scenario: Rare variant generation
- **WHEN** generating a monster offline
- **THEN** there is a 10% chance the monster is a rare "金色" variant with better drops

### Requirement: Multi-pomodoro HP tracking (bug fix)
The system SHALL correctly track HP across multiple pomodoro sessions with proper status transitions.

#### Scenario: First damage transitions to hunting
- **WHEN** a user completes the first pomodoro for a "ready" monster and HP > 0
- **THEN** the task status changes from "ready" to "hunting"

#### Scenario: HP persists across app restart
- **WHEN** a user completes 1 pomodoro for a 3-HP monster, closes the app, and reopens
- **THEN** the HP correctly shows 2/3

#### Scenario: Final hit defeats the monster
- **WHEN** a completed pomodoro reduces HP to 0
- **THEN** the task status changes to "killed", completed_at is set

## ADDED Requirements

### Requirement: Settlement rewards — fixed rescued tomato + random drops
The system SHALL award exactly 1 rescued tomato (获救番茄 🍅, material_id=11) as a guaranteed fixed reward for each completed pomodoro, plus random material drops from the existing loot system.

#### Scenario: Every completed pomodoro rescues one tomato
- **WHEN** a pomodoro completes successfully
- **THEN** the loot includes 1x 获救番茄 plus category-specific random drops

#### Scenario: Full defeat settlement
- **WHEN** the final pomodoro reduces HP to 0
- **THEN** the settlement screen shows: "⚔️ 怪物被击败了！" + "🍅 拯救了一颗番茄！" + war trophies list

#### Scenario: Partial defeat settlement
- **WHEN** a pomodoro completes but HP is still > 0
- **THEN** the settlement screen shows: "怪物受到重创，但还没倒下！" + "继续战斗！" + war trophies list

### Requirement: Retreat message
- **WHEN** user retreats from a hunt
- **THEN** the button text shows "撤退" (not "放弃")
