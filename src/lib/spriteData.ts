import type { LegacySpriteData } from "../types";

// Each sprite is 16x16 = 256 characters.
// '0' = transparent, other digits map to palette indices.

// 1. 齿轮虫 (gear-bug) - work-gear-beast
// A small mechanical beetle with gear-tooth edges
const gearBug: LegacySpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#333333",     // 1 - dark outline
    "#888888",     // 2 - gray body
    "#FF8844",     // 3 - orange gear marks
    "#EE4433",     // 4 - red eye
    "#AAAAAA",     // 5 - light gray highlight
  ],
  pixels:
    // Row 0
    "0000011111100000" +
    // Row 1
    "0001122222110000" +
    // Row 2
    "0012225225221000" +
    // Row 3
    "0123222222231300" +
    // Row 4
    "1322422422231310" +
    // Row 5
    "1222222222222131" +
    // Row 6
    "3122255225221130" +
    // Row 7
    "0122252225221300" +
    // Row 8
    "0132222222223100" +
    // Row 9
    "0013222222231000" +
    // Row 10
    "0031322223130300" +
    // Row 11
    "0301312221303030" +
    // Row 12
    "0030131113030300" +
    // Row 13
    "0003013130300000" +
    // Row 14
    "0000301103000000" +
    // Row 15
    "0000030030000000",
};

// 2. 灵感蛾 (muse-moth) - creative-muse-butterfly
// A moth with spread wings
const museMoth: LegacySpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#443355",     // 1 - dark body
    "#CCAAEE",     // 2 - light purple wings
    "#FFD93D",     // 3 - yellow wing spots
    "#FFFFFF",     // 4 - white highlights
    "#9977BB",     // 5 - mid purple
  ],
  pixels:
    // Row 0
    "0000001001000000" +
    // Row 1
    "0000010010000000" +
    // Row 2
    "0002010010200000" +
    // Row 3
    "0022211112200000" +
    // Row 4
    "0223211112320000" +
    // Row 5
    "2253211112352000" +
    // Row 6
    "2225411114522000" +
    // Row 7
    "2232111111232200" +
    // Row 8
    "0221111111122000" +
    // Row 9
    "2232111111232200" +
    // Row 10
    "2225411114522000" +
    // Row 11
    "2253211112352000" +
    // Row 12
    "0223211112320000" +
    // Row 13
    "0022211112200000" +
    // Row 14
    "0002200002200000" +
    // Row 15
    "0000200002000000",
};

// 3. 论文狼 (thesis-wolf) - study-thesis-wolf
// A wolf head/upper body facing forward
const thesisWolf: LegacySpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#333333",     // 1 - dark outline
    "#999999",     // 2 - gray fur
    "#FFFFFF",     // 3 - white chest
    "#EE4433",     // 4 - red eyes
    "#3366AA",     // 5 - blue accents
    "#777777",     // 6 - darker gray
  ],
  pixels:
    // Row 0
    "0012000000002100" +
    // Row 1
    "0122100000012210" +
    // Row 2
    "1262210000126210" +
    // Row 3
    "1226221001226210" +
    // Row 4
    "0122222112222210" +
    // Row 5
    "0012224224222100" +
    // Row 6
    "0012222222222100" +
    // Row 7
    "0001223223221000" +
    // Row 8
    "0001223333221000" +
    // Row 9
    "0001222332221000" +
    // Row 10
    "0000122112210000" +
    // Row 11
    "0000513333150000" +
    // Row 12
    "0005133333315000" +
    // Row 13
    "0005133333315000" +
    // Row 14
    "0000133333310000" +
    // Row 15
    "0000011111100000",
};

// 4. 藤蔓蛙 (vine-frog) - life-storage-frog
// A frog with vine patterns
const vineFrog: LegacySpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#338822",     // 1 - dark green outline/spots
    "#5BBF47",     // 2 - green body
    "#FFFFFF",     // 3 - white belly
    "#FF8844",     // 4 - orange eyes
    "#88DD66",     // 5 - light green highlight
  ],
  pixels:
    // Row 0
    "0000000000000000" +
    // Row 1
    "0001140000114000" +
    // Row 2
    "0014440001444000" +
    // Row 3
    "0012241001224100" +
    // Row 4
    "0122222112222100" +
    // Row 5
    "1225222222252210" +
    // Row 6
    "1222522225222210" +
    // Row 7
    "1222222222222210" +
    // Row 8
    "0122233333221100" +
    // Row 9
    "0012233333221000" +
    // Row 10
    "0001233333210000" +
    // Row 11
    "0001222222210000" +
    // Row 12
    "0012211112210000" +
    // Row 13
    "0012100001210000" +
    // Row 14
    "0012100001210000" +
    // Row 15
    "0011100001110000",
};

// 5. 虚空鸦 (void-crow) - other-mist-crow
// A dark bird with glowing eyes
const voidCrow: LegacySpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#333333",     // 1 - black outline
    "#443355",     // 2 - dark purple body
    "#FFD93D",     // 3 - glowing yellow eyes
    "#3366AA",     // 4 - dark blue wing tips
    "#554466",     // 5 - lighter purple
  ],
  pixels:
    // Row 0
    "0000001110000000" +
    // Row 1
    "0000012221000000" +
    // Row 2
    "0000122521000000" +
    // Row 3
    "0001223222100000" +
    // Row 4
    "0001232232100000" +
    // Row 5
    "0012222222210000" +
    // Row 6
    "0122222222221000" +
    // Row 7
    "1222222222222100" +
    // Row 8
    "1252222222225210" +
    // Row 9
    "1425222222254210" +
    // Row 10
    "0142522222541200" +
    // Row 11
    "0014252225410200" +
    // Row 12
    "0001422224100000" +
    // Row 13
    "0000142241000000" +
    // Row 14
    "0000012210000000" +
    // Row 15
    "0000011011000000",
};

// Legacy 16x16 sprite data
export const SPRITE_DATA_LEGACY: Record<string, LegacySpriteData> = {
  "work-gear-bug": gearBug,
  "creative-muse-moth": museMoth,
  "study-thesis-wolf": thesisWolf,
  "life-vine-frog": vineFrog,
  "other-void-crow": voidCrow,
};

import type { SpriteData } from "../types";
import { SPRITE_DATA_32 } from "./spriteData32";

/**
 * Get sprite data for a species, preferring 32x32 over legacy 16x16.
 */
export function getSpriteData(speciesId: string): SpriteData | LegacySpriteData | undefined {
  return SPRITE_DATA_32[speciesId] ?? SPRITE_DATA_LEGACY[speciesId];
}

// Backward compat: SPRITE_DATA now returns either format
export const SPRITE_DATA: Record<string, SpriteData | LegacySpriteData> = {
  ...SPRITE_DATA_LEGACY,
  ...SPRITE_DATA_32,
};
