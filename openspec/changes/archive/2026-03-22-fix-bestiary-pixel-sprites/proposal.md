## Why

怪物图鉴（BestiaryCollection 和 SpeciesDetail）始终显示 emoji 而非已有的 32x32 像素贴图。原因是组件通过 `species.spriteData` 访问贴图数据，但 `BESTIARY` 中的 `MonsterSpecies` 对象从未填充该字段——像素贴图数据存储在独立的 `SPRITE_DATA` 映射中，两者没有连接。

## What Changes

- 在怪物图鉴的缩略图和详情组件中，改用 `getSpriteData(species.id)` 查找像素贴图，而非依赖 `species.spriteData` 属性
- 确保图鉴中所有已有 32x32 像素贴图的怪物正确显示动画贴图，无贴图时仍回退到 emoji

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `monster-bestiary`: 图鉴怪物展示需使用集中式贴图数据源（SPRITE_DATA）而非 species 对象上的可选字段

## Impact

- `src/components/profile/BestiaryCollection.tsx` — SpeciesThumb 组件修改贴图查找方式
- `src/components/profile/SpeciesDetail.tsx` — 详情视图修改贴图查找方式
- 可选清理：`MonsterSpecies.spriteData` 字段如果不再被其他地方使用可移除
