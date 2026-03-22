/**
 * Sprite generation prompt renderer for Claude.
 * Usage: npx tsx scripts/generate-sprite-prompt.ts --species <species-id>
 */

import { BESTIARY } from '../src/lib/bestiary';

const args = process.argv.slice(2);
const speciesId = args.indexOf('--species') >= 0 ? args[args.indexOf('--species') + 1] : undefined;

if (!speciesId) {
  console.error('Usage: --species <species-id>');
  console.error('Available:', BESTIARY.map(s => s.id).join(', '));
  process.exit(1);
}

const species = BESTIARY.find(s => s.id === speciesId);
if (!species) {
  console.error(`Species not found: ${speciesId}`);
  process.exit(1);
}

const HABITAT_PALETTES: Record<string, { colors: string[]; desc: string }> = {
  work: {
    colors: ['transparent', '#333333', '#666666', '#999999', '#BBBBBB', '#FF8844', '#EE4433', '#444444'],
    desc: '金属/机械色调：黑色轮廓、灰色金属、橙色光芒、红色强调'
  },
  creative: {
    colors: ['transparent', '#333333', '#443355', '#665577', '#8877AA', '#EE4433', '#FFD93D', '#FF8844', '#FFFFFF'],
    desc: '艺术/颜料色调：黑色轮廓、紫色基底、红/黄/橙火焰色、白色高光'
  },
  study: {
    colors: ['transparent', '#333333', '#3366AA', '#5588CC', '#77AADD', '#FFD93D', '#8B4513', '#D2B48C'],
    desc: '书籍/知识色调：黑色轮廓、蓝色系主体、金色光点、棕色书页'
  },
  life: {
    colors: ['transparent', '#333333', '#2D5A1E', '#5BBF47', '#88DD66', '#8B4513', '#FFD93D', '#EE4433'],
    desc: '自然/花园色调：黑色轮廓、绿色系主体、棕色树木、黄/红花果'
  },
  other: {
    colors: ['transparent', '#333333', '#1A3333', '#336666', '#55AAAA', '#FFFFFF', '#9966CC', '#55BBEE'],
    desc: '迷雾/混沌色调：黑色轮廓、青色基底、白色发光、紫色迷雾、蓝色强调'
  },
};

const palette = HABITAT_PALETTES[species.category];

console.log(`你是一个像素美术师。请为 32x32 像素游戏角色生成 sprite 数据。

## 目标物种

**${species.name}** (${species.id})
- 视觉描述: ${species.visualDesc}
- 栖息地: ${species.habitat}
- 体型等级: ${species.tier} (${species.tier === 'prey' ? '小型' : species.tier === 'predator' ? '中型' : '大型'})
- 特征: ${species.traits.map(t => \`\${t.icon} \${t.name}·\${t.desc}\`).join(', ')}

## 调色板

\`\`\`
${palette.colors.map((c, i) => \`\${i}: \${c}\`).join('\\n')}
\`\`\`
色调说明: ${palette.desc}

## 输出格式

输出一个 32 行的文本块，每行 32 个字符。每个字符是调色板索引（0-9, a=10, b=11...）。
0 = 透明。角色应居中放置。

## 约束

- prey 体型占画布 40-50%，predator 60-70%，apex 75-85%
- 轮廓用索引 1（黑色），保证剪影清晰
- 至少使用 4 种非透明色
- 造型要在缩小到 16x16 时仍可辨认

请直接输出 32 行像素数据：`);
