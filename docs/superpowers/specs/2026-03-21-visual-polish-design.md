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

### 0.3 Trait Updates for New Apex

**画境凤:**
- 🔥 焚稿 · 推倒重来 (kept)
- 🌈 涅槃 · 完美主义的无限循环 (replaces 幻象·自我怀疑)

**封典巨鸮:**
- 🦉 凝视 · 畏难情绪 (replaces 威压·畏难情绪)
- 📚 封印 · 知识壁垒 (kept)

**深渊水母:**
- 🪼 缠绕 · 完全失控 (replaces 混沌·完全失控)
- 🌀 扭曲 · 认知偏差 (kept)

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

Each habitat maintains an 8-12 color palette (up from ~4-6), adding shadow and highlight colors for more dimensional forms.

### 1.4 Data Structure

```typescript
// Current
type SpriteData = { palette: string[]; pixels: number[][] }  // 16x16

// New
type SpriteFrame = number[][];  // 32x32 grid of palette indices

type SpriteData = {
  palette: string[];
  frames: {
    idle: SpriteFrame[];     // 2 frames
    hit: SpriteFrame[];      // 1 frame
    defeat: SpriteFrame[];   // 2 frames
  };
}
```

### 1.5 PixelSprite Component

- Accept `animation` prop: `"idle" | "hit" | "defeat"`
- Internal requestAnimationFrame loop at 4fps (pixel art standard)
- Hit animation: play once then return to idle
- Defeat animation: play once then hold last frame
- Fallback: if sprite only has legacy 16x16 data, render at 2x scale

### 1.6 Scope

All 15 monster species need new 32x32 sprite data with animation frames. The three new apex creatures (画境凤, 封典巨鸮, 深渊水母) need entirely new designs.

---

## 2. Procedural Pixel Backgrounds

### 2.1 Implementation

New `PixelBackground` component using offscreen Canvas to generate pixel-art scene tiles. Cached as ImageBitmap to avoid repainting. Background layer at lowest z-index, UI floats above.

### 2.2 Village Background

Sky gradient (light blue → white) + distant mountain silhouettes (3 parallax layers, varying blue-gray) + bottom grass color blocks + randomly scattered small tree/house pixel patterns. Fixed-seed random for consistency across launches.

### 2.3 Habitat Backgrounds (Focus Phase Only)

| Habitat | Base Color | Elements | Particles |
|---------|-----------|----------|-----------|
| 齿轮工坊废墟 | Dark gray | Gear/pipe outlines | Faint orange sparks |
| 枯竭画廊 | Deep purple | Picture frame outlines | Falling paint flakes |
| 遗忘图书馆 | Deep blue | Bookshelf outlines | Floating light motes |
| 荒废花园 | Deep green | Vine/flower outlines | Slowly falling petals |
| 迷雾沼泽 | Dark green | Water surface ripples | Rising mist wisps |

### 2.4 Particle System

Lightweight Canvas particle layer overlaid on static backgrounds. 10-20 particles per habitat, simple linear motion + opacity cycling. Separate requestAnimationFrame loop capped at 8fps for performance.

### 2.5 Phase Behavior

- **Prep phase**: Keep current solid color + semi-transparent overlay (high readability needed)
- **Focus phase**: Full habitat background displayed
- **Review phase**: Keep current cream background (high readability)
- **Rest/break**: Light green base + grass + slow-moving clouds, brighter and lighter than hunt backgrounds

### 2.6 Rest Background

Light green (#88DDAA) base with pixel grass strip at bottom, 2-3 slow-moving cloud shapes. Calm, recovery atmosphere.

---

## 3. Animation & Transition System

### 3.1 Constraints (All Animations)

- No sub-pixel rendering: all transform values use integers (`translateX(2px)` not `2.5px`)
- Easing: `steps(N)` or `linear` only. No ease/cubic-bezier (breaks pixel aesthetic)
- Max duration: 300ms (pixel games are snappy)
- No external animation libraries

### 3.2 Page Transitions

- **Village tab switch**: Slide-down entry, 100ms, `steps(4)` — simulates scanline-by-scanline reveal
- **Hunt phase transitions** (prep→focus→review): Full-screen white flash (2 frames, ~80ms) + new phase fade-in
- **Hunt window**: Already a separate Tauri window, no transition needed

### 3.3 Monster Animations

- **Idle**: 2-frame sprite loop at 4fps (handled by PixelSprite component)
- **Hit** (on review submit): White overlay flash ×3 + horizontal shake ±2px, ~200ms total
- **Defeat** (HP=0): 2-frame defeat animation + downward fade-out

### 3.4 Loot Drop Animation

Settlement screen: loot items appear one by one, 200ms interval between each. Each item springs up from below + slight scale (1.2→1.0). Pure CSS `@keyframes`.

### 3.5 Button Feedback

Keep existing active press displacement (1px). Add 1-frame white overlay flash on click (matching sprite hit style for pixel aesthetic cohesion).

---

## 4. Visual Consistency Audit

### 4.1 Spacing

Standardize to 4 increments: `p-3`/`p-4`/`gap-2`/`gap-4`. Remove stray `p-5`, `p-6`, etc. Pixel art aligns to 4px grid.

### 4.2 Borders

All cards/buttons/inputs use `outline-2 outline-[#333333] outline-offset-[-2px]`. Audit and replace any `border-*` usage with `outline-*` for consistent weight.

### 4.3 Colors

Audit all hardcoded color values. Only Tomato Train palette colors allowed:
- sky #55BBEE, tomato #EE4433, sunny #FFD93D, grass #5BBF47
- cloud #FFFFFF, pixel-black #333333, orange #FF8844, cream #FFF8E8
- deep-blue #3366AA, pink #FFCCDD

Remove Tailwind defaults like `bg-stone-900`, `text-stone-400`, `bg-red-100`.

### 4.4 Font

Verify zpix pixel font inheritance across all elements including popups, inputs, textareas, and dynamically created content.

### 4.5 Focus States

All focusable elements get unified pixel-style focus: `outline-[#FFD93D] outline-2` (sunny yellow highlight frame), replacing browser default blue focus ring.

### 4.6 Approach

Targeted fixes only. No component API changes or layout restructuring.

---

## Architecture Notes

### File Structure (New/Modified)

```
src/lib/
  spriteData.ts          — MODIFIED: 32x32 frame data, new species
  bestiary.ts            — MODIFIED: family names, apex replacements, traits

src/components/common/
  PixelSprite.tsx         — MODIFIED: animation prop, multi-frame rendering
  PixelBackground.tsx     — NEW: procedural background generator
  PixelTransition.tsx     — NEW: page transition wrapper
  PixelButton.tsx         — MODIFIED: click flash effect

src/components/hunt/
  PrepPhase.tsx           — MODIFIED: background integration
  FocusPhase.tsx          — MODIFIED: habitat background + monster animations
  ReviewPhase.tsx         — MODIFIED: monster hit animation on submit

src/components/settlement/
  Settlement.tsx          — MODIFIED: loot drop animation

src/styles/
  index.css              — MODIFIED: animation keyframes, focus states, spacing audit
```

### Performance Budget

- Background Canvas generation: < 50ms on first render, cached thereafter
- Particle system: 8fps cap, < 1ms per frame (10-20 simple particles)
- Sprite animation: 4fps, single Canvas redraw per frame
- No jank during focus phase (timer accuracy is critical)

### Dependencies

None added. Pure CSS animations + Canvas API.
