## Why

道具和装备系统存在三个关键问题：(1) 装备解锁机制从未实现——spec 定义了"获得稀有素材时解锁配方"的规则，但代码中缺失，导致匕首、重锤、皮甲、重甲永远无法制作；(2) 三个消耗品（休息延伸、策略跳过、复盘跳过）可以购买但没有 UI 触发入口；(3) 武器锻造成功/失败没有任何视觉或音效反馈。

## What Changes

- **实现稀有素材解锁配方机制**：当玩家首次获得某种稀有素材时，自动解锁需要该素材的装备配方，并显示"新配方发现！"通知
- **补齐 3 个消耗品的使用入口**：
  - 休息延伸(ID 9)：在 RestScreen 休息阶段显示使用按钮
  - 策略跳过(ID 11)：在 PrepPhase 显示跳过按钮
  - 复盘跳过(ID 12)：在 ReviewPhase 显示跳过按钮
- **添加锻造反馈**：制作成功时播放音效 + 显示视觉反馈，材料不足时提示具体缺少什么

## Capabilities

### New Capabilities

_无新增能力_

### Modified Capabilities

- `growth-equipment`: 实现已定义但未实现的"稀有素材解锁配方"规则；添加锻造反馈
- `pomodoro-timer`: 补齐消耗品（休息延伸、策略跳过、复盘跳过）在各阶段的使用入口

## Impact

- `src/lib/loot.ts` — 掉落时检测首次稀有素材并触发解锁
- `src/stores/inventoryStore.ts` — 新增 `unlockEquipment` 方法
- `src/components/settlement/RestScreen.tsx` — 添加休息延伸按钮
- `src/components/hunt/PrepPhase.tsx` — 添加策略跳过按钮
- `src/components/hunt/ReviewPhase.tsx` — 添加复盘跳过按钮
- `src/components/village/Workshop.tsx` — 添加锻造成功/失败反馈
- `src-tauri/migrations/` — 可能无需新迁移（解锁通过 UPDATE equipment SET unlocked=1）
