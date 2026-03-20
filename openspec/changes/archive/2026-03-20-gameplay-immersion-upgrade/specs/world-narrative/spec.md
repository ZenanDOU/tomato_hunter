## ADDED Requirements

### Requirement: Centralized narrative text module
The system SHALL maintain a centralized narrative module (`src/lib/narrative.ts`) managing all game UI text related to the world setting: summoned hero vs procrastination monsters.

#### Scenario: Terminology updates
- **WHEN** any UI component displays game-related text
- **THEN** it uses the narrative module for key labels: 鉴定→侦查敌情, 未确认情报→未侦查的敌情, 猎物清单→讨伐清单, 图鉴→番茄收容所. Battle language (击杀, HP, 出击, 撤退) is preserved and strengthened.

### Requirement: World lore accessible to user
The system SHALL provide a summoning story accessible from the village header, explaining the procrastination monster invasion narrative.

#### Scenario: First-time lore display
- **WHEN** user opens the app for the first time
- **THEN** a modal overlay displays the summoning story: "番茄农场告急！拖延怪物大军从虚空降临，占领了这片富饶的番茄农场。番茄们被囚禁...你，被农场最后的力量召唤而来。拿起武器，击败怪物，拯救番茄！"

#### Scenario: Re-read lore
- **WHEN** user clicks the 📜 button in the village header
- **THEN** the same summoning story overlay is displayed

### Requirement: Pixel art visual style with bright MH Rise-inspired palette
The system SHALL use a pixel art visual style inspired by Monster Hunter Rise's bright, warm aesthetic for the village, with dark contrast for monster areas.

#### Scenario: Village visual style
- **WHEN** user is in the village
- **THEN** background uses warm cream/wood tones (`--village-bg: #f5f0e1`), with pixel-style borders (CSS box-shadow). Title and key numbers use Zpix pixel font. Tab buttons have pixel borders.

#### Scenario: Monster card contrast
- **WHEN** a monster card is displayed in the hunt list
- **THEN** the card uses dark tones (`--monster-bg: #2d2438`, `--monster-border: #4a3860`) contrasting with the bright village

#### Scenario: Body text readability
- **WHEN** descriptions, notes, or long-form text is displayed
- **THEN** the system uses standard system font. Only titles, labels, counters, and timers use pixel font (`.pixel-title` class).

### Requirement: Procrastination captivity visualization
The system SHALL visually indicate how long a task has been waiting by reducing color saturation, representing the tomato "withering in captivity."

#### Scenario: Task waiting 1-3 days
- **WHEN** a task was created 1-3 days ago and is still active
- **THEN** the card has slight desaturation (`captive-fade-1`, saturate 0.8)

#### Scenario: Task waiting 3-7 days
- **WHEN** a task was created 3-7 days ago
- **THEN** the card has moderate desaturation (`captive-fade-2`, saturate 0.5) with gray border

#### Scenario: Task waiting over 7 days
- **WHEN** a task was created more than 7 days ago
- **THEN** the card has heavy desaturation (`captive-fade-3`, saturate 0.3) with reduced opacity
