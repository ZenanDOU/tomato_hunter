## Context

匕首模式（Dagger Mode）是一个无限循环的短时专注模式：用户在 AwaitingChoice 选择"继续行动"或"选择休息"，每次 15 分钟。当前实现中，`TimerConfig.focus_seconds` 被消耗品（时间延伸/压缩）永久修改，跨轮次累积导致后续计时器偏移。此外 DaggerRest 复用 `focus_seconds` 作为时长，导致休息时间也受影响。

当前代码位置：
- `src-tauri/src/timer.rs`: TimerEngine 状态机核心
- `src-tauri/src/commands/timer_cmd.rs`: Tauri 命令层
- `src/components/hunt/FocusPhase.tsx`: 专注阶段 UI

## Goals / Non-Goals

**Goals:**
- 每次选择"继续行动"时，计时器始终从 15 分钟（900 秒）开始
- DaggerRest 独立于 focus_seconds，始终 15 分钟
- FocusPhase 在匕首模式下使用语义正确的 remaining_seconds
- 消耗品在匕首模式下仅影响当前轮次

**Non-Goals:**
- 不改变匕首模式的整体玩法设计（无限循环、无自动休息等）
- 不添加匕首模式的"正常完成"流程（retreat 是当前设计意图）
- 不修改剑模式或锤模式的行为

## Decisions

### 1. 在 `dagger_choose()` 中重置 focus_seconds

**方案**: 在 `dagger_choose()` 中将 `config.focus_seconds` 重置为 900（原始值）。

**替代方案**: 在 TimerConfig 中保存 `original_focus_seconds` 字段。但这增加了复杂度，且匕首模式的 focus 时间是固定的 15 分钟，直接硬编码 900 更简单。

**决策**: 使用常量 `DAGGER_FOCUS_SECONDS = 900` 来重置，避免魔术数字。

### 2. DaggerRest 独立时长

**方案**: 在 `duration_for_phase` 中，`DaggerRest` 使用同一个常量 `DAGGER_FOCUS_SECONDS` 而非 `self.focus_seconds`。

**理由**: 休息时间不应受任何消耗品影响，始终保持 15 分钟。

### 3. FocusPhase 显示字段

**方案**: FocusPhase 根据 `timer_mode` 判断使用 `remaining_seconds`（匕首/锤模式）或 `pomodoro_remaining_seconds`（剑模式）。

**理由**: `pomodoro_remaining_seconds` 在匕首模式下虽然数值碰巧正确（review_seconds=0），但语义上"番茄剩余"对匕首没有意义。使用 `remaining_seconds` 更准确。

## Risks / Trade-offs

- [风险] 硬编码 900 秒 → 如果未来想让匕首时长可配置需要改。但目前设计是固定 15 分钟，可以接受。
- [风险] 消耗品在匕首模式下的"仅当前轮次"效果 → 用户可能困惑为什么效果不持续。但这实际上是正确行为——每轮都是独立的 15 分钟。
