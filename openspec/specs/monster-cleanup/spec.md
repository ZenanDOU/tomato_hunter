### Requirement: Release single monster from hunt list
The system SHALL allow users to release a monster (change its status to `released`) from the hunt list expanded detail panel. Releasing a monster removes it from the active hunt list while preserving the task record in the database.

#### Scenario: Release a ready monster
- **WHEN** user clicks "释放" on a monster with status `ready` in the expanded detail panel
- **THEN** a confirmation prompt appears: "确定要释放 <monster_name> 吗？释放后无法撤销。"

#### Scenario: Confirm release
- **WHEN** user confirms the release prompt
- **THEN** the task status is updated to `released`, the monster disappears from the hunt list, and any associated daily_plan_entries are removed

#### Scenario: Cancel release
- **WHEN** user cancels the release prompt
- **THEN** no changes are made and the detail panel remains open

#### Scenario: Cannot release hunting monster
- **WHEN** a monster has status `hunting` (active pomodoro in progress)
- **THEN** the "释放" button is not displayed

#### Scenario: Release split monster parent
- **WHEN** user releases a parent monster that has child tasks (split monster)
- **THEN** the parent and all its child tasks are set to `released` status in a single operation

#### Scenario: Release individual body part of split monster
- **WHEN** user releases a child task (body part) of a split monster
- **THEN** only that child task is set to `released`, the parent and other children remain unchanged

### Requirement: Batch release mode
The system SHALL provide a batch selection mode for releasing multiple monsters at once from the hunt list.

#### Scenario: Enter batch mode
- **WHEN** user clicks the "清理" button at the top of the hunt list
- **THEN** each monster card displays a checkbox on the left side, and the top bar shows "选择要释放的怪物" with "全选", "确认释放", and "取消" buttons

#### Scenario: Select monsters in batch mode
- **WHEN** user toggles checkboxes on monster cards in batch mode
- **THEN** the selected count updates in the top bar (e.g., "已选择 3 只")

#### Scenario: Confirm batch release
- **WHEN** user clicks "确认释放" with N monsters selected
- **THEN** a confirmation prompt appears: "确定要释放 N 只怪物吗？" and upon confirmation, all selected tasks (and their children if split) are set to `released`

#### Scenario: Exit batch mode without action
- **WHEN** user clicks "取消" in batch mode
- **THEN** batch mode exits, checkboxes disappear, and no changes are made

#### Scenario: Batch mode hides hunting monsters
- **WHEN** batch mode is active
- **THEN** monsters with status `hunting` do not show checkboxes and cannot be selected

### Requirement: Released status is terminal
The system SHALL treat `released` as a terminal task status. Released tasks SHALL NOT appear in the hunt list, daily plan, or inbox.

#### Scenario: Released monster excluded from hunt list
- **WHEN** the hunt list renders
- **THEN** tasks with status `released` are not shown (only `ready` and `hunting` are displayed)

#### Scenario: Released monster excluded from daily plan
- **WHEN** the daily plan board renders
- **THEN** tasks with status `released` are not available for planning

### Requirement: Release task store method
The system SHALL provide `releaseTask(id)` and `batchReleaseTasks(ids)` methods in taskStore that update task status and clean up related data.

#### Scenario: releaseTask updates status and cleans plan
- **WHEN** `releaseTask(id)` is called
- **THEN** the task's status is set to `released`, completed_at is set to current timestamp, and any daily_plan_entries for this task are deleted

#### Scenario: releaseTask cascades to children
- **WHEN** `releaseTask(id)` is called on a parent task with children
- **THEN** all child tasks are also set to `released` with completed_at timestamps

#### Scenario: batchReleaseTasks handles multiple
- **WHEN** `batchReleaseTasks([1, 2, 3])` is called
- **THEN** all three tasks and their children are released in a single database transaction
