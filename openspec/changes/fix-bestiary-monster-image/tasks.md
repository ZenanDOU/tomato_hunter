## 1. 修复 SpeciesDiscoveryCard 素材渲染

- [x] 1.1 在 `src/components/common/SpeciesDiscoveryCard.tsx` 中导入 `getSpriteData` 函数
- [x] 1.2 将 `species.spriteData` 检查替换为 `getSpriteData(species.id)` 调用，传入获取的素材数据给 `PixelSprite` 组件

## 2. 验证

- [x] 2.1 构建项目确认无编译错误
- [x] 2.2 手动验证：击杀新怪物时发现卡片显示像素素材图而非 emoji
