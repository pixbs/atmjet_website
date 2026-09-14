import * as migration_20260913_170121_initial from './20260913_170121_initial';
import * as migration_20260913_233158_globals from './20260913_233158_globals';
import * as migration_20260913_234234_drop_catalogue_versions from './20260913_234234_drop_catalogue_versions';
import * as migration_20260914_112946_hero_subpage_block from './20260914_112946_hero_subpage_block';

export const migrations = [
  {
    up: migration_20260913_170121_initial.up,
    down: migration_20260913_170121_initial.down,
    name: '20260913_170121_initial',
  },
  {
    up: migration_20260913_233158_globals.up,
    down: migration_20260913_233158_globals.down,
    name: '20260913_233158_globals',
  },
  {
    up: migration_20260913_234234_drop_catalogue_versions.up,
    down: migration_20260913_234234_drop_catalogue_versions.down,
    name: '20260913_234234_drop_catalogue_versions',
  },
  {
    up: migration_20260914_112946_hero_subpage_block.up,
    down: migration_20260914_112946_hero_subpage_block.down,
    name: '20260914_112946_hero_subpage_block'
  },
];
