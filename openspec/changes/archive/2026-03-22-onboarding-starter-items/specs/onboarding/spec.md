## MODIFIED Requirements

### Requirement: Onboarding completes
The system SHALL provide an interactive onboarding flow for first-time users, guiding them through the core workflow: creating a task (侦查), viewing the hunt list (讨伐), planning daily pomodoros (今日计划), and starting a hunt. The onboarding SHALL use a quest-based inline card system. Upon completion (first monster killed), the system SHALL trigger starter item rewards before marking onboarding as complete.

#### Scenario: First launch triggers onboarding
- **WHEN** a new user opens the app for the first time (onboarding_completed setting is absent or false)
- **THEN** the onboarding flow starts automatically with quest step 0

#### Scenario: Onboarding completes on first kill
- **WHEN** a user kills their first monster and onboarding is not yet completed
- **THEN** the system grants starter items (5x 时间压缩), sets onboarding_completed to true, and grants first kill reward (2x 烟雾弹)
