## 1. 修复图鉴贴图查找

- [x] 1.1 在 BestiaryCollection.tsx 的 SpeciesThumb 中使用 `getSpriteData(species.id)` 替代 `species.spriteData`
- [x] 1.2 在 SpeciesDetail.tsx 中使用 `getSpriteData(species.id)` 替代 `species.spriteData`

## 2. 验证

- [x] 2.1 确认图鉴中有贴图的怪物正确显示像素动画，无贴图的怪物回退到 emoji
