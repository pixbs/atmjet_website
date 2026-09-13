import * as migration_20260911_194430_initial from './20260911_194430_initial';
import * as migration_20260912_224113_add_media_external_url from './20260912_224113_add_media_external_url';
import * as migration_20260912_224124_localize_media_alt from './20260912_224124_localize_media_alt';
import * as migration_20260913_121639_add_user_roles from './20260913_121639_add_user_roles';
import * as migration_20260913_122632_add_pages from './20260913_122632_add_pages';
import * as migration_20260913_124553_add_airports from './20260913_124553_add_airports';
import * as migration_20260913_130852_add_aircraft from './20260913_130852_add_aircraft';
import * as migration_20260913_132340_add_contacts from './20260913_132340_add_contacts';
import * as migration_20260913_133641_add_yachts from './20260913_133641_add_yachts';
import * as migration_20260913_134851_add_empty_legs from './20260913_134851_add_empty_legs';

export const migrations = [
  {
    up: migration_20260911_194430_initial.up,
    down: migration_20260911_194430_initial.down,
    name: '20260911_194430_initial',
  },
  {
    up: migration_20260912_224113_add_media_external_url.up,
    down: migration_20260912_224113_add_media_external_url.down,
    name: '20260912_224113_add_media_external_url',
  },
  {
    up: migration_20260912_224124_localize_media_alt.up,
    down: migration_20260912_224124_localize_media_alt.down,
    name: '20260912_224124_localize_media_alt',
  },
  {
    up: migration_20260913_121639_add_user_roles.up,
    down: migration_20260913_121639_add_user_roles.down,
    name: '20260913_121639_add_user_roles',
  },
  {
    up: migration_20260913_122632_add_pages.up,
    down: migration_20260913_122632_add_pages.down,
    name: '20260913_122632_add_pages',
  },
  {
    up: migration_20260913_124553_add_airports.up,
    down: migration_20260913_124553_add_airports.down,
    name: '20260913_124553_add_airports',
  },
  {
    up: migration_20260913_130852_add_aircraft.up,
    down: migration_20260913_130852_add_aircraft.down,
    name: '20260913_130852_add_aircraft',
  },
  {
    up: migration_20260913_132340_add_contacts.up,
    down: migration_20260913_132340_add_contacts.down,
    name: '20260913_132340_add_contacts',
  },
  {
    up: migration_20260913_133641_add_yachts.up,
    down: migration_20260913_133641_add_yachts.down,
    name: '20260913_133641_add_yachts',
  },
  {
    up: migration_20260913_134851_add_empty_legs.up,
    down: migration_20260913_134851_add_empty_legs.down,
    name: '20260913_134851_add_empty_legs'
  },
];
