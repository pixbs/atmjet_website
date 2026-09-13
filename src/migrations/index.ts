import * as migration_20260913_170121_initial from './20260913_170121_initial';
import * as migration_20260913_224636_globals from './20260913_224636_globals';

export const migrations = [
  {
    up: migration_20260913_170121_initial.up,
    down: migration_20260913_170121_initial.down,
    name: '20260913_170121_initial',
  },
  {
    up: migration_20260913_224636_globals.up,
    down: migration_20260913_224636_globals.down,
    name: '20260913_224636_globals'
  },
];
