import * as migration_20260911_194430_initial from './20260911_194430_initial';
import * as migration_20260912_224113_add_media_external_url from './20260912_224113_add_media_external_url';
import * as migration_20260912_224124_localize_media_alt from './20260912_224124_localize_media_alt';
import * as migration_20260913_121639_add_user_roles from './20260913_121639_add_user_roles';

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
    name: '20260913_121639_add_user_roles'
  },
];
