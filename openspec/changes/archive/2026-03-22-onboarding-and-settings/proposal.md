## Why

番茄猎人有丰富的游戏化番茄钟机制，但存在两个体验问题：
1. 新用户首次打开缺乏引导，需自行摸索"侦查→讨伐→今日计划→出猎"的完整流程
2. 讨伐列表中的怪物只增不减——过期的任务变成的怪物无法清理，列表越来越臃肿，影响日常使用效率

## What Changes

- 添加分步式新手引导流程，在用户首次使用时逐步介绍核心功能
- 引导采用交互式高亮提示（spotlight + tooltip），保持沉浸感
- 在讨伐列表中为每只怪物添加"释放"操作，允许用户放走不再需要的怪物
- 释放操作使用新状态 `released` 而非硬删除，保留历史数据
- 支持批量释放和确认机制，防止误操作

## Capabilities

### New Capabilities
- `onboarding`: 新手引导系统，包含分步引导流程、高亮提示、进度追踪和重新触发机制
- `monster-cleanup`: 怪物释放/清理功能，支持单只释放和批量释放

### Modified Capabilities
- `design-system`: 新增引导提示（tooltip/spotlight）相关的像素风格组件

## Impact

- **前端组件**: 新增 `OnboardingOverlay` 组件，修改 `HuntList` 添加释放操作
- **Store**: 新增引导状态管理，扩展 `taskStore` 添加 `releaseTask` / `batchReleaseTasks` 方法
- **数据库**: tasks 表新增 `released` 状态值，settings 表新增引导状态键值
- **类型**: TaskStatus 类型新增 `released` 值
