## Context

怪物图鉴组件（BestiaryCollection、SpeciesDetail）通过 `species.spriteData` 访问贴图，但 `BESTIARY` 数组中的 `MonsterSpecies` 对象从未填充 `spriteData` 字段。像素贴图数据存储在 `src/lib/spriteData.ts` 的 `SPRITE_DATA` 映射和 `getSpriteData()` 函数中，两者未连接。

其他使用贴图的组件（PrepPhase、FocusPhase、MonsterDiscoveryCard）通过 `SPRITE_DATA[speciesId]` 或 `getSpriteData()` 正确查找贴图，只有图鉴组件错误地依赖了 species 对象上的可选字段。

## Goals / Non-Goals

**Goals:**
- 图鉴中所有有 32x32 像素贴图的怪物正确显示动画贴图
- 无贴图的怪物仍正确回退到 emoji

**Non-Goals:**
- 不修改 BESTIARY 数据结构或添加新贴图
- 不重构 SPRITE_DATA 映射或 PixelSprite 组件

## Decisions

### 方案：在组件中使用 getSpriteData() 查找

在 BestiaryCollection 和 SpeciesDetail 中 import `getSpriteData`，通过 `getSpriteData(species.id)` 查找贴图数据，替代读取 `species.spriteData`。

**理由：** 这与其他组件（PrepPhase、FocusPhase）的用法一致，改动最小（2个文件各改几行），不需要修改数据模型。

**替代方案：** 在 BESTIARY 定义中填充 spriteData 字段——改动更大且引入数据冗余，不推荐。

## Risks / Trade-offs

- [风险] getSpriteData 返回 undefined 时需正确回退 → 现有 fallback 到 emoji 的逻辑已覆盖
- [风险] 返回类型可能是 LegacySpriteData（16x16）→ PixelSprite 组件已支持两种格式
