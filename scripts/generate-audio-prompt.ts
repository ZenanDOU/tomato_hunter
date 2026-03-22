/**
 * Audio generation prompt renderer.
 * Usage:
 *   npx tsx scripts/generate-audio-prompt.ts --type bgm --habitat gear-workshop
 *   npx tsx scripts/generate-audio-prompt.ts --type sfx --category hunt
 *   npx tsx scripts/generate-audio-prompt.ts --type sfx --category hunt --habitat gear-workshop
 */

import { renderBgmPrompt } from '../src/lib/audio/pipeline/bgmPromptTemplate';
import { renderSfxPrompt } from '../src/lib/audio/pipeline/sfxPromptTemplate';
import type { SfxCategory } from '../src/lib/audio/types';

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const type = getArg('type');
const habitat = getArg('habitat');
const category = getArg('category') as SfxCategory | undefined;

if (type === 'bgm') {
  if (!habitat) {
    console.error('Usage: --type bgm --habitat <habitat-id>');
    console.error('Habitats: gear-workshop, withered-gallery, forgotten-library, abandoned-garden, mist-swamp');
    process.exit(1);
  }
  console.log(renderBgmPrompt(habitat));
} else if (type === 'sfx') {
  if (!category || !['hunt', 'timer', 'ui'].includes(category)) {
    console.error('Usage: --type sfx --category <hunt|timer|ui> [--habitat <habitat-id>]');
    process.exit(1);
  }
  console.log(renderSfxPrompt(category, habitat));
} else {
  console.error('Usage: --type <bgm|sfx> [--habitat <id>] [--category <hunt|timer|ui>]');
  process.exit(1);
}
