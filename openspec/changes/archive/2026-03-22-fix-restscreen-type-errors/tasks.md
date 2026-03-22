## 1. 修复 RestScreen 类型错误

- [x] 1.1 在 RestScreen.tsx 中引入 useTaskStore，获取 tasks 列表
- [x] 1.2 修复 nextEntry 筛选逻辑：通过 task_id 关联 task，用 task.status 替代 e.status
- [x] 1.3 修复 nextEntry 显示逻辑：用关联 task 的 monster_name/name 替代直接访问
- [x] 1.4 修复 handleQuickStartNext 中 startHunt 参数：从关联 task 获取 monster_name/name

## 2. 验证

- [x] 2.1 运行 `npm run build` 确认编译通过
- [x] 2.2 运行 `cargo clippy` 确认无新增警告
