## Why

休息结束后的番茄衔接流程存在严重 bug：用户点击"开始下一个番茄"后，HuntApp 的 `flowPhase` 仍为 `"rest"`，导致新番茄的 prep/focus 阶段被 RestScreen 遮挡，计时器在后台运行但界面卡在休息视图。此外，消耗道具的命名过于功能化（如"策略跳过"、"复盘跳过"），缺乏与狩猎世界观的情节融合。最后，策略阶段应与专注阶段共享 25 分钟总时长，让用户快速完成策略可以获得更多专注时间。

## What Changes

- **[BUG] 修复休息→下一番茄的视图转换**：当从 RestScreen 启动下一个番茄时，将 HuntApp 的 `flowPhase` 重置为 `"hunting"`，确保 PrepPhase 正确显示
- **[BUG] 修复 flowPhase 状态与 timer phase 的同步机制**：在 HuntApp 的 tick 回调或 phase_changed 事件中，增加 flowPhase 与实际 timer.phase 的一致性校验
- **[改进] 消耗道具名称故事化映射**：将功能性名称替换为符合狩猎世界观的叙事名称（如"策略跳过"→"猎人直觉"，"复盘跳过"→"战场速记"等）
- **[改进] 策略阶段与专注阶段共享番茄总时长**：策略阶段倒计时从 25:00 开始（而非独立的 2:00），用户快速完成策略后剩余时间自动补入专注阶段；超过 2 分钟弹出提醒

## Capabilities

### New Capabilities

（无新能力，均为现有能力的修复与增强）

### Modified Capabilities

- `pomodoro-timer`: 修复 break→next pomodoro 的阶段转换逻辑；修改 prep 阶段计时模型为与 focus 共享总时长；超时提醒机制
- `growth-equipment`: 消耗道具名称从功能描述改为叙事风格名称

## Impact

- **前端**：`src/HuntApp.tsx`（flowPhase 重置逻辑）、`src/components/settlement/RestScreen.tsx`（通知父组件重置状态）
- **后端**：`src-tauri/src/timer.rs`（prep 阶段计时模型变更，剩余时间传递给 focus）、`src-tauri/src/commands/timer_cmd.rs`（超时提醒事件）
- **数据库**：`migrations/` 中消耗道具名称更新
- **Spec**：`pomodoro-timer/spec.md`、`growth-equipment/spec.md` 需更新对应 requirements
