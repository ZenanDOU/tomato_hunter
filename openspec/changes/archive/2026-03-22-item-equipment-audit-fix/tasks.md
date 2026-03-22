## 1. 稀有素材解锁配方

- [x] 1.1 在 `src/lib/loot.ts` 中新增 `checkAndUnlockRecipes(drops)` 函数：检测掉落的稀有素材是否为首次获得（原 player_materials 数量 = 0），如果是则 UPDATE equipment SET unlocked = 1 WHERE recipe LIKE '%"matId"%'，返回解锁的装备名称列表
- [x] 1.2 修改 `applyLoot` 函数，在插入 loot_drops 和更新 player_materials 之间调用 `checkAndUnlockRecipes`，返回解锁列表
- [x] 1.3 在 `src/hooks/useReviewFlow.ts` 中接收 `applyLoot` 返回的解锁列表，并在 review 完成时显示"新配方发现！"通知（可复用现有通知模式或简单 alert）

## 2. 消耗品使用入口

- [x] 2.1 在 `src/components/settlement/RestScreen.tsx` 添加休息延伸按钮：读取 inventoryStore 中 ID 9 的数量，>0 时显示按钮，点击消耗一个并调用 timerStore 的 extendBreak(2)
- [x] 2.2 在 `src/components/hunt/PrepPhase.tsx` 添加策略跳过按钮：读取 inventoryStore 中 ID 11 的数量，>0 时显示按钮，点击消耗一个并直接调用 advancePhase()
- [x] 2.3 在 `src/components/hunt/ReviewPhase.tsx` 添加复盘跳过按钮：读取 inventoryStore 中 ID 12 的数量，>0 时显示按钮，点击消耗一个并调用 onComplete("（跳过复盘）", null, "")

## 3. 锻造反馈

- [x] 3.1 在 `src/components/village/Workshop.tsx` 的 EquipmentCard 中为制作按钮添加成功状态：点击后播放 `audioManager.playSfx("equip")`（复用已有音效），按钮文字变为"制作成功！✅"，1.5 秒后恢复
- [x] 3.2 确认 audio 系统已有 "craft" sfx，如果没有则添加（可复用 "equip" 或其他已有音效）——复用 "equip" 音效

## 4. 验证

- [ ] 4.1 手动验证：在有稀有素材掉落的场景下，确认装备从锁定变为可制作（需运行应用测试）
- [ ] 4.2 手动验证：在各阶段（休息、策略、复盘）确认消耗品按钮显示并可用（需运行应用测试）
- [ ] 4.3 手动验证：在 Workshop 制作装备后确认有音效和视觉反馈（需运行应用测试）
