## 1. 修复 splitTask SQL

- [x] 1.1 从 `taskStore.splitTask` 的 INSERT 语句中移除 `species_id` 列和对应参数

## 2. MonsterSplitForm 错误处理

- [x] 2.1 在 `handleSubmit` 中添加 try-catch-finally，finally 重置 submitting，catch 设置 error state 并显示错误提示
