# Visual Polish Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Scope:** Sprite upgrade, procedural backgrounds, animation system, visual consistency, ecology fixes

---

## 0. Ecology Fixes

### 0.1 Family Renaming

Replace "虫群" family names with thematic names that match the actual creature types:

| Habitat | Old Family | New Family |
|---------|-----------|------------|
| 齿轮工坊废墟 (work) | 机械虫群 | 锈蚀机械兽 |
| 枯竭画廊 (creative) | 画廊虫群 | 枯彩幻灵 |
| 遗忘图书馆 (study) | 图书馆虫群 | 蛀典书灵 |
| 荒废花园 (life) | 花园生物群 | 荒野蔓生兽 |
| 迷雾沼泽 (other) | 沼泽虫群 | 迷雾幻形体 |

### 0.2 Apex Creature Replacement

Replace three dragon apex creatures with visually distinct species:

| Habitat | Old Apex | New Apex | Emoji | Visual Description |
|---------|----------|----------|-------|--------------------|
| creative | 画境龙 🐲 | 画境凤 | 🔥 | 从废弃画作中燃起的火鸟，身体由褪色颜料和火焰构成 |
| study | 知识龙 🐉 | 封典巨鸮 | 🦉 | 盘踞在禁书区的远古猫头鹰，羽翼由书页和符文构成 |
| other | 混沌龙 🐲 | 深渊水母 | 🪼 | 迷雾深处的半透明巨型水母，身体由漩涡和扭曲的光构成 |

Unchanged apex: 锻炉蟒 🐍 (work), 古树熊 🐻 (life).

Five apex silhouettes: snake, phoenix, owl, bear, jellyfish — all distinct at 32x32.

**Backward compatibility:** Species IDs are never persisted in the database. Monster assignment uses `selectSpecies()` at render time based on `task.category` + `task.name` hash. Renaming species IDs (e.g., `creative-canvas-dragon` → `creative-canvas-phoenix`) is safe — existing tasks will simply map to the new species on next render.

### 0.3 Full Data for New Apex Creatures

**画境凤 (creative apex):**
- id: `creative-canvas-phoenix`
- emoji: 🔥
- traits: `{ icon: "🔥", name: "焚稿", desc: "推倒重来" }`, `{ icon: "🌈", name: "涅槃", desc: "完美主义的无限循环" }`
- bodyParts: `{ key: "crest", icon: "👑", label: "凤冠", hint: "构思设计" }`, `{ key: "wings", icon: "🔥", label: "焰翼", hint: "主体创作" }`, `{ key: "tail", icon: "🪶", label: "尾羽", hint: "精修打磨" }`
- descTemplates: `"这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄"`, `"传说中的{adj}{name}从{task}的废弃画作中涅槃重生，焚稿之火与完美主义的执念吞噬着番茄"`
- visualDesc: "从废弃画作中燃起的火鸟，身体由褪色颜料和火焰构成，尾羽散落着颜料碎片"

**封典巨鸮 (study apex):**
- id: `study-archive-owl`
- emoji: 🦉
- traits: `{ icon: "🦉", name: "凝视", desc: "畏难情绪" }`, `{ icon: "📚", name: "封印", desc: "知识壁垒" }`
- bodyParts: `{ key: "eyes", icon: "🦉", label: "鸮目", hint: "研究框架" }`, `{ key: "wings", icon: "📖", label: "书翼", hint: "深度钻研" }`, `{ key: "talons", icon: "🔒", label: "封爪", hint: "知识凝练" }`
- descTemplates: `"这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄"`, `"传说中的{adj}{name}盘踞在{task}的禁书区，凝视的威压与知识壁垒封印着番茄"`
- visualDesc: "远古巨型猫头鹰守护者，羽翼由书页和知识符文构成，双目散发冷光"

