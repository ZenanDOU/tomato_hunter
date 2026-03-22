## ADDED Requirements

### Requirement: 加入讨伐清单按钮的错误处理
MonsterDiscoveryCard 的"加入讨伐清单"按钮 SHALL 在 identifyTask 调用失败时显示错误信息，而非静默失败。

#### Scenario: identifyTask 成功
- **WHEN** 用户点击"加入讨伐清单"按钮且 identifyTask 执行成功
- **THEN** 任务状态更新为 ready，MonsterDiscoveryCard 关闭，任务出现在讨伐清单中

#### Scenario: identifyTask 失败
- **WHEN** 用户点击"加入讨伐清单"按钮且 identifyTask 抛出异常
- **THEN** 显示错误提示信息，MonsterDiscoveryCard 保持打开，用户可重试

### Requirement: 按钮 loading 状态
点击"加入讨伐清单"后 SHALL 显示 loading 状态，防止重复点击。

#### Scenario: 操作进行中
- **WHEN** 用户点击"加入讨伐清单"且操作尚未完成
- **THEN** 按钮显示为 loading 状态且不可再次点击

### Requirement: MonsterDiscoveryCard overlay 可靠渲染
MonsterDiscoveryCard SHALL 通过 createPortal 渲染到 document.body，确保不受祖先元素 CSS containment 影响。

#### Scenario: 在任何页面位置打开发现卡
- **WHEN** 用户在狩猎看板或收件箱中点击"侦查敌情"触发怪物发现
- **THEN** MonsterDiscoveryCard 的 overlay 覆盖整个视口，按钮可正常点击
