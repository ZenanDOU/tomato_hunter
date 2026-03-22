## MODIFIED Requirements

### Requirement: Species discovery card displays monster sprite
当新怪物物种被发现时，`SpeciesDiscoveryCard` 组件 SHALL 使用 `getSpriteData(species.id)` 获取怪物素材数据并通过 `PixelSprite` 组件渲染。仅当 `getSpriteData()` 返回 undefined 时才回退到 emoji 显示。

#### Scenario: Monster with sprite data is discovered
- **WHEN** 玩家首次击杀某物种的怪物，且该物种存在像素素材（`getSpriteData(species.id)` 返回非 undefined）
- **THEN** `SpeciesDiscoveryCard` SHALL 使用 `PixelSprite` 组件渲染该怪物的像素素材图

#### Scenario: Monster without sprite data is discovered
- **WHEN** 玩家首次击杀某物种的怪物，且该物种不存在像素素材（`getSpriteData(species.id)` 返回 undefined）
- **THEN** `SpeciesDiscoveryCard` SHALL 显示该物种的 emoji 作为回退
