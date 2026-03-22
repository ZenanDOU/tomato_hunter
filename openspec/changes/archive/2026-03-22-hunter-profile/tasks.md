## 1. 数据库与数据层

- [x] 1.1 创建 migration 009：新增 `milestones` 表 (id TEXT PK, achieved_at TEXT, notified INTEGER DEFAULT 0)
- [x] 1.2 在 migration 009 中添加追溯计算逻辑：从 pomodoros/tasks 表聚合现有数据，INSERT 已达成里程碑 (notified=1)
- [x] 1.3 在 db.rs 注册 migration 009
- [x] 1.4 数据查询函数（实现为 profileStore 中的前端 SQL，与项目现有模式一致）
- [x] 1.5 get_discovered_species 查询（profileStore.fetchDiscoveredSpecies）
- [x] 1.6 get_milestones 查询（profileStore.fetchMilestones）
- [x] 1.7 check_and_record_milestones（profileStore.detectNewMilestones）
- [x] 1.8 mark_milestone_notified（profileStore.markMilestoneNotified）

## 2. 里程碑系统

- [x] 2.1 创建 `src/lib/milestones.ts`：定义里程碑常量数组 (id, name, description, icon, checkFn)
- [x] 2.2 实现 13 个初始里程碑的检测函数
- [x] 2.3 创建 `src/stores/profileStore.ts`：管理 hunter stats、milestones、discovered species 状态
- [x] 2.4 在 profileStore 中实现 `detectNewMilestones()` 方法

## 3. 结算阶段集成

- [x] 3.1 在结算流程（RestScreen/Settlement）中，loot 展示后调用 `detectNewMilestones()`
- [x] 3.2 创建 `src/components/common/MilestoneNotification.tsx`：里程碑达成弹窗组件（像素风卡片，显示 icon + name + description + 确认按钮）
- [x] 3.3 创建 `src/components/common/SpeciesDiscoveryCard.tsx`：新物种发现通知组件（显示物种 sprite + 名称 + 家族 + 栖息地）
- [x] 3.4 在结算流程中集成通知序列：loot → 新物种发现(如有) → 里程碑通知(如有) → 休息

## 4. 猎人档案面板

- [x] 4.1 创建 `src/components/profile/HunterProfile.tsx`：猎人档案主面板，包含三个区域的布局
- [x] 4.2 创建 `src/components/profile/StatsOverview.tsx`：统计总览区域（5 个核心数字 + 像素风格卡片）
- [x] 4.3 创建 `src/components/profile/MilestoneList.tsx`：里程碑列表（已达成 + 未达成分组，进度提示）
- [x] 4.4 创建 `src/components/profile/BestiaryCollection.tsx`：怪物图鉴收集视图（5 家族 × 3 tier 网格）
- [x] 4.5 创建 `src/components/profile/SpeciesDetail.tsx`：物种详情展开面板（描述、特性、击杀历史）
- [x] 4.6 在 VillageLayout.tsx 中注册"猎人档案"为第六个 Tab

## 5. 前端类型与命令绑定

- [x] 5.1 在 `src/types/index.ts` 添加 HunterStats、MilestoneRecord、SpeciesDiscovery 类型定义
- [x] 5.2 数据查询通过 profileStore 直接使用 getDb()，无需 Tauri command 包装

## 6. 新物种发现检测

- [x] 6.1 在击杀怪物时（killTask 调用后），查询该 monster_variant 是否为首次击杀
- [x] 6.2 将"是否新物种"标记传递给结算流程，触发 SpeciesDiscoveryCard 显示
