## MODIFIED Requirements

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
