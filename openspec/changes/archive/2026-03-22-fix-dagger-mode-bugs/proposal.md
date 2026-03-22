## Why

匕首模式存在多个 bug：(1) 使用消耗品（时间压缩/延伸）后 `config.focus_seconds` 被永久修改，导致后续轮次计时器不再从 15 分钟开始（可低至 60 秒）；(2) DaggerRest 和 Focus 共用同一个 `focus_seconds`，导致休息时间也受消耗品影响；(3) 退出匕首模式只能 retreat（撤退），没有正常完成流程，无法获得应有的番茄奖励。这些 bug 影响核心玩法体验，需要立即修复。

## What Changes

- 修复 `dagger_choose()`: 每次选择新行动时重置 `focus_seconds` 回 900 秒，确保每轮总是从 15 分钟开始
- 为 DaggerRest 添加独立的时长字段（`dagger_rest_seconds`），解耦休息和专注时间
- FocusPhase 在匕首模式下使用 `remaining_seconds` 而非 `pomodoro_remaining_seconds` 显示倒计时（虽然当前数值碰巧相同，但语义更准确）
- 审查匕首模式中消耗品（烟雾弹暂停、时间延伸、时间压缩）的交互逻辑，确保不会导致卡死

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `pomodoro-timer`: 修复匕首模式计时器重置逻辑和 DaggerRest 时长解耦

## Impact

- 后端: `src-tauri/src/timer.rs` — TimerConfig 结构体、`dagger_choose()`、`duration_for_phase()`
- 前端: `src/components/hunt/FocusPhase.tsx` — 匕首模式倒计时显示字段
- 测试: `timer.rs` 中匕首相关测试需更新
