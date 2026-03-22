# DATA_MAP — 核心数据流全景

> 扫描日期: 2026-03-22
> 覆盖范围: 数据库 migrations、Rust 后端、前端 stores、前端组件

---

## 一、番茄量 (Tomato)

### 1.1 定义位置

| 层级 | 文件 | 行号 | 定义内容 |
|------|------|------|---------|
| DB 表 | `src-tauri/migrations/005_workshop_farm_rework.sql` | 4-9 | `tomato_farm.tomato_count INTEGER NOT NULL DEFAULT 0` |
| DB 表 | `src-tauri/migrations/002_rescued_tomato.sql` | 1-4 | materials 表 materialId=11 '获救番茄' |
| Store | `src/stores/farmStore.ts` | 4-28 | `FarmState.tomatoCount: number` |
| Timer | `src-tauri/src/timer.rs` | 156,174 | `dagger_action_count: u32` (匕首模式用) |
| Type | `src/types/index.ts` | 93 | `TimerState.dagger_action_count: number` |

### 1.2 读取位置

| 文件 | 函数/位置 | 行号 | 用途 |
|------|----------|------|------|
| `src/stores/farmStore.ts` | `fetchFarm()` | 54-76 | 从DB加载 `SELECT * FROM tomato_farm WHERE id=1` |
| `src/stores/farmStore.ts` | `calcBaseRate()` | 32-34 | 计算产率: `floor(tomatoCount/10)+1` |
| `src/stores/farmStore.ts` | `calcProductionRate()` | 36-44 | 产率 × 浇水(+0.5)× 肥料(+1.0) |
| `src/components/journal/TomatoFarm.tsx` | 组件渲染 | 95,84,192-201 | 显示农场番茄数、行数、空/满提示 |
| `src/components/village/DailyPlanBoard.tsx` | `getTomatoGroups()` | 16-20 | 计算每日番茄组（每组≤4） |
| `src/components/hunt/DaggerChoicePhase.tsx` | 组件渲染 | 14,37,68 | 显示 `ceil(actionCount/2)` 🍅 |
| `src/HuntApp.tsx` | 组件渲染 | 143 | 实时显示 `{dagger_action_count} 次 · {ceil/2} 🍅` |

### 1.3 写入/修改位置

| 文件 | 函数 | 行号 | 操作 |
|------|------|------|------|
| `src/stores/farmStore.ts` | `addTomato(count)` | 78-95 | `UPDATE tomato_farm SET tomato_count += $1` |
| `src/stores/farmStore.ts` | `spendEssence(amount)` | 97-112 | `UPDATE SET essence_balance -= $1` |
| `src/stores/farmStore.ts` | `addEssence(amount)` | 114-126 | `UPDATE SET essence_balance += $1` |
| `src/stores/farmStore.ts` | `activateFertilizer()` | 128-145 | `UPDATE SET fertilizer_remaining_minutes += $1` |
| `src/stores/farmStore.ts` | `tickProduction()` | 147-181 | 每分钟产出番茄素，更新 essence_balance |
| `src/stores/farmStore.ts` | `water()` | 185-193 | 设置 isWatered=true（仅内存） |
| `src/hooks/useReviewFlow.ts` | `handleReviewComplete` | 105-135 | 计算番茄数(sword:1, hammer:2, dagger:ceil/2) → 调用 addTomato() |
| `src/lib/loot.ts` | `generateLoot()` | 20-32 | 番茄作为 materialId=11 掉落 |
| `src-tauri/src/timer.rs` | `dagger_choose()` | 304-314 | `dagger_action_count += 1` |
| `src/stores/timerStore.ts` | (前端调用) | 118-125 | 调用后端 dagger_choose 命令 |

### 1.4 多数据源分析

| 数据项 | 数据库 | 前端Store | 后端Timer | 备注 |
|--------|--------|---------|---------|------|
| tomato_count | ✅ tomato_farm | FarmStore.tomatoCount | — | **单一源**，DB为准 |
| essence_balance | ✅ tomato_farm | FarmStore.essenceBalance | — | **单一源**，DB为准 |
| fertilizer_remaining_minutes | ✅ tomato_farm | FarmStore | — | **单一源**，DB为准 |
| isWatered | ❌ 无持久化 | FarmStore.isWatered | — | ⚠️ 仅内存，重启重置 |
| productionRate | ❌ 计算值 | FarmStore.productionRate | — | 实时计算 |
| dagger_action_count | ❌ 无 | timerStore | ✅ TimerEngine | **双源**: Rust→序列化→前端 |

**结论**: 番茄量核心数据单一源(DB)，无冲突。dagger_action_count 由 Rust Timer 计算后序列化给前端，方向单一。

---

## 二、击杀数 (Kill Count)

### 2.1 定义位置

