## Why

构建一个以番茄工作法为核心的游戏化效率工具——Tomato Hunter。通过怪物猎人式的狩猎隐喻，解决番茄钟工具在长期使用中体验趋同、缺乏成长感的问题，同时将 GTD 任务管理包装在游戏语言中，降低效率工具的使用门槛。

## What Changes

- 新建 Tauri v2 桌面应用（Windows 优先），React + TypeScript 前端
- 村庄系统：GTD 式任务管理（收件箱 → 鉴定 → 猎物清单 → 今日计划）+ 每日番茄预算
- 番茄钟微循环：准备（2分）→ 专注（动态）→ 回顾（3分），最小浮窗运行
- 猎物系统：任务由 AI 生成为独特怪物，支持多番茄血条追踪和大任务拆分
- 成长系统：装备制作（武器/护甲/道具）+ Build 策略搭配，策略成长而非数值膨胀
- 素材掉落：基于任务分类的随机掉落，稀有变体机制
- 狩猎图鉴：历史记录 + 预估 vs 实际的效率洞察
- 暂停机制：需消耗烟雾弹道具，3 分钟上限，超时自动撤退
- 崩溃恢复：启动时检测未完成番茄钟，提供恢复或撤退选项

## Capabilities

### New Capabilities

- `village-task-management`: 村庄任务管理系统，GTD 收件箱到今日计划的完整流程 + 每日番茄预算
- `pomodoro-timer`: 番茄钟核心引擎，Rust 单调时钟实现，准备→专注→回顾微循环，浮窗模式
- `monster-system`: 猎物系统，AI 生成怪物 + 离线回退，难度分级，多番茄血条，大任务拆分
- `growth-equipment`: 成长与装备系统，素材掉落，装备制作，Build 搭配，工坊界面
- `hunt-journal`: 狩猎图鉴，击杀历史，复盘记录，预估 vs 实际统计

### Modified Capabilities

## Impact

- 新建完整 Tauri v2 项目结构（Rust 后端 + React 前端）
- 依赖：tauri v2, tauri-plugin-sql (SQLite), tauri-plugin-notification, reqwest, rand
- 前端依赖：react, zustand, tailwindcss, @tauri-apps/api, @tauri-apps/plugin-sql
- 外部 API：Claude API（可选，用于怪物生成，离线可回退）
- 平台：Windows 桌面端，后续扩展 macOS