**深渊水母 (other apex):**
- id: `other-abyss-jellyfish`
- emoji: 🪼
- traits: `{ icon: "🪼", name: "缠绕", desc: "完全失控" }`, `{ icon: "🌀", name: "扭曲", desc: "认知偏差" }`
- bodyParts: `{ key: "bell", icon: "🪼", label: "伞盖", hint: "理清方向" }`, `{ key: "core", icon: "🌀", label: "核心", hint: "核心攻坚" }`, `{ key: "tentacles", icon: "🫧", label: "触须", hint: "凝聚成果" }`
- descTemplates: `"这只{adj}{name}栖息在{habitat}，用{trait_desc}困住了{task}中的番茄"`, `"传说中的{adj}{name}是{task}迷雾的源头，缠绕的触须与扭曲的光吞噬着所有番茄"`
- visualDesc: "迷雾深处的半透明巨型水母，伞盖由漩涡构成，触须散发扭曲的光"

---

## 1. Sprite System Upgrade (16x16 → 32x32)

### 1.1 Resolution

Upgrade from 16x16 to 32x32 programmatic pixel sprites. Double the pixel density allows for richer detail: facial features, textures, limb outlines.

### 1.2 Animation Frames

Each sprite expands from 1 static frame to multi-frame animations:

- **idle**: 2 frames, breathing/floating loop (all monsters)
- **hit**: 1 frame, white overlay + micro-displacement (triggered on review submit)
- **defeat**: 2 frames, falling animation (triggered when HP reaches 0)

### 1.3 Palette Upgrade

Each habitat maintains an 8-12 color palette (up from ~4-6), adding shadow and highlight colors for more dimensional forms. Palette indices use numbers (not single-char encoding), so palettes > 10 colors are supported natively.

### 1.4 Data Structure

The canonical `SpriteData` type moves to `src/types/index.ts` (replacing the duplicate definitions in `PixelSprite.tsx` and `bestiary.ts`):

```typescript
// Canonical type in src/types/index.ts
type SpriteFrame = number[][];  // 32x32 grid, each cell is a palette index (0 = transparent)

interface SpriteData {
  palette: string[];        // hex colors, index 0 = transparent
  frames: {
    idle: SpriteFrame[];    // 2 frames
    hit: SpriteFrame[];     // 1 frame
    defeat: SpriteFrame[];  // 2 frames
  };
}

// Legacy compat (removed after full migration)
interface LegacySpriteData {
  width: number;
  height: number;
  pixels: string;           // single-char palette indices (0-9 only)
  palette: string[];
}
```

Both `PixelSprite.tsx` and `bestiary.ts` will import from `src/types/index.ts`.

### 1.5 Sprite Data Production

**Strategy: Procedural generation with Claude assistance.**

Each species' 32x32 frames are authored as TypeScript array literals in `spriteData.ts`. The production pipeline:

1. Claude generates sprite data based on the `visualDesc` field from each species in `bestiary.ts`
2. The existing `generate-audio-prompt.ts` pattern is reused: a prompt template renders species visual descriptions + palette constraints → Claude outputs `number[][]` arrays
3. Each species gets 5 frames (2 idle + 1 hit + 2 defeat). Hit frame = idle[0] with palette swap (white overlay). Defeat frames = idle[0] rotated/shifted.
4. Idle frame 2 is a minor variation of frame 1 (1-2 pixel shifts for breathing effect)

This reduces unique manual work to ~15 base frames (one per species), with the other 4 frames per species being mechanical derivations.

**Defeat frame derivation rules:**
- Defeat frame 1: idle[0] shifted down 2px (rows 0-1 become transparent)
- Defeat frame 2: idle[0] shifted down 4px + rows below row 24 set to transparent (dissolve from bottom)

**Fallback chain**: New 32x32 SpriteData → Legacy 16x16 rendered at 2x → Emoji character (current behavior for species without any sprite data).

### 1.6 PixelSprite Component

- Accept `animation` prop: `"idle" | "hit" | "defeat"`
- Uses shared animation loop (see Section 3.6) at 4fps
- Hit animation: play once then return to idle
- Defeat animation: play once then hold last frame
- Detects `SpriteData` vs `LegacySpriteData` and renders accordingly

### 1.7 Scope

All 15 monster species (including 3 new apex replacements) need 32x32 sprite data. Sprites are produced incrementally — the emoji fallback ensures the game works during the transition.

---

## 2. Procedural Pixel Backgrounds

### 2.1 Implementation

New `PixelBackground` component using offscreen Canvas to generate pixel-art scene tiles. Cached as Canvas element (not ImageBitmap, for maximum WebView2 compat). Background layer at lowest z-index, UI floats above.

