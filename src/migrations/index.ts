import * as migration_20260913_170121_initial from './20260913_170121_initial';
import * as migration_20260913_233158_globals from './20260913_233158_globals';
import * as migration_20260913_234234_drop_catalogue_versions from './20260913_234234_drop_catalogue_versions';
import * as migration_20260914_112946_hero_subpage_block from './20260914_112946_hero_subpage_block';
import * as migration_20260914_115830_why_us_block from './20260914_115830_why_us_block';
import * as migration_20260914_122840_key_features_block from './20260914_122840_key_features_block';
import * as migration_20260914_125349_privilege_block from './20260914_125349_privilege_block';

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
    name: '20260914_112946_hero_subpage_block',
  },
  {
    up: migration_20260914_115830_why_us_block.up,
    down: migration_20260914_115830_why_us_block.down,
    name: '20260914_115830_why_us_block',
  },
  {
    up: migration_20260914_122840_key_features_block.up,
    down: migration_20260914_122840_key_features_block.down,
    name: '20260914_122840_key_features_block',
  },
  {
    up: migration_20260914_125349_privilege_block.up,
    down: migration_20260914_125349_privilege_block.down,
    name: '20260914_125349_privilege_block'
  },
];
