## 1. 内置怪物种族库

- [x] 1.1 创建 src/lib/bestiary.ts：定义 MonsterSpecies 接口和 25 个种族（5 分类 × 5 种族），每个种族有 id/suffix/category/emoji/descTemplates
- [x] 1.2 实现 selectSpecies(category, taskName)：根据分类和任务名 hash 确定性选择种族
- [x] 1.3 实现 generateRelevantName(taskName, category)：提取任务关键词（前 2-4 字）+ 拖延形容词 + 种族后缀，fallback 为完整任务名
- [x] 1.4 实现 generateDescription(species, taskName)：从种族的 descTemplates 中选一个，填入任务关键词
- [x] 1.5 添加 .monster-sprite CSS class：emoji 放大到 48px + image-rendering: pixelated

## 2. 怪物发现卡片

- [x] 2.1 创建 MonsterDiscoveryCard 组件：模态框展示大号 emoji、怪物名、难度/HP、属性标签、故事描述、"加入讨伐清单"按钮
- [x] 2.2 修改 Inbox handleIdentify：生成怪物后不直接 identifyTask，先弹出 MonsterDiscoveryCard
- [x] 2.3 卡片样式：像素风边框 + 明媚配色 + 怪物区域暗紫反差
- [x] 2.4 更新 Rust monster_gen.rs：离线生成改用 bestiary 匹配逻辑（关联性命名）
- [x] 2.5 更新 monster_cmd.rs AI prompt：包含种族列表提示，要求生成任务相关的名称

## 3. 怪物拆分系统

- [x] 3.1 创建 MonsterSplitForm 组件：3 个部位槽（🧠头部/💪身体/🦶脚部），每个有名称、描述、番茄数输入，验证总和等于原始 HP
- [x] 3.2 更新 taskStore：增加 splitTask(parentId, parts[]) 方法，创建 3 个子任务并更新父任务状态
- [x] 3.3 数据库 tasks 表增加 body_part 字段（'head'|'body'|'feet'|null），用于标识子任务部位
- [x] 3.4 创建 migration 003_body_part.sql：ALTER TABLE tasks ADD COLUMN body_part TEXT
- [x] 3.5 更新 types/index.ts：Task 接口增加 body_part 字段
- [x] 3.6 HuntList 中显示拆分怪物：父怪物卡片展示 3 个部位指示器（🧠💪🦶），已完成的打勾，未完成的可点击出击
- [x] 3.7 实现父任务自动完成：所有子任务 killed 时自动将父任务设为 killed
- [x] 3.8 在 Inbox 侦查后（或 HuntList 中）对 >4 番茄怪物显示"拆分怪物"按钮

## 4. 准备阶段互动改造

- [x] 4.1 重写 PrepPhase 组件：展示怪物 emoji + 名称 + 任务名 + 描述 + HP + 属性标签
- [x] 4.2 增加策略提示区："准备从哪里开始入手？" + 可选文本框（策略笔记）
- [x] 4.3 增加"开始战斗"确认按钮，点击后保存策略笔记 → 进入 focus
- [x] 4.4 数据库 pomodoros 表增加 strategy_note 字段
- [x] 4.5 创建 migration 004_strategy_note.sql：ALTER TABLE pomodoros ADD COLUMN strategy_note TEXT DEFAULT ''
- [x] 4.6 更新 HuntApp handleReviewComplete：保存策略笔记到 pomodoro 记录
- [x] 4.7 准备阶段窗口放大（调用 Tauri window resize API）
- [x] 4.8 进入 focus 后窗口缩回紧凑尺寸

## 5. 狩猎浮窗信息增强

- [x] 5.1 FocusPhase 显示真实任务名称为主标题（通过 task_id 从 taskStore 读取）
- [x] 5.2 显示怪物名称为副标题
- [x] 5.3 显示番茄进度"番茄 N/M"（通过 task 的 actual_pomodoros/total_hp）
- [x] 5.4 如果是拆分子任务，显示部位图标和部位任务名（如"💪 身体 · 写报告主体"）
- [x] 5.5 番茄收容所详情页增加策略笔记展示

## 6. 集成验证

- [x] 6.1 侦查流程：创建任务 → 侦查 → 验证怪物发现卡片展示（emoji、关联名称、故事描述）
- [x] 6.2 拆分流程：创建 6 番茄任务 → 侦查 → 拆分为头/身/脚 → 验证 3 个子任务创建正确 → 逐个击杀 → 验证父任务自动完成
- [x] 6.3 准备阶段：出击 → 验证互动式准备页面（怪物信息 + 策略笔记 + 确认按钮）→ 开始战斗 → 验证窗口缩小
- [x] 6.4 狩猎信息：focus 阶段验证显示真实任务名 + 怪物名 + 进度 + 部位（如有拆分）
- [x] 6.5 全链路：创建 → 侦查 → 拆分 → 计划 → 出击（准备+策略）→ 战斗 → 结算 → 收容所验证策略笔记