| 层级 | 文件 | 行号 | 定义内容 |
|------|------|------|---------|
| DB 表 | `src-tauri/migrations/001_initial.sql` | 13 | `tasks.status CHECK('unidentified','ready','hunting','killed','abandoned')` |
| Type | `src/types/index.ts` | 10-16 | `TaskStatus = "killed" \| ...` |
| Type | `src/types/index.ts` | 206 | `HunterStats.totalKills: number` |
| Type | `src/types/index.ts` | 221 | `SpeciesDiscovery.killCount: number` |
| Store | `src/stores/profileStore.ts` | 25 | `totalKills: 0` (初始值) |

### 2.2 读取位置

| 文件 | 函数/位置 | 行号 | 用途 |
|------|----------|------|------|
| `src/stores/profileStore.ts` | `fetchStats()` | 41-42 | `COUNT(*) FROM tasks WHERE status='killed' AND parent_task_id IS NULL` |
| `src/stores/profileStore.ts` | `fetchDiscoveredSpecies()` | 122-130 | 按物种分组统计击杀数 |
| `src/components/profile/StatsOverview.tsx` | 组件渲染 | 10 | 显示 `stats.totalKills` |
| `src/components/profile/SpeciesDetail.tsx` | 组件渲染 | 25-31,57 | 显示物种击杀历史和次数 |
| `src/lib/milestones.ts` | MILESTONES 检查 | 21-22,61-62,141-142 | `first-kill(≥1)`, `kill-10(≥10)`, `kill-50(≥50)` |
| `src/stores/planStore.ts` | `getKilledEntries()` | 176-180 | 过滤当日已击杀任务 |
| `src/components/village/DailyPlanBoard.tsx` | 组件渲染 | 98 | 显示已击杀任务计数 |
| `src/components/village/HuntBoard.tsx` | 状态检查 | 834 | `isKilled = status==='killed'` 防止重复狩猎 |
| `src/components/village/HuntList.tsx` | 状态检查 | 350 | 同上 |

### 2.3 写入/修改位置

| 文件 | 函数 | 行号 | 操作 |
|------|------|------|------|
| `src/stores/taskStore.ts` | `updateTaskStatus()` | 79-92 | `UPDATE tasks SET status=$1, completed_at=$2` |
| `src/stores/taskStore.ts` | `killTask()` | 202-232 | `UPDATE tasks SET status='killed'` + 自动检查父任务(所有子killed→父killed) |
| `src/stores/taskStore.ts` | `damageTask()` | 297-324 | `current_hp -= 1`，HP=0时返回 `reachedZero: true` |
| `src/hooks/useReviewFlow.ts` | `handleReviewComplete` | 75-94 | 调用 damageTask → 设置 hpReachedZero |
| `src/components/settlement/Settlement.tsx` | `handleConfirmKill` | 72-107 | 调用 killTask → 刷新日计划 → 检测里程碑 → 检测新物种 |
| `src/stores/profileStore.ts` | `detectNewMilestones()` | 195-273 | 检测击杀里程碑解锁并写入 milestones 表 |
| `src-tauri/migrations/009_milestones.sql` | 初始化迁移 | 21-26 | 追溯历史击杀里程碑 |

### 2.4 多数据源分析

**结论: 无多源问题，数据流完全单一。**

- 所有击杀数来自 `tasks.status = 'killed'` 的 COUNT 查询
- 防重复计数: 所有统计查询加 `parent_task_id IS NULL` 条件
- `milestones` 表只是附加记录，不存储击杀计数
- 状态转换原子性: `killTask()` 内部同时更新主任务+检查父任务

**击杀流程**:
```
damageTask() → HP=0 → hpReachedZero=true
  → Settlement 显示击杀确认
  → handleConfirmKill() → killTask()
  → UPDATE status='killed' + completed_at
  → 自动检查子任务全killed→父任务也killed
  → detectNewMilestones()
  → isSpeciesNew()
```

---

## 三、图鉴 (Bestiary)

### 3.1 定义位置

| 层级 | 文件 | 行号 | 定义内容 |
|------|------|------|---------|
| DB 列 | `src-tauri/migrations/011_add_species_id.sql` | 2 | `ALTER TABLE tasks ADD COLUMN species_id TEXT DEFAULT NULL` |
| DB 索引 | `src-tauri/migrations/011_add_species_id.sql` | 5 | `idx_tasks_species_id` |
| DB 里程碑 | `src-tauri/migrations/009_milestones.sql` | 27-43 | 物种发现里程碑(`species-5/10/15`) |
| 常量 | `src/lib/bestiary.ts` | 25-390 | `BESTIARY` 数组: 15个物种, 5个家族 |
| Type | `src/lib/bestiary.ts` | 3-17 | `MonsterSpecies` 接口 |
| Type | `src/types/index.ts` | 29 | `Task.species_id: string \| null` |
| Type | `src/types/index.ts` | 218-222 | `SpeciesDiscovery { speciesId, firstKillDate, killCount }` |

**物种家族结构**:
| 家族 | category | 物种 (prey → predator → apex) |
|------|----------|-------------------------------|
| 齿轮工坊废墟 | work | 齿轮虫 → 铁甲蜈蚣 → 锻炉蟒 |
| 枯竭画廊 | creative | 墨点虫 → 灵感蛾 → 画境凤 |
| 遗忘图书馆 | study | 书虱 → 论文狼 → 封典巨鸮 |
| 荒废花园 | life | 杂草鼠 → 藤蔓蛙 → 古树熊 |
| 迷雾沼泽 | other | 迷雾虫 → 虚空鸦 → 深渊水母 |

