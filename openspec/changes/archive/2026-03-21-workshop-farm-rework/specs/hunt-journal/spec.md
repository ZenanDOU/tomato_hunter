## MODIFIED Requirements

### Requirement: Defeated monsters enter Tomato Farm
The system SHALL record every defeated monster and add its rescued tomato to the Tomato Farm (番茄农场), replacing the former Tomato Sanctuary.

#### Scenario: Defeated monster enters farm
- **WHEN** a monster's HP reaches 0
- **THEN** the rescued tomato is added to the farm's population count, and the task appears in the farm's battle history with: 🍅 emoji, monster name, task name, attribute tags, and completion timestamp

#### Scenario: View farm battle history
- **WHEN** user navigates to the 🍅 农场 tab and scrolls to battle history
- **THEN** the system displays all defeated monsters sorted by completion date descending, each showing monster name, task name, actual vs estimated pomodoros, and date

### Requirement: Tomato wall collection display
The system SHALL display rescued tomatoes as a visual emoji grid (tomato wall) within the Tomato Farm view.

#### Scenario: View tomato wall in farm
- **WHEN** user opens the Tomato Farm
- **THEN** the top section shows a grid of 🍅 emojis (count = total rescued tomatoes, capped at 50 visible with "+N" overflow) and text "农场番茄: N 颗"

## REMOVED Requirements

### Requirement: Defeated monsters enter Tomato Sanctuary
**Reason**: Tomato Sanctuary is replaced by Tomato Farm. The farm serves both as tomato display and passive economy engine.
**Migration**: All existing sanctuary data (rescued tomatoes, battle history) is preserved and displayed in the new farm view. UI component changes from TomatoSanctuary.tsx to TomatoFarm.tsx.

### Requirement: Sanctuary entry detail with battle records
**Reason**: Replaced by farm battle history detail with identical data but within the farm context.
**Migration**: Battle record detail view remains functionally the same, re-parented under the farm UI.
