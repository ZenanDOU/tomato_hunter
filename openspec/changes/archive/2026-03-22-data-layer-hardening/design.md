## Context

Tomato Hunter 是一个 Tauri 2 桌面应用，使用三层数据架构：
- **Rust 后端**: `Arc<Mutex<TimerEngine>>` 管理计时器状态，通过 Tauri commands 暴露给前端
- **SQLite 数据库**: 通过 `@tauri-apps/plugin-sql` 直接从前端访问，无 Rust 中间层
- **Zustand Stores**: 7 个前端 Store 各自独立管理状态，通过 `getDb()` 直接操作 SQLite

当前问题：
1. 多步数据库操作（releaseTask, batchReleaseTasks, craftEquipment, killTask）无事务保护，中途失败导致数据不一致
2. planStore 通过 SQL JOIN 缓存了 task 字段（status, current_hp 等），与 taskStore 经常不同步
3. 狩猎完成流程触发 5-7 次全量数据库查询，无原子性保证
4. craftEquipment 使用 check-then-execute 模式，存在竞态双花风险
5. farmStore 的浇水状态纯内存存储，重启丢失

## Goals / Non-Goals

**Goals:**
- 为前端 `db.ts` 添加事务封装，关键多步操作保证原子性
- 消除 planStore 中冗余的 task 数据缓存，改为引用 taskStore
- 建立 Store 间同步协议，减少手动 fetchX() 散落在各组件中
- 修复 craftEquipment 双花竞态、daggerChoose 缺少 isProcessing 保护
- 持久化 farmStore 浇水状态
- 减少狩猎完成流程的冗余查询

**Non-Goals:**
- 不将数据库操作下沉到 Rust 端（当前架构 SQL 在前端执行，改变这一模式超出范围）
- 不引入 ORM 或查询构建器
- 不改变 Tauri commands 的 API 接口
- 不做分页或虚拟滚动优化（任务量暂未达到性能瓶颈）
- 不重构 Timer tick loop 的三段锁模式（当前实际运行稳定）

## Decisions

### D1: 事务层封装方案

**选择**: 在 `db.ts` 中封装 `withTransaction()` 高阶函数

**方案对比**:
| 方案 | 优点 | 缺点 |
|------|------|------|
| A. db.ts 封装 withTransaction() | 最小改动，复用现有 Database 实例 | 依赖 plugin-sql 的 execute("BEGIN") 支持 |
| B. 每个 Store 自己管理事务 | 无需公共抽象 | 重复代码，容易遗漏 |
| C. 下沉到 Rust 端 | 更安全的事务控制 | 改动量大，需要为每个操作写 Rust command |

**选择 A 的理由**: `@tauri-apps/plugin-sql` 的 `Database.execute()` 支持执行原始 SQL 包括 `BEGIN`/`COMMIT`/`ROLLBACK`。封装为一个通用函数，所有 Store 都可以使用，改动量最小。

**API 设计**:
```typescript
async function withTransaction<T>(
  fn: (db: Database) => Promise<T>
): Promise<T> {
  const db = await getDb();
  await db.execute("BEGIN");
  try {
    const result = await fn(db);
    await db.execute("COMMIT");
    return result;
  } catch (error) {
    await db.execute("ROLLBACK");
    throw error;
  }
}
```

### D2: planStore 数据派生策略

**选择**: planStore 只存储 entry 元数据（id, task_id, planned_pomodoros, completed_pomodoros, sort_order），task 字段在 getter 中从 taskStore 实时派生

**方案对比**:
| 方案 | 优点 | 缺点 |
|------|------|------|
| A. Getter 派生 | 零缓存不一致，最小改动 | 每次访问需要 lookup，微量性能开销 |
| B. 订阅 taskStore 变化自动刷新 | 自动同步 | 引入 Store 间订阅依赖，复杂度增加 |
| C. 保持 JOIN 但增加同步点 | 最小改动 | 治标不治本，同步点容易遗漏 |

**选择 A 的理由**: 通过 `useMemo` 或 getter 在消费层合并 planStore.entries + taskStore.tasks，彻底消除数据复制。entries 数量通常 < 20，lookup 性能可忽略。planStore.fetchTodayPlan() 的 SQL 不再 JOIN tasks 表。

### D3: Store 同步协议

**选择**: 创建 `storeSync.ts` 模块，导出按场景分类的同步函数

**设计**: 不引入全局事件总线，而是将狩猎完成、任务释放等关键流程的跨 Store 刷新收敛为单一函数：

```
syncAfterHuntComplete()   → taskStore.fetchTasks() + planStore.fetchTodayPlan() + inventoryStore.fetchAll()
syncAfterTaskRelease()    → taskStore.fetchTasks() + planStore.fetchTodayPlan()
syncAfterCraft()          → inventoryStore.fetchAll()
```

调用方只需调用一个 sync 函数，不再自己散落调用多个 fetch。

### D4: craftEquipment 原子化

**选择**: 用 SQL `UPDATE ... WHERE quantity >= needed` 替代 check-then-execute

将检查和扣减合并为一条 SQL，利用 SQLite 的行级锁保证原子性：
```sql
UPDATE player_materials
SET quantity = quantity - $1
WHERE material_id = $2 AND quantity >= $1
```
通过检查 `changes()` 判断是否成功扣减。多材料扣减包裹在事务中。

### D5: farmStore 浇水状态持久化

**选择**: 在 `tomato_farm` 表增加 `is_watered` 和 `watering_cooldown_end` 列

新增 migration，将两个字段从内存移到数据库。`water()` 和 `consumeWatering()` 改为 `db.execute()` 更新。

## Risks / Trade-offs

**[Risk] withTransaction 嵌套调用** → 当前设计不支持嵌套事务。SQLite 不支持 SAVEPOINT 通过 execute("BEGIN") 嵌套。Mitigation: 文档约定事务函数不得嵌套调用，lint 规则检查。

**[Risk] planStore 派生方案要求 taskStore 先加载** → 如果 planStore getter 被调用时 taskStore.tasks 为空，返回不完整数据。Mitigation: App 初始化时确保 fetchTasks 在 fetchTodayPlan 之前完成。

**[Risk] Store sync 函数可能被遗漏** → 新功能开发者可能忘记调用 sync 函数。Mitigation: 在 sync 模块中为每个场景写清楚何时调用，code review 检查。

**[Trade-off] 全量刷新 vs 增量更新** → 当前保留全量刷新模式（fetchTasks 等），不做增量更新。全量刷新在当前数据量下性能可接受（< 200 tasks），增量更新的复杂度不值得。

**[Trade-off] 浇水状态持久化增加 DB 写入** → 每次浇水/消耗浇水多一次 DB write。Mitigation: 浇水操作频率极低（30 分钟冷却），影响可忽略。
