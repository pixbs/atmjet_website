import * as migration_20260913_170121_initial from './20260913_170121_initial';
import * as migration_20260913_233650_drop_catalogue_versions from './20260913_233650_drop_catalogue_versions';

export const migrations = [
  {
    up: migration_20260913_170121_initial.up,
    down: migration_20260913_170121_initial.down,
    name: '20260913_170121_initial',
  },
  {
    up: migration_20260913_233650_drop_catalogue_versions.up,
    down: migration_20260913_233650_drop_catalogue_versions.down,
    name: '20260913_233650_drop_catalogue_versions'
  },
];
