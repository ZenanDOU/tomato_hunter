## 1. 修复休息→下一番茄视图转换

- [x] 1.1 在 `HuntApp.tsx` 中为 RestScreen 添加 `onStartNextHunt` 回调 prop，回调中将 `flowPhase` 重置为 `"hunting"` 并重置相关状态（drops、strategyNote、lastEssenceTick）
- [x] 1.2 在 `RestScreen.tsx` 的 `handleQuickStartNext` 中，成功调用 `startHunt` 后调用 `onStartNextHunt` 回调
- [x] 1.3 验证：休息结束后点击"开始下一个番茄"，界面正确切换到 PrepPhase

## 2. 策略阶段与专注阶段共享总时长

- [x] 2.1 修改后端 `timer.rs` 的 `advance_phase()`：prep→focus 转换时，将 prep 剩余时间加到 focus 的 duration（clamp 上限为 mode 原始 prep 时长）
- [x] 2.2 修改前端 `PrepPhase.tsx`：主倒计时显示 `pomodoro_remaining_seconds` 而非 `remaining_seconds`
- [x] 2.3 在 `PrepPhase.tsx` 中添加超时提醒：当 prep 阶段已用时超过建议时长（sword: 2min, hammer: 3min）时，显示提醒文字"策略时间已到，建议尽快开始专注"

## 3. 消耗道具名称更新

- [x] 3.1 创建新 migration SQL，更新 equipment 表中消耗道具名称：时间延伸→持久药水、休息延伸→温泉券、时间压缩→疾风符咒、策略跳过→猎人直觉、复盘跳过→战场速记、双倍掉落→幸运护符、番茄肥料→丰收祈愿
- [x] 3.2 在 `db.rs` 中注册新 migration 文件
- [x] 3.3 验证：Workshop 界面显示新的叙事化名称

## 4. 集成验证

- [x] 4.1 完整流程测试：村庄→策略（观察25:00倒计时）→专注（验证剩余时间正确）→复盘→结算→休息→下一番茄（验证视图切换正确）
- [x] 4.2 边界测试：prep 超时提醒、prep 快速跳过时 focus 获得额外时间、长休息后启动下一番茄
