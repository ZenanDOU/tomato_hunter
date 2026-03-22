## 1. damageTask 返回 HP 归零状态

- [x] 1.1 修改 `src/stores/taskStore.ts` 的 `damageTask`：返回类型从 `Promise<void>` 改为 `Promise<{ reachedZero: boolean }>`，在事务中 SELECT 更新后的 current_hp，返回 `{ reachedZero: currentHp <= 0 }`
- [x] 1.2 修改 `src/hooks/useReviewFlow.ts`：用 `damageTask` 的返回值替代单独的 HP 查询 SELECT，删除多余的 DB 查询

## 2. Settlement 击杀判定修复

- [x] 2.1 修改 `src/components/settlement/Settlement.tsx`：添加 `useEffect` 监听 `hpReachedZero` prop 变化，当 prop 从 false 变为 true 时切换 view 到 "kill-confirm"

## 3. 主窗口数据刷新

- [x] 3.1 在 `src/components/settlement/RestScreen.tsx` 的 `handleReturnToVillage` 中，在 `closeHuntWindow()` 前 emit `hunt_completed` 事件
- [x] 3.2 在 `src/HuntApp.tsx` 的 `handleSettlementDone` 中（hammer 模式直接关闭的路径）+ `useReviewFlow.ts` 的 hammer 直接关闭路径，同样 emit `hunt_completed`
- [x] 3.3 在 `src/App.tsx` 中监听 `hunt_completed` 事件，收到后刷新 taskStore.fetchTasks() + planStore.fetchTodayPlan() + inventoryStore.fetchAll()，并清除过时的 recoveryPomodoro

## 4. 恢复对话框修复

- [x] 4.1 ~~改为窗口显示时重新检查~~ — 已在 3.3 中通过 `hunt_completed` 事件处理覆盖
- [x] 4.2 在 `hunt_completed` 事件处理中清除 `recoveryPomodoro`，已在 3.3 中实现

## 5. 验证

- [x] 5.1 TypeScript 编译通过
- [ ] 5.2 手动测试：完成最后一击后应出现击杀判定
- [ ] 5.3 手动测试：返回村庄后 HP 应显示最新值
- [ ] 5.4 手动测试：正常流程中不应出现恢复对话框
