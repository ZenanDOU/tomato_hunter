## Context

装备系统有 3 类（武器、护甲、消耗品），当前存在：
- 装备 `unlocked` 字段在数据库中标记为 0，但没有代码将其设为 1
- spec 定义了"首次获得稀有素材时解锁配方"的规则，但 `loot.ts` 和 `inventoryStore.ts` 都未实现
- 3 个消耗品（休息延伸、策略跳过、复盘跳过）在购买系统中可用，但对应的 UI 阶段没有使用入口
- Workshop 的制作操作没有任何成功/失败反馈

## Goals / Non-Goals

**Goals:**
- 实现稀有素材→配方解锁的完整流程
- 让所有 8 个消耗品都能在正确的场景中被使用
- 锻造操作有明确的视觉和音效反馈

**Non-Goals:**
- 不改变素材掉落概率或装备数值
- 不新增装备或消耗品类型
- 不重构 Workshop UI 布局

## Decisions

### 1. 解锁时机：在 `applyLoot` 流程中检测

在 `loot.ts` 的 `applyLoot` 函数中，对每个稀有素材掉落检查玩家是否首次获得（原数量为 0）。如果是首次，执行 `UPDATE equipment SET unlocked = 1 WHERE recipe LIKE '%"matId"%'` 并收集解锁的装备列表。

**替代方案**：在 `inventoryStore.fetchAll` 时动态计算解锁状态 → 拒绝，因为这改变了 `unlocked` 的语义，且每次加载都要遍历所有配方。

**替代方案**：去掉 `unlocked` 字段，改为"有素材就能制作" → 拒绝，因为这删除了"配方发现"这个有趣的游戏反馈时刻。

### 2. 解锁通知：返回值 + 事件

`applyLoot` 返回解锁的装备名称列表，由 `useReviewFlow` 在 review 完成时显示通知。使用现有的 toast/notification 模式（如果有）或简单的状态展示。

### 3. 消耗品入口：最小化侵入

- **休息延伸 (ID 9)**：在 `RestScreen` 休息倒计时区域添加按钮，消耗后调用 `extendBreak(2)` timer command
- **策略跳过 (ID 11)**：在 `PrepPhase` 添加"跳过策略"按钮，消耗后直接调用 `advancePhase()`
- **复盘跳过 (ID 12)**：在 `ReviewPhase` 添加"跳过复盘"按钮，消耗后用默认值调用 `onComplete`

每个按钮只在玩家持有该消耗品时显示（与 FocusPhase 的烟雾弹按钮模式一致）。

### 4. 锻造反馈

- 成功：播放 `audioManager.playSfx("craft")` + 按钮短暂变为"制作成功！✅"状态（1.5 秒后恢复）
- 失败（理论上不会出现因为按钮已 disabled）：静默处理

## Risks / Trade-offs

- **[Risk] 解锁配方用 `LIKE '%"matId"%'` 查询 recipe JSON 字段** → Mitigation: 装备表只有 14 行，性能不是问题。配方格式固定为 `{"matId": qty}`，匹配可靠
- **[Risk] 跳过复盘可能让玩家错过反思机会** → Mitigation: 消耗品价格 12 精华已是合理门槛，且跳过后仍会触发正常的 loot/HP 结算
- **[Risk] `applyLoot` 函数职责扩大** → Mitigation: 解锁逻辑独立为辅助函数 `checkAndUnlockRecipes`，保持 `applyLoot` 主流程清晰
