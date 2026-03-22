## Context

`SpeciesDiscoveryCard` 组件在怪物首次被击杀收入图鉴时弹出，展示新发现的怪物。当前代码直接检查 `species.spriteData` 属性来决定是否渲染 `PixelSprite`，但 `bestiary.ts` 中的 `MonsterSpecies` 数据从未填充该属性，导致始终走 emoji 回退路径。

项目中所有其他显示怪物的组件（`BestiaryCollection`、`SpeciesDetail`、`MonsterDiscoveryCard`、`FocusPhase`、`HuntBoard` 等）都使用 `getSpriteData(species.id)` 从 `spriteData.ts` / `spriteData32.ts` 获取素材数据。

## Goals / Non-Goals

**Goals:**
- 修复 `SpeciesDiscoveryCard` 使用正确的素材获取方式
- 与现有组件保持一致的渲染模式

**Non-Goals:**
- 不修改 `MonsterSpecies` 类型定义或数据结构
- 不新增怪物素材
- 不重构其他组件

## Decisions

**使用 `getSpriteData()` 替代 `species.spriteData`**

理由：这是项目中所有其他组件使用的标准方式。`getSpriteData()` 会优先返回 32x32 动画素材，回退到 16x16 legacy 素材，最终返回 undefined（此时才显示 emoji）。无需引入新模式。

## Risks / Trade-offs

无显著风险。这是一个单文件的简单属性访问修复，完全遵循现有代码模式。
