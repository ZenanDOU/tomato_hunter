## Why

猎人档案页中，已解锁的里程碑和图鉴物种均无法正确显示。根本原因是 `tasks.monster_variant` 列存储的是序列化后的 JSON 变体数据（如 `{"variant":"normal","attributes":["fast"]}`），而图鉴组件和物种查询使用的是 BESTIARY 物种 ID（如 `"work-gear-bug"`）进行匹配，两者永远无法对应。这导致图鉴发现计数、物种类里程碑检测也一并失效。

## What Changes

- 为 `tasks` 表新增 `species_id` 列，存储 BESTIARY 物种 ID（如 `"work-gear-bug"`）
- 修改 `identifyTask` 流程，在怪物鉴定时同时保存 `species_id`
- 修改 `fetchDiscoveredSpecies()` 查询，按 `species_id` 分组而非 `monster_variant`
- 修改 `fetchStats()` 中物种计数，按 `species_id` 去重
- 修改 `isSpeciesNew()` 检测，按 `species_id` 查询
- 为已有数据提供回填方案：应用启动时根据已有任务的 category + difficulty + name 重新计算 species_id

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `monster-bestiary`: 物种发现的存储和查询方式变更，从 `monster_variant` 改为专用 `species_id` 字段
- `hunter-profile`: 图鉴显示和物种统计的数据源从 `monster_variant` 改为 `species_id`
- `milestone-system`: 物种类里程碑的计数基准从 `COUNT(DISTINCT monster_variant)` 改为 `COUNT(DISTINCT species_id)`

## Impact

- **数据库**: 新增 migration 为 tasks 表添加 `species_id` 列 + 回填逻辑
- **后端 Rust**: `db.rs` 注册新 migration
- **前端 stores**: `taskStore.identifyTask`、`profileStore` 的多个查询方法
- **前端组件**: `HuntBoard`、`Inbox` 的 discovery 流程需传递 species_id
- **已有数据**: 需要回填 species_id（通过前端启动时批量计算或 migration 中处理）
