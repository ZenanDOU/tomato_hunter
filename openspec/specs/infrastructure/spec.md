## ADDED Requirements

### Requirement: Application error boundary
The application SHALL display a friendly error screen instead of a blank page when a rendering error occurs. The error screen SHALL show an error description and a "Reload" button. ErrorBoundary components SHALL wrap the main village layout and the hunt window layout independently. Critical async operations in UI components SHALL be wrapped in try-catch blocks.

#### Scenario: Component rendering error caught
- **WHEN** a React component throws an error during rendering
- **THEN** the ErrorBoundary catches the error and displays a pixel-styled error screen with a reload button instead of a white screen

#### Scenario: Hunt window error does not crash village
- **WHEN** the hunt window encounters a rendering error
- **THEN** only the hunt window shows the error screen; the main village window remains functional

#### Scenario: PrepPhase database write failure
- **WHEN** the strategy note database write fails in PrepPhase
- **THEN** the system SHALL log the error and still allow advancing to focus phase (strategy note is non-critical)

#### Scenario: RecoveryDialog retreat failure
- **WHEN** the retreat database update fails in RecoveryDialog
- **THEN** the system SHALL log the error and still dismiss the dialog (user can retry on next app launch)

#### Scenario: Hunt start failure from DailyPlanBoard
- **WHEN** creating a pomodoro or opening the hunt window fails during hunt start
- **THEN** the system SHALL log the error and leave the UI in its current state without navigating away

### Requirement: Keyboard shortcuts
The application SHALL support keyboard shortcuts for core actions: Escape to close modals/panels, Space to pause/resume the timer during focus phase, and Enter to confirm/submit in prep and review phases.

#### Scenario: Escape closes modal
- **WHEN** user presses Escape while a modal (lore, settings) is open in the village
- **THEN** the modal closes

#### Scenario: Space pauses timer
- **WHEN** user presses Space during focus phase
- **THEN** the timer pauses; pressing Space again resumes

#### Scenario: Enter confirms review
- **WHEN** user presses Enter in review phase (not inside a textarea)
- **THEN** the review form submits

### Requirement: ARIA accessibility labels
All icon-only buttons SHALL have an `aria-label` attribute describing their function. Dialog/modal containers SHALL have `role="dialog"` and `aria-modal="true"`. Form inputs SHALL have associated `aria-label` attributes.

#### Scenario: Icon button has label
- **WHEN** a screen reader encounters an icon-only button (e.g., the lore 📜 button)
- **THEN** it reads the button's `aria-label` (e.g., "View world lore")

#### Scenario: Dialog announced correctly
- **WHEN** a modal opens
- **THEN** the container has `role="dialog"` and `aria-modal="true"`

### Requirement: Database migration completeness
数据库 schema 由单一迁移文件 `src-tauri/migrations/001_initial.sql` 定义，包含所有表的最终态 CREATE TABLE 语句、索引和种子数据。`db.rs` 的 `migrations()` 函数 SHALL 只注册这一个迁移。开发阶段的 schema 变更 SHALL 直接修改 `001_initial.sql` 并删除本地数据库重建，无需新增迁移文件。

#### Scenario: Fresh database initialization
- **WHEN** 应用首次启动且本地无数据库文件
- **THEN** `001_initial.sql` SHALL 创建全部 13 张表（tasks, pomodoros, materials, player_materials, loot_drops, equipment, player_equipment, loadout, daily_plans, planned_task_entries, settings, tomato_farm, milestones）并插入所有种子数据

#### Scenario: Schema matches final state
- **WHEN** `001_initial.sql` 执行完成
- **THEN** tasks 表的 status CHECK 约束 SHALL 包含 'released'，tasks 表 SHALL 包含 body_part 和 species_id 列，pomodoros 表 SHALL 包含 strategy_note 列，tomato_farm 表 SHALL 包含 is_watered 和 watering_cooldown_end 列，daily_plans 表 SHALL 包含 removed_completed 列

#### Scenario: Development schema change
- **WHEN** 开发者需要修改数据库 schema
- **THEN** 开发者 SHALL 直接编辑 `001_initial.sql`，删除本地 `%APPDATA%/com.tomato-hunter.app/tomato_hunter.db*` 文件，重启应用重建数据库

### Requirement: Transaction-protected multi-step database operations
Database operations that modify multiple related records SHALL be wrapped in a transaction to prevent partial updates.

#### Scenario: damageTask atomicity
- **WHEN** a monster takes damage (HP decrement + status check + potential kill cascade)
- **THEN** all database writes SHALL execute within a single transaction; if any step fails, all changes SHALL be rolled back

#### Scenario: damageTask kills monster with children
- **WHEN** damageTask reduces HP to 0 on a parent task with child tasks
- **THEN** the parent status update and all child status updates SHALL occur atomically within one transaction

### Requirement: Tauri event listener lifecycle
The `useTauriEvent` hook SHALL use a ref-based handler pattern to prevent listener duplication caused by handler function reference changes across renders.

#### Scenario: Handler function changes between renders
- **WHEN** the component re-renders and the handler function reference changes
- **THEN** the event listener SHALL NOT be re-registered; instead, the existing listener SHALL invoke the latest handler via ref

#### Scenario: Component unmount cleanup
- **WHEN** a component using useTauriEvent unmounts
- **THEN** the event listener SHALL be properly removed to prevent memory leaks
