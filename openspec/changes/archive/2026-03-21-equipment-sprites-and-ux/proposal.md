## Why

工坊中的武器和护甲缺少视觉呈现——怪物都有 32x32 像素贴图，但装备只有文字名称。同时装备描述信息量过大（如手剑的描述包含完整计时规则"2分钟策略+20分钟专注+3分钟复盘=25分钟..."），在卡片视图中难以快速理解。需要：添加装备贴图，精简卡片文案，支持点击展开查看详细规则。

## What Changes

- **装备贴图**：为 6 件装备（手剑、匕首、重锤、棉甲、皮甲、重甲）各设计一个 32x32 像素贴图，加入 spriteData 系统
- **卡片文案精简**：装备卡片默认只显示名称 + 核心效果（如"25 分钟节奏"），隐藏详细规则
- **点击展开**：点击装备卡片展开详细说明面板，包含完整规则、素材需求、效果描述
- **消耗品同步优化**：消耗品也精简为名称+价格，效果描述移入展开面板

## Capabilities

### New Capabilities

_无新增能力模块。_

### Modified Capabilities

- `growth-equipment`: 装备展示要求——卡片精简视图 + 展开详情

## Impact

- `src/lib/equipmentSprites.ts` — 新建，6 件装备的 32x32 贴图数据
- `src/components/village/Workshop.tsx` — 重写 EquipmentSection，添加贴图渲染 + 折叠/展开
- `src/components/common/PixelSprite.tsx` — 可能需要支持静态（无动画）渲染模式
