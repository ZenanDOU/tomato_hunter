## 1. 默认拆分数量逻辑

- [x] 1.1 在 `MonsterSplitForm.tsx` 中添加 `getDefaultPartCount(difficulty, totalHp)` 函数，根据难度返回默认份数（simple/medium=2, hard=3, epic=4, legendary=5），并确保不超过 total_hp
- [x] 1.2 添加通用部位生成函数 `getGenericPart(index)` 返回 extra 部位的 key/icon/label/hint

## 2. 动态部位列表

- [x] 2.1 重构 `parts` state 初始化：使用 `getDefaultPartCount` 决定初始数量，前 3 个部位取 species.bodyParts，超出部分用 getGenericPart
- [x] 2.2 实现均匀番茄分配函数 `distributePomodoros(totalHp, partCount)`：floor 分配 + 余数从第一个部位开始补

## 3. 添加/移除部位 UI

- [x] 3.1 添加「+ 添加部位」按钮，点击时追加通用部位并重新分配番茄，份数达到 total_hp 时禁用
- [x] 3.2 添加「- 移除部位」按钮，点击时移除末尾部位并重新分配番茄，份数为 2 时禁用
- [x] 3.3 更新表单提示文案，将固定 "三个部位" 改为动态数量描述

## 4. 验证与测试

- [x] 4.1 验证各难度默认拆分数量正确（手动测试 simple/hard/epic/legendary）
- [x] 4.2 验证边界情况：total_hp=2 时最多拆 2 份、添加/移除后番茄总和始终等于 total_hp
