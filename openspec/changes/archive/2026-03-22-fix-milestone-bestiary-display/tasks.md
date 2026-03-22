## 1. 数据库迁移

- [x] 1.1 创建 migration `011_add_species_id.sql`：ALTER TABLE tasks ADD COLUMN species_id TEXT DEFAULT NULL；为 species_id 添加索引
- [x] 1.2 在 `src-tauri/src/db.rs` 注册 migration version 11

## 2. 已有数据回填

- [x] 2.1 在 `src/lib/db.ts` 的 `getDb()` 中添加回填逻辑：查询 `species_id IS NULL AND status IN ('killed','ready','hunting')` 的任务，用 `selectSpecies()` 计算并批量 UPDATE species_id
- [x] 2.2 确保回填只在有需要时执行（检查是否存在 NULL species_id 的记录），且只执行一次

## 3. Task 鉴定流程修改

- [x] 3.1 修改 `taskStore.identifyTask` 接口：新增 `speciesId` 参数，UPDATE 时同时写入 `species_id`
- [x] 3.2 修改 `HuntBoard.tsx` 的 `handleIdentify`/`handleConfirmDiscovery`：传递 `species.id` 给 identifyTask
- [x] 3.3 修改 `Inbox.tsx` 的 `handleIdentify`/`handleConfirmDiscovery`：传递 `species.id` 给 identifyTask
- [x] 3.4 修改 `taskStore.splitTask`：子任务继承父任务的 species_id

## 4. Profile Store 查询修改

- [x] 4.1 修改 `profileStore.fetchDiscoveredSpecies()`：GROUP BY species_id 替代 GROUP BY monster_variant，过滤 species_id IS NOT NULL
- [x] 4.2 修改 `profileStore.fetchStats()`：speciesDiscovered 使用 COUNT(DISTINCT species_id) 替代 COUNT(DISTINCT monster_variant)
- [x] 4.3 修改 `profileStore.isSpeciesNew()`：WHERE species_id = $1 替代 WHERE monster_variant = $1

## 5. Settlement 流程修改

- [x] 5.1 修改 `Settlement.tsx` 中 `isSpeciesNew()` 的调用：传入 task 的 species_id（而非 monster_variant）
- [x] 5.2 确保 Settlement 组件能获取到当前 task 的 species_id（可能需要从 taskStore 获取最新数据）

## 6. 验证

- [x] 6.1 确认前端编译通过，无 TypeScript 错误
- [x] 6.2 确认 Rust 编译通过（新 migration 注册正确）
- [ ] 6.3 手动验证：打开猎人档案页，确认已发现物种正确显示
- [ ] 6.4 手动验证：击杀新怪物后，物种发现通知正常出现，图鉴更新
