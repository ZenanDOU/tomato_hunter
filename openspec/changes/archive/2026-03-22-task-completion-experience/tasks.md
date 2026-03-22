## 1. 击杀逻辑重构

- [x] 1.1 修改 taskStore.damageTask()：HP 归零时不再自动设置 status='killed'，保持 hunting 状态
- [x] 1.2 在 taskStore 新增 killTask(id) 方法：手动设置 status='killed' + completed_at，处理父任务自动击杀逻辑
- [x] 1.3 在 taskStore 新增 pursuitTask(id, newTotalHp) 方法：重设 total_hp 和 current_hp（current_hp = newTotalHp - actual_pomodoros）

## 2. Settlement 击杀确认与追击

- [x] 2.1 在 useReviewFlow 中检测 HP 归零状态，传递 hpReachedZero 标志到 Settlement
- [x] 2.2 在 Settlement 组件中添加 HP 归零时的确认 UI："确认击杀" / "发起追击" 两个按钮
- [x] 2.3 实现"确认击杀"流程：调用 killTask() → 切换到庆祝视图
- [x] 2.4 实现"发起追击"流程：消耗追踪术卷轴 → HP 重设界面（输入框 + 约束校验）→ 调用 pursuitTask() → 进入休息/回村

## 3. 击杀庆祝视图

- [x] 3.1 在 Settlement 中实现庆祝视图：增强版 header、击杀统计卡片（怪物名、任务名、实际/预估番茄数、效率标签）
- [x] 3.2 实现效率标签逻辑：完美估时 / 提前完成 / 多花时间，配对应颜色
- [x] 3.3 实现庆祝视觉效果：怪物 sprite 击败动画（闪烁+淡出）、闪光粒子
- [x] 3.4 处理拆分怪物的父级自动击杀：聚合子任务统计数据展示

## 4. PlanStore 分区计算

- [x] 4.1 在 planStore 中添加计算属性：将 plan entries 按 task.status 分为 hunting/ready/killed 三组
- [x] 4.2 添加 totalPlanned 和 totalCompleted 聚合计算属性
- [x] 4.3 添加 remainingTimeEstimate 计算属性（未完成番茄数 × 当前武器时长）

## 5. DailyPlanBoard 三区重构

- [x] 5.1 重构 DailyPlanBoard 布局：顶部进度条 + 三区结构（进行中 / 待战 / 已讨伐）
- [x] 5.2 实现顶部进度摘要栏：PixelProgressBar 显示 completed/planned 番茄数 + 剩余时间
- [x] 5.3 实现「⚔️ 进行中」区域：hunting 状态任务高亮显示，带脉冲边框和实时进度条
- [x] 5.4 实现「📋 待战」区域：ready 状态任务保持排序和操作按钮 + 新增"击杀"按钮
- [x] 5.5 实现「✅ 已讨伐」区域：killed 状态任务紧凑展示，含实际/计划番茄数和效率颜色标记
- [x] 5.6 实现已讨伐区域的折叠/展开功能（默认折叠，显示计数）
- [x] 5.7 实现手动击杀操作：击杀按钮 → 确认对话框 → 调用 killTask() → 内联庆祝动画
- [x] 5.8 处理全部完成状态：进度条 100% 时显示"今日讨伐完成！🎉"

## 6. 集成验证

- [x] 6.1 验证 HP>0 的普通番茄结算流程不受影响
- [x] 6.2 验证 HP 归零后确认击杀 → 庆祝流程完整
- [x] 6.3 验证 HP 归零后发起追击 → HP 重设 → 继续讨伐流程
- [x] 6.4 验证 DailyPlanBoard 手动击杀 → 任务移入已讨伐区
- [x] 6.5 验证 Hammer 模式下 HP 归零确认的兼容性
- [x] 6.6 验证拆分怪物：最后子任务击杀 → 父级自动击杀 → 庆祝展示
