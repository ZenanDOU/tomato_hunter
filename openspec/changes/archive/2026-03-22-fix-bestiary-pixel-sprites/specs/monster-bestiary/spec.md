## MODIFIED Requirements

### Requirement: 怪物图鉴显示怪物贴图
图鉴中已发现的怪物 SHALL 使用集中式贴图数据源（`getSpriteData(speciesId)`）查找像素贴图，而非依赖 `MonsterSpecies.spriteData` 属性。当贴图数据存在时 MUST 使用 PixelSprite 组件渲染动画贴图；当不存在时 MUST 回退到 emoji 显示。

此要求适用于图鉴缩略图（BestiaryCollection）和物种详情（SpeciesDetail）两处。

#### Scenario: 有 32x32 像素贴图的怪物在图鉴缩略图中显示
- **WHEN** 已发现的怪物在 SPRITE_DATA 中有对应的 32x32 贴图数据
- **THEN** 图鉴缩略图使用 PixelSprite 组件以 idle 动画、scale=2 渲染该贴图

#### Scenario: 有像素贴图的怪物在详情面板中显示
- **WHEN** 已发现的怪物在 SPRITE_DATA 中有对应贴图数据，用户展开详情
- **THEN** 详情面板使用 PixelSprite 组件以 idle 动画、scale=3 渲染该贴图

#### Scenario: 无像素贴图的怪物在图鉴中显示
- **WHEN** 已发现的怪物在 SPRITE_DATA 中没有对应贴图数据
- **THEN** 图鉴缩略图和详情面板均回退到 emoji 显示
