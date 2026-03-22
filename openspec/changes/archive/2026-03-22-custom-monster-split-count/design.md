## Context

当前 `MonsterSplitForm` 从 bestiary 获取物种的 `bodyParts`（固定 3 个），直接作为拆分部位列表渲染。`splitTask` store 函数接受任意长度的 parts 数组写入数据库，后端无额外约束。因此改动范围仅限前端表单逻辑。

## Goals / Non-Goals

**Goals:**
- 用户可在拆分表单中自由增减部位数量（2 ~ total_hp）
- 根据难度提供合理的默认拆分数量
- 前 3 个部位复用物种 bodyParts 的图标/标签/提示，额外部位使用通用样式

**Non-Goals:**
- 不修改 bestiary 数据结构（bodyParts 仍为 3 个）
- 不修改数据库 schema 或后端逻辑
- 不改变已拆分任务的显示方式（hunt list 中的部位展示暂不调整）

## Decisions

### 1. 默认拆分数量映射

| 难度 | 默认份数 |
|------|---------|
| simple | 2 |
| medium | 2 |
| hard | 3 |
| epic | 4 |
| legendary | 5 |

**理由**：simple/medium 任务通常 1-3 番茄，拆太多无意义；epic/legendary 通常 5-8+ 番茄，需要更细粒度分解。但默认值不超过 total_hp。

### 2. 额外部位的标识

前 3 个部位使用 `species.bodyParts[0..2]` 的 key/icon/label/hint。第 4+ 个部位使用通用标识：
- key: `extra-1`, `extra-2`, ...
- icon: 按序使用 `⚔️🛡️🗡️🏹🔮` 等通用图标
- label: "部位 4", "部位 5", ...
- hint: "额外分解"

**理由**：保持与现有物种系统的兼容性，无需扩展 bestiary 数据。

### 3. UI 交互

- 表单底部增加「+ 添加部位」和「- 移除末尾部位」按钮
- 添加按钮：份数 < total_hp 时可用，新增部位默认 1 番茄
- 移除按钮：份数 > 2 时可用，移除最后一个部位，其番茄数归还给倒数第二个部位
- 番茄数重新分配提示保持现有逻辑（总和必须等于 total_hp）

### 4. 初始番茄分配

使用均匀分配策略：`Math.floor(total_hp / partCount)` 给每个部位，余数加到第一个部位。

**理由**：比当前的 "中间部位吃大头" 更直觉，用户可以自行调整。

## Risks / Trade-offs

- **[视觉一致性]** 额外部位没有物种特定的图标/提示，体验略逊 → 可接受，未来可扩展 bestiary 支持更多部位
- **[hunt list 显示]** 拆成 4-5 份后，hunt list 中的部位指示器可能需要调整 → 标记为 non-goal，后续单独处理
