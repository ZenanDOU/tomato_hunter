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
The system SHALL use the Tomato Train brand color palette for the village and all UI surfaces. Village background uses sky blue #55BBEE with cloud white #FFFFFF cards. Monster cards use a darker contrast (dark purple #443355) against the bright village. All borders use pixel black #333333 at 2px.

#### Scenario: Village visual style
- **WHEN** user is in the village
- **THEN** background is sky blue #55BBEE, cards use cloud white or cream #FFF8E8, tab buttons have 2px pixel-black borders, title uses Zpix pixel font

#### Scenario: Monster card contrast
- **WHEN** a monster card is displayed
- **THEN** the card uses dark purple background with 2px pixel-black border, contrasting with the bright sky blue village

#### Scenario: Body text readability
- **WHEN** descriptions or long text is displayed
- **THEN** text color is pixel black #333333 on light backgrounds, white #FFFFFF on dark backgrounds, with minimum 4.5:1 contrast ratio

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
