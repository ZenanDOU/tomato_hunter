## ADDED Requirements

### Requirement: Step-by-step onboarding flow
The system SHALL provide an interactive onboarding flow for first-time users, guiding them through the core workflow: creating a task (侦查), viewing the hunt list (讨伐), planning daily pomodoros (今日计划), and starting a hunt. The onboarding SHALL use a spotlight overlay with pixel-styled tooltips to highlight UI elements in sequence.

#### Scenario: First launch triggers onboarding
- **WHEN** a new user opens the app for the first time (onboarding_completed setting is absent or false)
- **THEN** the onboarding flow starts automatically after the lore story modal is dismissed

#### Scenario: Onboarding step highlights target element
- **WHEN** an onboarding step is active
- **THEN** a semi-transparent dark overlay covers the entire screen except for the highlighted element, and a pixel-styled tooltip appears near the highlighted element with step description and a "下一步" button

#### Scenario: Onboarding step advances on button click
- **WHEN** user clicks "下一步" on a tooltip
- **THEN** the spotlight moves to the next target element, switching tabs if necessary

#### Scenario: Onboarding completes
- **WHEN** user reaches the final step and clicks "开始狩猎!"
- **THEN** the onboarding_completed setting is saved as true to the database, and the overlay disappears

### Requirement: Onboarding progress persistence
The system SHALL persist the current onboarding step to the settings table so that interrupted onboarding can resume from where it stopped.

#### Scenario: App closes during onboarding
- **WHEN** the app is closed while onboarding is in progress at step 3
- **THEN** the settings table stores onboarding_step=3

#### Scenario: App reopens with incomplete onboarding
- **WHEN** the app opens and onboarding_completed is false and onboarding_step is 3
- **THEN** the onboarding resumes from step 3

### Requirement: Onboarding skip option
The system SHALL provide a "跳过引导" button visible during all onboarding steps, allowing users to exit the flow immediately.

#### Scenario: User skips onboarding
- **WHEN** user clicks "跳过引导" during any onboarding step
- **THEN** the overlay disappears, onboarding_completed is set to true, and normal app usage begins

### Requirement: Onboarding steps definition
The system SHALL implement the following onboarding steps in order:

1. Welcome — tooltip over the app title area: "欢迎来到番茄猎人！这里的每个任务都是一只拖延怪物，用番茄钟来击败它们！"
2. Inbox tab — highlight 侦查 tab: "在这里创建任务，系统会自动为你生成一只拖延怪物"
3. Hunt list tab — highlight 讨伐 tab: "查看你发现的所有怪物，了解它们的弱点"
4. Daily plan tab — highlight 今日 tab: "每天规划你的番茄预算，选择要挑战的怪物"
5. Workshop tab — highlight 工坊 tab: "用狩猎中获得的素材制作装备，提升战斗能力"
6. Farm tab — highlight 农场 tab: "被你拯救的番茄会在这里安家，见证你的成长"
7. Complete — center tooltip: "准备好了！去侦查页面创建你的第一个任务吧！"

#### Scenario: Step 1 renders welcome message
- **WHEN** onboarding starts at step 1
- **THEN** a centered tooltip displays the welcome message with the app logo/title highlighted

#### Scenario: Step 2 highlights inbox tab
- **WHEN** onboarding reaches step 2
- **THEN** the spotlight highlights the 侦查 tab button in the navigation bar

#### Scenario: Step 7 shows completion message
- **WHEN** onboarding reaches step 7
- **THEN** a centered tooltip displays the completion message with a "开始狩猎!" button that completes the onboarding
