## 1. 统一合成内核 (SynthEngine)

- [x] 1.1 创建 `src/lib/audio/engine/` 目录结构和 index.ts 统一导出
- [x] 1.2 实现 AudioContext 单例管理（延迟初始化 + 首次交互触发）
- [x] 1.3 实现四种波形生成器（square, triangle, pulse with duty cycle, noise buffer）
- [x] 1.4 实现 ADSR 包络控制（GainNode 参数自动化）
- [x] 1.5 实现效果链（ConvolverNode 混响 + 延迟，dry/wet 混合）
- [x] 1.6 实现 AudioContext 生命周期管理（窗口 blur/focus 挂起恢复 + soundEnabled 联动）

## 2. 参数化音效系统 (SFX)

- [x] 2.1 定义 SFX preset JSON schema（TypeScript 类型 + 示例）
- [x] 2.2 实现 SfxManager（preset 加载、事件注册、触发播放）
- [x] 2.3 实现 SFX 复音限制（最多 4 声道，oldest-steal 策略）
- [x] 2.4 创建 hunt 类音效 preset（attack-hit, attack-miss, monster-down, monster-part-break, loot-drop）
- [x] 2.5 创建 timer 类音效 preset（phase-start, phase-end, countdown-warning, focus-complete, break-start）
- [x] 2.6 创建 ui 类音效 preset（button-click, menu-open, menu-close, notification, error）
- [x] 2.7 在游戏事件触发点接入 SFX 调用（hunt 组件、timer store、UI 组件）

## 3. MML 配乐系统 (BGM)

- [x] 3.1 编写 MML 方言规范文档（所有 token 定义 + 语法规则）
- [x] 3.2 实现 MmlParser（tokenizer + AST → Note 序列转换）
- [x] 3.3 实现 MmlPlayer 4 声道序列播放器（调度器 + 通道分配 + 节拍同步）
- [x] 3.4 实现 track 循环无缝衔接和跨 track crossfade
- [x] 3.5 实现播放控制 API（play, stop, pause, resume, setVolume, crossfadeTo）
- [x] 3.6 创建 village.mml 村庄主题曲
- [x] 3.7 创建 5 个 habitat-*.mml 栖息地战斗曲
- [x] 3.8 创建 rest.mml 休息阶段配乐
- [x] 3.9 在场景切换点接入 BGM 控制（村庄 → 栖息地 → 专注 → 休息）

## 4. 栖息地风格映射

- [x] 4.1 创建 `src/lib/audio/config/habitatProfiles.ts` 定义 5 个栖息地音频 profile
- [x] 4.2 实现 profile 驱动 BGM 参数（进入栖息地时自动配置 reverb、tempo）
- [x] 4.3 实现 profile 驱动 SFX 变体（hunt SFX 根据当前栖息地调整音色）
- [x] 4.4 实现 profile 文本导出功能（用于 Claude prompt 嵌入）

## 5. Claude 音频生成管线

- [x] 5.1 编写 BGM 生成 prompt 模板（含 MML 方言规范 + 风格约束 + few-shot 示例）
- [x] 5.2 编写 SFX 生成 prompt 模板（含 JSON schema + 事件类别 + few-shot 示例）
- [x] 5.3 实现生成结果验证器（MML 语法检查 + SFX JSON schema 校验）
- [x] 5.4 创建生成工作流脚本（npm script，读取 profile → 渲染 prompt → 输出到 stdout）

## 6. 设置 UI 与集成

- [x] 6.1 实现 PixelVolumeSlider 组件（像素风音量滑块，0-100）
- [x] 6.2 实现音频开关切换按钮（连接已有 soundEnabled 设置，🔊/🔇 状态显示）
- [x] 6.3 扩展 useSettingsStore 支持 volume 字段（数据库持久化）
- [x] 6.4 创建 AudioManager 门面类统一管理 SFX + BGM 初始化和全局控制
- [x] 6.5 在 App.tsx 和 HuntApp.tsx 入口处挂载 AudioManager
- [x] 6.6 验证 Tauri CSP 配置允许 Web Audio API 正常工作（blob:/data: URL）
