## Why

击杀怪物首次收入图鉴时，`SpeciesDiscoveryCard` 组件显示的是 emoji 文字而非项目绘制的像素素材图。原因是该组件直接读取 `species.spriteData` 属性（该属性在 bestiary 数据中始终为 undefined），而其他所有组件都正确使用了 `getSpriteData(species.id)` 函数来获取素材。

## What Changes

- 修复 `SpeciesDiscoveryCard` 组件，使用 `getSpriteData()` 函数获取怪物素材图，替代直接访问 `species.spriteData` 属性
- 统一怪物图片渲染方式，与 `BestiaryCollection`、`SpeciesDetail`、`MonsterDiscoveryCard` 等组件保持一致

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `monster-bestiary`: 修复图鉴发现卡片的怪物图片渲染，使用正确的素材获取方式

## Impact

- 受影响文件：`src/components/common/SpeciesDiscoveryCard.tsx`
- 无 API 或依赖变更
- 无破坏性变更
