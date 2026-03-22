// Import MML track files as raw text
// Vite supports ?raw imports for text files

import villageRaw from './tracks/village.mml?raw';
import gearWorkshopRaw from './tracks/habitat-gear-workshop.mml?raw';
import witheredGalleryRaw from './tracks/habitat-withered-gallery.mml?raw';
import forgottenLibraryRaw from './tracks/habitat-forgotten-library.mml?raw';
import abandonedGardenRaw from './tracks/habitat-abandoned-garden.mml?raw';
import mistSwampRaw from './tracks/habitat-mist-swamp.mml?raw';
import restRaw from './tracks/rest.mml?raw';

export const trackSources: Record<string, string> = {
  village: villageRaw,
  'habitat-gear-workshop': gearWorkshopRaw,
  'habitat-withered-gallery': witheredGalleryRaw,
  'habitat-forgotten-library': forgottenLibraryRaw,
  'habitat-abandoned-garden': abandonedGardenRaw,
  'habitat-mist-swamp': mistSwampRaw,
  rest: restRaw,
};
