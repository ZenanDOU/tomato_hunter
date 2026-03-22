## Context

`tasks.monster_variant` 列存储的是 `serializeMonsterVariant()` 生成的 JSON 字符串（如 `{"variant":"normal","attributes":["fast"]}`），用于描述怪物变体类型和属性。而图鉴系统 `BestiaryCollection` 通过 BESTIARY 物种 ID（如 `"work-gear-bug"`）进行匹配。两个标识符代表不同概念：

- **Species ID**: 物种分类标识，由 `selectSpecies(category, taskName, difficulty)` 确定性计算
- **Monster Variant**: 个体变体描述，包含类型和属性标签

当前 `fetchDiscoveredSpecies()` 按 `monster_variant` 分组返回的是变体字符串而非物种 ID，导致 `BestiaryCollection` 的 Map 查找永远失败。

## Goals / Non-Goals

**Goals:**
- 图鉴页面正确显示已发现的物种
- 里程碑中物种相关的计数正确
- `isSpeciesNew()` 按物种而非变体判断新发现
- 已有数据回填 species_id

**Non-Goals:**
- 不改变 `monster_variant` 列的用途（仍保留用于属性系统）
- 不重构怪物生成流程
- 不变更 BESTIARY 物种定义

## Decisions

### 1. 新增 `species_id` 列 vs 复用 `monster_variant`

**选择**: 新增 `species_id` TEXT 列

**理由**: `monster_variant` 承载属性信息，改变其语义会破坏现有功能。新增列职责清晰，且可独立索引。

**替代方案**: 在前端从 category + name + difficulty 重新计算。缺点：每次查询都需全量加载 tasks 到前端计算，无法在 SQL 层面高效聚合。

### 2. 已有数据回填策略

**选择**: 前端启动时批量回填

**理由**: `selectSpecies()` 是 JS 函数，依赖哈希算法，无法在 SQLite migration 中执行。在 migration 中只创建列和索引，在前端 DB 初始化后立即运行回填逻辑。

**流程**:
1. Migration 添加 `species_id` 列（默认 NULL）
2. 前端 `getDb()` 初始化后，检查是否有 `species_id IS NULL AND status = 'killed'` 的记录
3. 批量加载这些记录的 `id, category, name, difficulty`
4. 用 `selectSpecies()` 计算每条的 species_id 并 UPDATE

### 3. identifyTask 流程变更

**选择**: 在 `identifyTask` 参数中新增 `speciesId`，与 `monsterVariant` 一同传入

**理由**: species_id 在发现时已由 `selectSpecies()` 计算完毕，无需重复计算。在 `handleIdentify` 中传入 `species.id` 即可。

### 4. 查询修改范围

需修改的 SQL 查询：
- `fetchDiscoveredSpecies`: `GROUP BY species_id`（替代 `GROUP BY monster_variant`）
- `fetchStats.speciesCount`: `COUNT(DISTINCT species_id)`（替代 `COUNT(DISTINCT monster_variant)`）
- `isSpeciesNew`: `WHERE species_id = $1`（替代 `WHERE monster_variant = $1`）
- `isSpeciesNew` 的调用处传入 `species_id` 而非 `monster_variant`

## Risks / Trade-offs

- **回填准确性**: `selectSpecies()` 使用确定性哈希，只要算法未变，回填结果与首次鉴定一致 → 低风险
- **空 species_id**: 回填前已存在的查询可能返回 NULL → 在查询中加 `species_id IS NOT NULL` 过滤
- **回填性能**: 通常 tasks 数量有限（百级），批量 UPDATE 耗时可忽略
- **首次启动延迟**: 回填只在有需要时执行一次，后续跳过 → 可接受