### 3.2 读取位置

| 文件 | 函数/位置 | 行号 | 用途 |
|------|----------|------|------|
| `src/stores/profileStore.ts` | `fetchStats()` | 48-54 | `COUNT(DISTINCT species_id) FROM tasks WHERE status='killed'` |
| `src/stores/profileStore.ts` | `fetchDiscoveredSpecies()` | 119-175 | 按species_id分组查询; 降级: 从monster_variant推导 |
| `src/stores/profileStore.ts` | `isSpeciesNew()` | 286-297 | `COUNT(*) FROM tasks WHERE species_id=$1 AND status='killed'` |
| `src/lib/bestiary.ts` | `selectSpecies()` | 420-443 | 确定性选择: category→tier→hash(name)%pool |
| `src/lib/bestiary.ts` | `generateRelevantName()` | 457-466 | 调用 selectSpecies 返回 {name, species} |
| `src/components/profile/BestiaryCollection.tsx` | 组件渲染 | 24-88 | 遍历 BESTIARY + discoveredSpecies 渲染图鉴 |
| `src/components/common/SpeciesDiscoveryCard.tsx` | 组件渲染 | 12 | `BESTIARY.find(s => s.id === speciesId)` |
| `src/components/hunt/PrepPhase.tsx` | 组件渲染 | 48-51 | selectSpecies → 精灵图渲染 |
| `src/components/hunt/FocusPhase.tsx` | 组件渲染 | 47 | selectSpecies → 确定战斗对手 |
| `src/components/village/HuntBoard.tsx` | 多处 | — | selectSpecies → 显示怪物信息 |
| `src/components/village/HuntList.tsx` | 多处 | — | selectSpecies → 显示怪物信息 |

### 3.3 写入/修改位置

| 文件 | 函数 | 行号 | 操作 |
|------|------|------|------|
| `src/lib/db.ts` | `backfillSpeciesIds()` | 19-42 | 启动时回填: 查询缺失species_id的killed任务 → selectSpecies → UPDATE |
| `src/stores/taskStore.ts` | `identifyTask()` | 94-113 | 任务识别时设置 species_id (来自 selectSpecies) |
| `src/stores/taskStore.ts` | `splitTask()` | 266-283 | 子任务继承父任务 species_id |
| `src/components/village/Inbox.tsx` | `handleIdentify()` | 110-159 | selectSpecies → AI命名 → identifyTask(含species_id) |
| `src/components/village/HuntBoard.tsx` | `handleIdentify()` | 375-420 | 同 Inbox 逻辑 |
| `src/components/settlement/Settlement.tsx` | `handleConfirmKill` | 87-96 | 击杀后检测 isSpeciesNew → 触发发现通知 |

### 3.4 多数据源分析

**⚠️ 存在多数据源并行维护:**

| 数据源 | 存储位置 | 性质 | 查询优先级 |
|--------|---------|------|-----------|
| `tasks.species_id` | DB列 | 持久化主键 | 1st (优先使用) |
| `tasks.monster_variant` | DB列 | 序列化字符串 | 2nd (降级推导) |
| `BESTIARY` 常量 | bestiary.ts | 只读定义 | 物种元数据来源 |
| `tasks.monster_name` | DB列 | AI生成或算法 | 仅展示 |

**一致性保障机制**:
1. `selectSpecies()` 是确定性算法 (hash(name) % pool)，同输入→同输出
2. `backfillSpeciesIds()` 启动时自动补全缺失的 species_id
3. `splitTask()` 子任务直接继承父任务 species_id

**⚠️ 潜在风险**: 若编辑任务的 category/difficulty，`selectSpecies()` 可能返回不同物种，但已存的 `species_id` 不会自动更新。

---

## 四、跨数据依赖关系

```
                    ┌─────────────┐
                    │  tasks 表    │
                    │  (核心实体)  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    status='killed'   species_id      current_hp
           │               │               │
     ┌─────┴─────┐   ┌────┴────┐    ┌─────┴─────┐
     │  击杀数    │   │  图鉴    │    │  番茄量    │
     │ COUNT(*)   │   │ GROUP BY │    │ damageTask │
     │ profileStore│  │profileStore│  │→HP=0→kill │
     └─────┬─────┘   └────┬────┘    │→addTomato  │
           │               │         └─────┬─────┘
           ▼               ▼               ▼
      milestones      BESTIARY常量    tomato_farm表
      (附加记录)      (物种元数据)   (农场经济系统)
```

**关键交叉点**: `Settlement.handleConfirmKill()` — 同时触发:
1. 击杀状态写入 (`killTask`)
2. 图鉴新物种检测 (`isSpeciesNew`)
3. 击杀里程碑检测 (`detectNewMilestones`)
4. 番茄/战利品结算 (由 `useReviewFlow` 在此之前完成)
