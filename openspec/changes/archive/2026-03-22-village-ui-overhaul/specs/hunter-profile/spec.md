## ADDED Requirements

### Requirement: Battle history section in hunter profile
The system SHALL display a「战斗日志」collapsible section in the hunter profile tab, positioned after the monster bestiary collection. The battle history SHALL show all killed tasks sorted by completion date descending, with expandable details for each entry.

#### Scenario: View battle history
- **WHEN** user opens the hunter profile and scrolls to the 战斗日志 section
- **THEN** the system displays a list of killed tasks showing monster name, task name, and completion date, sorted by most recent first

#### Scenario: Expand battle history entry
- **WHEN** user clicks on a battle history entry
- **THEN** the system shows: monster description, estimated vs actual pomodoros, and individual pomodoro records with completion notes, strategy notes (🎯), reflection text (💡), and timestamps

#### Scenario: Empty battle history
- **WHEN** user has no killed tasks
- **THEN** the 战斗日志 section shows "还没有战斗记录，去狩猎吧！"

## MODIFIED Requirements

### Requirement: Hunter Profile tab in village
The system SHALL display the "猎人档案" tab in the village layout as the fifth tab (previously sixth). The tab displays four sections: statistics overview, milestone list, monster bestiary collection, and battle history.

#### Scenario: Profile tab accessible from village
- **WHEN** user is in the village view
- **THEN** a "猎人档案" tab is available as the fifth tab alongside existing tabs (计划, 狩猎, 工坊, 农场)

#### Scenario: Profile tab icon
- **WHEN** the profile tab renders
- **THEN** it displays a scroll/badge icon consistent with the pixel art design system
