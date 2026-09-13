import * as migration_20260913_170121_initial from './20260913_170121_initial';

export const migrations = [
  {
    up: migration_20260913_170121_initial.up,
    down: migration_20260913_170121_initial.down,
    name: '20260913_170121_initial'
  },
];
