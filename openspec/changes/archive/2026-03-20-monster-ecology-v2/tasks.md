## 1. 怪物生态系统数据

- [x] 1.1 重写 bestiary.ts：扩展 MonsterSpecies 接口（增加 family, habitat, tier, traits, bodyParts, visualDesc, spriteData 字段）
- [x] 1.2 定义 5 个栖息地 × 3 食物链物种 = 15 个种族的完整数据（名称、emoji、栖息地生态描述、种族特性、专属部位+拆分提示、描述模板、视觉特征描述）
- [x] 1.3 更新 selectSpecies：按 category + difficulty 匹配种族时，simple/medium 选小型猎物，hard/epic 选中型捕食者，legendary 选顶级掠食者
- [x] 1.4 更新 generateRelevantName：名称格式改为"任务关键词·种族名"（如"报告·锻炉蟒"）

## 2. 像素画生成管线

- [x] 2.1 创建 PixelSprite 组件：接收 SpriteData（width, height, pixels, palette），用 Canvas 逐像素绘制，支持 ×2/×3/×4 缩放（nearest neighbor）
- [x] 2.2 定义 SpriteData 格式：像素矩阵用字符串压缩（每个字符对应调色板索引），调色板为颜色数组
- [x] 2.3 为 5 个代表性种族手绘 16×16 像素画数据（每栖息地 1 个：齿轮虫、灵感蛾、论文狼、藤蔓蛙、虚空鸦）
- [x] 2.4 其余 10 个种族用简化版像素画或 emoji fallback
- [x] 2.5 替换 .monster-sprite emoji 显示为 PixelSprite 组件（MonsterDiscoveryCard, HuntList, PrepPhase）

## 3. 种族特性替代随机标签

- [x] 3.1 重写 monsterAttributes.ts：generateAttributes 改为返回种族的固定 traits（从 bestiary 读取），不再从随机池选取
- [x] 3.2 更新 AttributeTag 组件：显示格式改为"icon 能力·效果"
- [x] 3.3 更新 Inbox handleIdentify：生成怪物时将种族 traits 序列化到 monster_variant
- [x] 3.4 保持 parseMonsterVariant 向后兼容旧格式

## 4. 种族专属部位拆分

- [x] 4.1 更新 MonsterSplitForm：从种族数据动态读取 bodyParts（而非硬编码 head/body/feet）
- [x] 4.2 每个部位显示种族定义的 icon、label、hint（任务映射提示）
- [x] 4.3 body_part 字段存储种族专属 key（如 "snake_head" 而非 "head"）
- [x] 4.4 HuntList 的 BodyPartItem 图标映射改为动态读取种族数据

## 5. 讨伐清单详情面板

- [x] 5.1 HuntItem 改为可展开 accordion：点击卡片展开/收起详情
- [x] 5.2 详情区域显示：任务描述、怪物故事、栖息地+食物链位置、种族特性
- [x] 5.3 如果可拆分（>4HP 且未拆分），详情中显示部位结构预览 + 拆分按钮
- [x] 5.4 出击按钮移到详情面板中
- [x] 5.5 SplitMonsterCard 也支持点击展开查看父怪物详情

## 6. MonsterDiscoveryCard + Rust 更新

- [x] 6.1 发现卡片增加栖息地名、食物链位置标签（小型猎物/中型捕食者/顶级掠食者）
- [x] 6.2 特性显示改为种族固定特性（带 icon + 能力·效果格式）
- [x] 6.3 发现卡片用 PixelSprite 替代 emoji
- [x] 6.4 更新 Rust monster_gen.rs 离线生成：适配新的 15 种族体系（栖息地名称池 + 食物链层级）

## 7. 验证

- [x] 7.1 TypeScript 编译通过
- [x] 7.2 侦查流程验证：不同分类×难度的任务匹配正确的种族和食物链层级
- [x] 7.3 像素画验证：5 个代表种族显示 Canvas 像素画，其余显示 emoji fallback
- [x] 7.4 拆分验证：不同种族显示不同的专属部位+提示
- [x] 7.5 详情面板验证：讨伐清单点击展开/收起正常
- [x] 7.6 旧数据兼容：已有任务的旧属性格式仍能正常显示
