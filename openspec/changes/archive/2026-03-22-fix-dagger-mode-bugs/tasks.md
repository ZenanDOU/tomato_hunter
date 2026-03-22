## 1. 后端计时器修复

- [x] 1.1 在 `timer.rs` 中添加 `DAGGER_FOCUS_SECONDS` 常量（900），替换 `TimerConfig::dagger()` 中的魔术数字
- [x] 1.2 修改 `dagger_choose()` 方法：每次选择时重置 `config.focus_seconds = DAGGER_FOCUS_SECONDS`
- [x] 1.3 修改 `duration_for_phase()` 中 `DaggerRest` 分支：返回 `DAGGER_FOCUS_SECONDS` 常量而非 `self.focus_seconds`

## 2. 前端显示修复

- [x] 2.1 修改 `FocusPhase.tsx` 倒计时显示：匕首模式使用 `remaining_seconds`，剑模式保持 `pomodoro_remaining_seconds`

## 3. 测试更新

- [x] 3.1 更新 `timer.rs` 中现有匕首模式测试，验证 focus_seconds 重置行为
- [x] 3.2 添加新测试：验证消耗品修改 focus_seconds 后，下一轮 dagger_choose 重置为 900
- [x] 3.3 添加新测试：验证 DaggerRest 时长始终为 900 秒，不受 focus_seconds 修改影响
