## 1. 数据库迁移

- [x] 1.1 创建 `005_workshop_farm_rework.sql` 迁移脚本：新增 `tomato_farm` 表（id, tomato_count, essence_balance, fertilizer_remaining_minutes）
- [x] 1.2 迁移脚本：equipment 表新增 `price` 字段（INTEGER, nullable, 消耗品番茄素价格）
- [x] 1.3 迁移脚本：替换 equipment 种子数据（3武器 + 3护甲 + 8消耗品，新 effect JSON 结构）
- [x] 1.4 迁移脚本：旧存档兼容——旧武器映射到手剑，旧护甲映射到棉甲，旧消耗品转为等量烟雾弹
- [x] 1.5 迁移脚本：初始化 tomato_farm 行（essence_balance=0, tomato_count=现有获救番茄数量）

## 2. Rust 后端 Timer Mode

- [x] 2.1 定义 TimerMode 枚举（Sword/Dagger/Hammer）和对应 phase flow 逻辑
- [x] 2.2 实现 Sword mode（现有逻辑，2+20+3分钟，5分钟短休息，15分钟长休息/4轮）
- [x] 2.3 实现 Dagger mode（15分钟循环 + awaiting_choice 暂停状态 + action_count 追踪）
- [x] 2.4 实现 Hammer mode（3+44+3分钟，25分钟半程标记，完成后强制返回村庄）
- [x] 2.5 扩展 start_timer 命令接收 timer_mode 参数
- [x] 2.6 新增 Dagger 选择命令：`dagger_choose`（action/rest 两个选项）
- [x] 2.7 实现 Hammer 半程撤退判定（elapsed >= 25min → 1 tomato，完成 → 2 tomatoes）
- [x] 2.8 实现消耗品 timer 修改命令：extend_focus, extend_break, shorten_focus, skip_prep, skip_review

## 3. 番茄农场系统

- [x] 3.1 创建 `src/stores/farmStore.ts`（Zustand store：tomato_count, essence_balance, fertilizer 状态, 产出速率计算）
- [x] 3.2 实现番茄素产出逻辑：focus 阶段每分钟产出 `floor(tomato_count/10)+1`，肥料时翻倍
- [x] 3.3 番茄素产出与 timer tick 事件绑定（每60秒一次结算）
- [x] 3.4 创建 `src/components/journal/TomatoFarm.tsx` 替换 TomatoSanctuary.tsx（番茄墙 + 余额 + 产出速率 + 战斗历史）
- [x] 3.5 更新导航将 🍅收容所 改为 🍅农场

## 4. 装备系统重做

- [x] 4.1 更新 TypeScript 类型定义：WeaponEffect → TimerMode，ArmorEffect → AudioMode，新增消耗品类型
- [x] 4.2 重写 `inventoryStore.ts`：新增 buyConsumable（番茄素扣款），修改 craftEquipment（仅武器/护甲），移除旧 effect 读取逻辑
- [x] 4.3 重写 `Workshop.tsx`：武器/护甲区（合成+装备），消耗品区（番茄素购买），显示番茄素余额
- [x] 4.4 更新 `timerStore.ts`：startHunt 传递 timer_mode 而非 JSON effect 参数
- [x] 4.5 更新合成配方 UI（匕首=齿轮×5+精密齿轮×1，重锤=知识结晶×8+智慧宝石×2，皮甲=生活纤维×5+生命露珠×1，重甲=墨水碎片×5+灵感精华×1+通用碎片×3）

## 5. 护甲音频系统

- [x] 5.1 扩展 AudioManager：新增 `enterFocusWithArmor(audioMode)` 方法（停 BGM，按 mode 启动对应音频）
- [x] 5.2 实现棉甲 silent mode（stopBgm + 静音）
- [x] 5.3 实现皮甲 white-noise mode（stopBgm + 持续 noise buffer 播放 + 退出时 fadeout）
- [x] 5.4 实现重甲 interval-alert mode（stopBgm + 每180秒触发 focus-alert SFX）
- [x] 5.5 新增 focus-alert SFX preset（三角波，升调，0.3秒）
- [x] 5.6 在 HuntApp focus 阶段入口调用 enterFocusWithArmor，退出时恢复 BGM

## 6. 消耗品系统

- [x] 6.1 实现 8 种消耗品的使用逻辑（前端 UI 按钮 + 调用对应 Tauri 命令）
- [x] 6.2 烟雾弹（暂停）：保持现有逻辑，价格改为番茄素
- [x] 6.3 时间延伸/压缩/休息延伸：调用新的 timer 修改命令
- [x] 6.4 策略跳过/复盘跳过：调用 skip_prep/skip_review 命令
- [x] 6.5 双倍掉落：在 loot.ts 中增加 multiplier 参数，HuntApp 检查并传递
- [x] 6.6 番茄肥料：激活时更新 farmStore 的 fertilizer_remaining_minutes

## 7. 前端集成与 Dagger UI

- [x] 7.1 创建 DaggerChoicePhase 组件（"继续行动"/"选择休息"两按钮 + 当前 action_count 显示）
- [x] 7.2 HuntApp 适配 Dagger mode：识别 awaiting_choice phase 并渲染 DaggerChoicePhase
- [x] 7.3 HuntApp 适配 Hammer mode：完成后直接关闭窗口回村庄（无 break/settlement flow）
- [x] 7.4 PrepPhase 适配：手剑2分钟/重锤3分钟/匕首无 prep
- [x] 7.5 消耗品快捷使用 UI：在 FocusPhase 和 ReviewPhase 中显示可用消耗品按钮
- [x] 7.6 番茄奖励显示适配：Hammer 显示1/2番茄，Dagger 显示 ceil(action/2) 番茄

## 8. 掉落与奖励适配

- [x] 8.1 更新 loot.ts：支持 double_loot 消耗品倍率
- [x] 8.2 更新 loot.ts：Hammer 完成产出2个获救番茄，半程撤退1个
- [x] 8.3 更新 loot.ts：Dagger 产出 ceil(action_count/2) 个获救番茄
- [x] 8.4 获救番茄同时增加 tomato_farm 的 tomato_count