### 2.2 Village Background

Sky gradient (light blue → white) + distant mountain silhouettes (3 parallax layers, varying blue-gray) + bottom grass color blocks + randomly scattered small tree/house pixel patterns. Fixed-seed random for consistency across launches.

### 2.3 Habitat Backgrounds (Focus Phase Only)

Habitat backgrounds use extended palette colors beyond the core UI palette. These are scene-specific atmospheric colors that do not appear in UI components.

| Habitat | Base Color | Elements | Particles |
|---------|-----------|----------|-----------|
| 齿轮工坊废墟 | Dark gray #2A2A2A | Gear/pipe outlines | Faint orange sparks |
| 枯竭画廊 | Deep purple #2A1A3A | Picture frame outlines | Falling paint flakes |
| 遗忘图书馆 | Deep blue #1A2A4A | Bookshelf outlines | Floating light motes |
| 荒废花园 | Deep green #1A3A2A | Vine/flower outlines | Slowly falling petals |
| 迷雾沼泽 | Dark teal #1A2A2A | Water surface ripples | Rising mist wisps |

### 2.4 Particle System

Lightweight Canvas particle layer overlaid on static backgrounds. 10-20 particles per habitat, simple linear motion + opacity cycling. Uses shared animation loop (see Section 3.6) at 8fps.

### 2.5 Phase Behavior

- **Prep phase**: Keep current solid color background (high readability needed for strategy input)
- **Focus phase**: Full habitat background displayed. Note: the focus window is a compact overlay (600x176). The background fills this space — no monster sprite is shown during focus (the focus HUD is deliberately minimal for distraction-free work).
- **Review phase**: Keep current cream background (high readability for note input). Monster sprite shown here with hit animation on submit.
- **Rest/break**: Light green base + grass + slow-moving clouds

### 2.6 Rest Background

Enhance existing `#88DDAA` background with pixel grass strip at bottom, 2-3 slow-moving cloud shapes. Same PixelBackground component, different scene config.

---

## 3. Animation & Transition System

### 3.1 Constraints (All Animations)

- No sub-pixel rendering for position transforms: use integer pixel values (`translateX(2px)` not `2.5px`)
- Scale transforms exempt from integer rule but must use `steps()` easing to snap between discrete sizes
- Easing: `steps(N)` or `linear` only. No ease/cubic-bezier. Audit and replace existing `animate-pulse` (uses cubic-bezier) with `steps()` equivalent.
- Max duration: 300ms (pixel games are snappy)
- No external animation libraries

### 3.2 Page Transitions

- **Village tab switch**: New content slides in from below, 100ms, `steps(4)`. Outgoing content unmounts immediately (no cross-fade). The visual effect is the new panel "scanning in" over the background.
- **Hunt phase transitions** (prep→focus→review): White flash is triggered after window resize completes (resize first, then flash to mask the layout change), ~80ms flash duration.
- **Hunt window**: Already a separate Tauri window, no transition needed

### 3.3 Monster Animations

- **Idle**: 2-frame sprite loop at 4fps (in PrepPhase monster display area)
- **Hit** (on review submit): White overlay flash ×3 + horizontal shake ±2px, ~200ms total
- **Defeat** (HP=0): 2-frame defeat animation + downward fade-out

### 3.4 Loot Drop Animation

Settlement screen: loot items appear one by one, 200ms interval between each. Each item enters from below with `translateY(8px) → translateY(0)` + scale via `steps(3)` from 1.2→1.0 (snaps through 1.2→1.1→1.0). Pure CSS `@keyframes`.

### 3.5 Button Feedback

Keep existing active press displacement (1px). Add 1-frame white overlay flash on click (matching sprite hit style for pixel aesthetic cohesion).

### 3.6 Shared Animation Loop

A single `requestAnimationFrame` loop manages all animation subsystems to avoid redundant rAF callbacks:

```typescript
// src/lib/animation/animationLoop.ts
// Single rAF loop with independent frame counters
// - Sprites: tick at 4fps
// - Particles: tick at 8fps
// - Transitions: tick at 60fps (CSS-driven, loop just tracks state)
```

Sprite animations and particle systems register callbacks with this loop rather than creating their own rAF loops.

