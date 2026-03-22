## Why

村庄主界面当前有 6 个 Tab（侦察、讨伐、计划、工坊、农场、档案），导航过于分散。侦察（Inbox）与讨伐（HuntList）在功能上是连续流程（发现→就绪→出击），拆成两个 Tab 增加了认知负担。战斗历史夹在农场页面中定位模糊，农场本身缺少互动玩法，仅展示统计数据。

## What Changes

- **合并侦察与讨伐看板**：将 Inbox（未鉴定任务）和 HuntList（就绪/狩猎中怪物）合并为统一的「狩猎看板」Tab，以状态分组展示全部任务流转。Tab 数从 6 减少到 5。
- **迁移战斗历史**：将 TomatoFarm 中的战斗历史（已击杀怪物列表及番茄钟记录）移至猎人档案页面，作为新的「战斗日志」区块。
- **农场轻经营玩法**：为番茄农场增加互动经营机制：
  - 浇水（免费操作，加速番茄产出）
  - 施肥（消耗道具，大幅提升产出效率）
  - 温馨农场画面重新设计，增加收获感

## Capabilities

### New Capabilities
- `hunt-board`: 统一狩猎看板，合并侦察（Inbox）与讨伐（HuntList）为单一 Tab，按任务状态分组展示
- `farm-interaction`: 农场轻经营玩法，包括浇水、施肥等互动操作及视觉重设计

### Modified Capabilities
- `village-task-management`: Tab 结构从 6 个缩减为 5 个，移除独立的侦察和讨伐 Tab
- `hunter-profile`: 新增「战斗日志」区块，承接从农场迁移的战斗历史数据
- `tomato-farm`: 移除战斗历史展示，新增互动经营 UI

## Impact

- **组件变更**：`VillageLayout.tsx`（Tab 结构）、`Inbox.tsx` + `HuntList.tsx`（合并为新组件）、`TomatoFarm.tsx`（移除战斗历史 + 新增互动）、`HunterProfile.tsx`（新增战斗日志）
- **Store 变更**：`farmStore.ts`（浇水/施肥状态管理）、`inventoryStore.ts`（施肥道具消耗）
- **无后端变更**：所有改动均为前端 UI 重组和状态管理调整
