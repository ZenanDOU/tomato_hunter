## 1. 装备贴图数据

- [x] 1.1 创建 src/lib/equipmentSprites.ts — 定义 6 件装备的 32x32 像素贴图数据（手剑、匕首、重锤、棉甲、皮甲、重甲），使用 SpriteData32 格式
- [x] 1.2 创建 EQUIPMENT_SHORT_DESC 常量映射（equipment ID → 一句话核心效果描述）

## 2. Workshop UI 重构

- [x] 2.1 重写 EquipmentSection 组件 — 每个装备卡片支持折叠/展开，折叠态显示贴图+名称+短描述+状态
- [x] 2.2 展开态显示完整描述 + 素材需求 + 操作按钮（装备/制作）
- [x] 2.3 消耗品区域也改为折叠/展开模式 — 折叠态：名称+价格+数量，展开态：效果描述+购买按钮
- [x] 2.4 添加 ARIA 属性（aria-expanded、role="button"）和键盘可访问性