---

## 4. Visual Consistency Audit

### 4.1 Spacing

Standardize to 4 increments: `p-2`/`p-3`/`p-4`/`p-5` and `gap-2`/`gap-3`/`gap-4`. The `p-5` value is retained for `PixelCard` padding="lg". Remove stray `p-6` and above.

### 4.2 Borders

All cards/buttons/inputs use `outline-2 outline-[#333333] outline-offset-[-2px]`. Audit and replace any `border-*` usage with `outline-*` for consistent weight.

### 4.3 Colors

Audit all hardcoded color values. Approved palette:

**Core UI palette (for all UI components):**
- sky #55BBEE, tomato #EE4433, sunny #FFD93D, grass #5BBF47
- cloud #FFFFFF, pixel-black #333333, orange #FF8844, cream #FFF8E8
- deep-blue #3366AA, pink #FFCCDD

**Extended theme colors (already in index.css, used for specific purposes):**
- light-blue #DDEEFF (village background, list hover)
- mint #88DDAA (rest screen)
- monster-bg #443355 (dark card variant)

**Functional grays (disabled/muted states only):**
- #CCCCCC (disabled fill), #999999 (disabled text/border), #AAAAAA (muted text), #EEEEEE (disabled background), #666666 (secondary text)

**Remove:** ALL Tailwind default color number scales (`stone-*`, `amber-*`, `red-*`, `blue-*`, `purple-*`, `green-*`). Replace with approved palette hex values. Affected files: Journal.tsx, RecoveryDialog.tsx, ProgressBar.tsx, HuntApp.tsx, Inbox.tsx, DailyPlanBoard.tsx, TaskForm.tsx, monsterAttributes.ts. Replace category tag colors with habitat-themed colors from the core palette.

**Habitat background colors** (Section 2.3) are scene-specific and do not need to be in the UI palette.

### 4.4 Font

Verify zpix pixel font inheritance across all elements including popups, inputs, textareas, and dynamically created content.

### 4.5 Focus States

All focusable elements get unified pixel-style focus: `outline-[#FFD93D] outline-2` (sunny yellow highlight frame), replacing browser default blue focus ring.

### 4.6 Approach

Section 4 audit scope: targeted fixes to existing components. No component API changes or layout restructuring within the audit. (Sections 1-3 introduce new props and components as specified in their own sections.)

---

## Architecture Notes

### File Structure (New/Modified)

```
src/types/
  index.ts               — MODIFIED: canonical SpriteData type definition

src/lib/
  spriteData.ts          — MODIFIED: 32x32 frame data, new species
  bestiary.ts            — MODIFIED: family names, apex replacements, traits
  animation/
    animationLoop.ts     — NEW: shared rAF loop for sprites + particles

src/components/common/
  PixelSprite.tsx         — MODIFIED: animation prop, multi-frame rendering, shared loop
  PixelBackground.tsx     — NEW: procedural background generator + particle system
  PixelTransition.tsx     — NEW: page transition wrapper (village tabs)
  PixelButton.tsx         — MODIFIED: click flash effect

src/components/hunt/
  PrepPhase.tsx           — MODIFIED: monster idle animation
  FocusPhase.tsx          — MODIFIED: habitat background
  ReviewPhase.tsx         — MODIFIED: monster hit animation on submit

src/components/settlement/
  Settlement.tsx          — MODIFIED: loot drop animation

src/components/common/
  ProgressBar.tsx         — REMOVE or redirect to PixelProgressBar (uses non-pixel styles)

src/components/common/
  RecoveryDialog.tsx      — MODIFIED: replace stone-* colors with pixel palette

src/components/journal/
  Journal.tsx             — MODIFIED: replace stone-* colors with pixel palette

src/styles/
  index.css              — MODIFIED: animation keyframes, focus states, spacing audit
```

### Performance Budget

- Background Canvas generation: < 50ms on first render, cached thereafter
- Particle system: 8fps via shared loop, < 1ms per tick
- Sprite animation: 4fps via shared loop, single Canvas redraw per frame
- Total rAF overhead: one loop, dispatching to registered subsystems
- No jank during focus phase (timer accuracy is critical)

### Dependencies

None added. Pure CSS animations + Canvas API.
