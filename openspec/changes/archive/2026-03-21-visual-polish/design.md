## Context

详细设计已在 `docs/superpowers/specs/2026-03-21-visual-polish-design.md` 中完成并通过两轮 review。本文档引用该 spec 的关键决策。

当前视觉状态：16x16 程序化 sprite（5/15 有数据）、纯色背景、无动画、部分组件使用 Tailwind 默认色。音频系统和工坊/农场系统已完成，视觉是最后的短板。

## Goals / Non-Goals

**Goals:**
- 15 个物种全部拥有 32x32 多帧 sprite
- 每个场景有程序化像素背景
- 所有交互有像素风动画反馈
- 全局视觉一致性（颜色/间距/边框/字体/focus）
- 修复生态设定中的命名不一致和 apex 重复

**Non-Goals:**
- 不引入外部动画库或图片资产
- 不改变游戏玩法机制
- 不做响应式/移动端适配
- 不做 sprite 编辑器 UI

## Decisions

### D1: 逐层递进实现路径
Sprite 升级 → 背景生成 → 动画系统 → 一致性审计。每层在前一层基础上构建，可中途验证效果。

### D2: 共享 rAF 动画循环
一个 requestAnimationFrame 循环管理所有动画子系统（sprite 4fps、粒子 8fps），避免多个独立 rAF 的开销。实现在 `src/lib/animation/animationLoop.ts`。

### D3: 程序化 sprite 生产管线
Claude 辅助生成 32x32 基础帧 → 机械派生 hit/defeat 帧。Hit = idle[0] 白色 overlay。Defeat = idle[0] 下移 + 底部溶解。每物种只需 1 个手工基础帧。

### D4: 像素动画约束
- 整数像素位移（无亚像素渲染）
- `steps(N)` 或 `linear` 缓动（无 ease/cubic-bezier）
- Scale 例外：使用 `steps(N)` 离散缩放
- 所有动画 ≤ 300ms
- 场景切换用闪白过渡

### D5: 颜色治理
三层调色板体系：核心 UI (10色) + 扩展主题 (3色) + 功能灰 (5色)。栖息地背景色独立于 UI 调色板。移除所有 Tailwind 默认数字色阶。

### D6: SpriteData 类型统一
将 SpriteData 类型定义移到 `src/types/index.ts`，消除 PixelSprite.tsx 和 bestiary.ts 的重复定义。保留 LegacySpriteData 兼容旧数据。

## Risks / Trade-offs

**[32x32 sprite 数据量大]** → 15 物种 × 5 帧 = 75 帧的 32x32 数据。通过 Claude 辅助生成 + 机械派生减轻工作量。Emoji fallback 保证渐进迁移不阻塞。

**[Canvas 背景性能]** → 首次生成 < 50ms，缓存后零开销。粒子 8fps 上限。Focus 阶段计时精度优先级高于视觉效果。

**[闪白过渡与窗口 resize 竞争]** → 闪白在 resize promise 完成后触发，避免视觉撕裂。
