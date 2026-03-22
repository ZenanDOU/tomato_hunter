## Context

Tomato Hunter 的狩猎流程由 `HuntApp.tsx` 中的 `flowPhase` 状态（"hunting" | "settlement" | "rest"）控制视图切换，同时后端 `timer.rs` 维护独立的 `TimerPhase` 状态机。当前存在两层状态不同步的问题：

1. `RestScreen.handleQuickStartNext()` 调用 `startHunt()` 后，后端 timer 已进入 `prep` phase，但 HuntApp 的 `flowPhase` 仍为 `"rest"`，导致新番茄的 PrepPhase 被 RestScreen 遮挡
2. 策略阶段（prep）有独立的 2 分钟计时器，与专注阶段的 20 分钟计时器割裂，用户感知不到两者共享 25 分钟总时长
3. 消耗道具使用功能性命名（"策略跳过"、"复盘跳过"），与狩猎世界观不匹配

## Goals / Non-Goals

**Goals:**
- 修复休息→下一番茄的视图转换 bug，确保 flowPhase 与 timer.phase 同步
- 让策略阶段倒计时从番茄总时长开始（如 25:00），剩余时间传递给专注阶段
- 超过 2 分钟策略时间后给出温和提醒
- 将消耗道具名称替换为符合世界观的叙事名称

**Non-Goals:**
- 不改变 timer 状态机的 phase 类型或后端架构
- 不修改匕首/重锤模式的流程
- 不调整消耗道具的效果/价格/机制，仅改名称
- 不改变 prep 阶段的 2 分钟建议时长上限，只改计时显示方式

## Decisions

### Decision 1: flowPhase 重置方案 — 通过事件回调通知父组件

**选择**：RestScreen 通过 props 回调通知 HuntApp 重置 flowPhase

**理由**：
- 方案 A（监听 timer.phase 自动同步）：在 HuntApp 的 tick handler 中检测 phase 变化会引入复杂的边界条件，且 settlement 阶段也需要 flowPhase 与 timer.phase 不同步
- 方案 B（props 回调）：RestScreen 在 `handleQuickStartNext` 成功后调用 `onStartNextHunt()` 回调，HuntApp 重置 flowPhase 为 "hunting"。简单、明确、无副作用
- **选择方案 B**

### Decision 2: 策略阶段共享总时长 — 后端传递剩余时间

**选择**：后端在 `advance_phase()` 从 prep→focus 时，将 prep 未用完的时间加到 focus 的 total_seconds

**实现**：
- `TimerState` 已有 `pomodoro_remaining_seconds` 和 `pomodoro_total_seconds` 字段，前端用这些显示总倒计时
- 后端 `advance_phase()` 在 prep→focus 转换时：`focus_duration = mode_focus_duration + prep_remaining_seconds`
- 前端 PrepPhase 显示 `pomodoro_remaining_seconds`（从 25:00 开始倒计时），而非 `remaining_seconds`（2:00）
- 若 prep 阶段超过建议时长（2 分钟），前端发出事件 `prep_overtime`，显示提醒文字

### Decision 3: 消耗道具命名映射

| 当前名称 | 新名称 | 叙事逻辑 |
|---------|--------|---------|
| 策略跳过 | 猎人直觉 | 经验丰富的猎人凭直觉判断无需策略 |
| 复盘跳过 | 战场速记 | 在战斗中已快速记录要点，无需复盘 |
| 时间延伸 | 持久药水 | 增强猎人耐力，延长战斗时间 |
| 时间压缩 | 疾风符咒 | 加速时间流逝，缩短战斗 |
| 休息延伸 | 温泉券 | 在温泉多泡一会儿 |
| 双倍掉落 | 幸运护符 | 增加掉落运气 |
| 番茄肥料 | 丰收祈愿 | 向大地祈愿获得丰收 |
| 烟雾弹 | 烟雾弹 | 已经是叙事化名称，保持不变 |

### Decision 4: 超时提醒机制 — 前端计算，无后端变更

**选择**：前端 PrepPhase 组件自行判断 prep 是否超过 2 分钟，显示提醒文字

**理由**：避免增加后端事件复杂度，prep 阶段的超时提醒是 UI 层面的温和提示，不影响计时逻辑

## Risks / Trade-offs

- **[风险] prep 剩余时间传递可能导致 focus 总时长超预期** → 缓解：上限 clamp，focus 最多获得 prep 原始时长的额外时间（sword: +2min）
- **[风险] 数据库迁移改名可能影响已保存的 loadout snapshot** → 缓解：loadout_snapshot 是 JSON 快照，旧数据保持原样，仅新数据使用新名称
- **[权衡] flowPhase 通过 props 回调重置增加了 RestScreen-HuntApp 耦合** → 可接受：这是父子组件间的标准通信模式
