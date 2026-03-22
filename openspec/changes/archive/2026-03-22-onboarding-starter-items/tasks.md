## 1. Settings & Store 基础设施

- [x] 1.1 在 settingsStore 中新增 `starter_items_granted` 和 `first_kill_reward_granted` 两个 boolean 设置项，增加读取和写入方法
- [x] 1.2 在 inventoryStore 中新增 `grantItems(items: {equipmentId: number, quantity: number}[])` 方法，使用 INSERT ON CONFLICT UPDATE 写入 player_equipment

## 2. 引导完成奖励

- [x] 2.1 在 App.tsx 初始化时，检测新用户（onboardingCompleted=false 且 starterItemsGranted=false）自动发放 5 个时间压缩（ID 10）

## 3. 首次击杀奖励

- [x] 3.1 在 useReviewFlow 中首次番茄完成时，调用 grantItems 发放 2 个烟雾弹（ID 7），并设置 `first_kill_reward_granted = true`
- [x] 3.2 在 Settlement 中内联奖励卡片，展示获得的道具、消耗品使用说明、工坊购买提示
- [x] 3.3 通过 showFirstKillReward prop 从 HuntApp → Settlement 传递首杀奖励显示状态

## 4. 验证

- [x] 4.1 手动测试完整新用户流程：创建任务 → 识别怪物 → 加入计划 → 完成番茄 → 验证道具发放和提示展示
- [x] 4.2 验证重复触发防护：刷新页面后不会重复发放道具
