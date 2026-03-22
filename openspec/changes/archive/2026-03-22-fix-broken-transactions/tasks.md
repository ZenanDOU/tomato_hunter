## 1. 移除 withTransaction 基础设施

- [x] 1.1 从 `src/lib/db.ts` 移除 `withTransaction` 函数及其导出
- [x] 1.2 从 `src/stores/taskStore.ts` 移除 `withTransaction` 导入

## 2. 改写 taskStore 操作为顺序自动提交

- [x] 2.1 改写 `killTask`: 去掉 withTransaction 包裹，改为顺序 `db.execute()`/`db.select()` 调用
- [x] 2.2 改写 `releaseTask`: 同上
- [x] 2.3 改写 `batchReleaseTasks`: 同上

## 3. 改写其他 store 操作

- [x] 3.1 改写 `planStore.removeTaskFromPlan`: 去掉 withTransaction，改为顺序调用
- [x] 3.2 改写 `inventoryStore.craftEquipment`: 去掉 withTransaction，改为顺序调用

## 4. Settlement 防重入保护

- [x] 4.1 在 `Settlement.tsx` 的 `handleConfirmKill` 中增加 `isProcessing` state，点击后立即 disable 按钮
- [x] 4.2 在 `handleConfirmPursuit` 中同样增加防重入保护

## 5. 验证

- [x] 5.1 测试击杀流程：战斗胜利 → 确认击杀 → 正常切换到庆祝画面（需手动验证）
- [ ] 5.2 测试追击流程：战斗胜利 → 确认追击 → 正常工作（需手动验证）
- [x] 5.3 测试放生流程：村庄中放生任务不报错（需手动验证）
- [x] 5.4 确认 console 无 transaction 相关错误（需手动验证）
