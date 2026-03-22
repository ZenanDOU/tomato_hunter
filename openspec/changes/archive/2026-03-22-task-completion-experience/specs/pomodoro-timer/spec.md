## MODIFIED Requirements

### Requirement: Review phase requires completion note
The system SHALL require users to fill in a completion note ("你完成了什么？") before finishing a pomodoro. Reflection is optional with three guided prompts. When damageTask() causes HP to reach 0, the system SHALL NOT automatically set the task to "killed" — instead it SHALL pass an HP-zero signal to the Settlement screen for user confirmation.

#### Scenario: Submit review with completion note
- **WHEN** user fills in the completion note and clicks submit
- **THEN** the system records the note, marks the pomodoro as completed, damages the monster's HP by 1, and triggers loot generation

#### Scenario: Cannot submit without completion note
- **WHEN** the completion note field is empty
- **THEN** the submit button is disabled

#### Scenario: HP reaches zero after damage
- **WHEN** the review is submitted and damageTask() reduces current_hp to 0
- **THEN** the system SHALL pass `hpReachedZero: true` to the Settlement phase, but SHALL NOT set the task status to "killed" — the task remains in "hunting" status with current_hp = 0

#### Scenario: HP still remaining after damage
- **WHEN** the review is submitted and current_hp remains > 0 after damageTask()
- **THEN** the Settlement screen proceeds with normal "怪物受伤" flow (no kill confirmation)
