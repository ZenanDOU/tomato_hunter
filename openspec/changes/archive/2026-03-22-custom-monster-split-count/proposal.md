## Why

当前怪物拆分固定为 3 个部位（由 bestiary 中每个物种的 `bodyParts` 数组决定），对于史诗和传说难度的大型怪物，3 份不够细粒度地分解任务。用户需要能自定义拆分数量，才能合理规划复杂工作。

## What Changes

- **拆分数量可自定义**：用户可以在拆分表单中添加或移除部位，不再锁定为 3 个
- **基于难度的默认数量**：simple/medium 默认 2 份，hard 默认 3 份，epic 默认 4 份，legendary 默认 5 份
- **前 3 个部位复用物种 bodyParts**：保留现有的物种特定图标/标签/提示作为前 3 个部位的默认值，额外部位使用通用占位
- **拆分范围约束**：最少 2 份，最多不超过 `total_hp` 份（每份至少 1 番茄）

## Capabilities

### New Capabilities

_无新增独立能力_

### Modified Capabilities

- `monster-splitting`: 拆分数量从固定 3 份变为用户可自定义（2 ~ total_hp 份），增加基于难度的默认数量逻辑

## Impact

- **前端**：`MonsterSplitForm.tsx` — 重构为动态部位列表，增加添加/移除按钮
- **数据模型**：`bestiary.ts` 中 `bodyParts` 仍为 3 个（作为默认建议），不需要修改数据库 schema（`body_part` 字段已是自由字符串）
- **Store**：`taskStore.ts` 的 `splitTask` 无需修改（已支持任意长度的 parts 数组）
