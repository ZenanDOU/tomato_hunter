## Why

项目处于开发阶段，没有真实用户和需要保护的生产数据。13 个增量迁移文件中充满了 ALTER TABLE、DROP/重建表、追溯数据修复等历史包袱，增加了理解和维护成本。合并为单一初始 schema 可以让数据层更清晰，也消除了迁移间的隐式依赖。

## What Changes

- **BREAKING**: 删除 `src-tauri/migrations/002_initial.sql` 到 `013_add_removed_completed.sql`（12 个文件）
- 将所有迁移合并为单一 `001_initial.sql`，包含最终态 schema（13 张表）、索引、种子数据
- 简化 `src-tauri/src/db.rs`，只注册 1 个 migration
- 删除本地 SQLite 数据库文件（`%APPDATA%/com.tomato-hunter.app/tomato_hunter.db*`），让应用从零重建

## Capabilities

### New Capabilities

无。这是纯重构，不引入新功能。

### Modified Capabilities

- `infrastructure`: 数据库初始化方式从增量迁移变为单一 schema，迁移策略从「追加迁移」变为「开发阶段直接修改初始 schema」

## Impact

- **代码**: `src-tauri/src/db.rs`（简化为 1 个 migration 注册）、`src-tauri/migrations/`（12 个文件删除，1 个文件重写）
- **本地数据**: 删除本地数据库，所有开发数据清零
- **开发流程**: 后续 schema 变更直接修改 `001_initial.sql` + 删库重建，无需新增迁移文件
