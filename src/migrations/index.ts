import * as migration_20260913_170121_initial from './20260913_170121_initial';
import * as migration_20260913_233158_globals from './20260913_233158_globals';
import * as migration_20260913_234234_drop_catalogue_versions from './20260913_234234_drop_catalogue_versions';
import * as migration_20260914_112946_hero_subpage_block from './20260914_112946_hero_subpage_block';
import * as migration_20260914_115830_why_us_block from './20260914_115830_why_us_block';
import * as migration_20260914_122840_key_features_block from './20260914_122840_key_features_block';
import * as migration_20260914_125349_privilege_block from './20260914_125349_privilege_block';
import * as migration_20260914_131928_yachts_promo_block from './20260914_131928_yachts_promo_block';
import * as migration_20260914_134329_options_tiles_block from './20260914_134329_options_tiles_block';
import * as migration_20260914_143330_tiles_block from './20260914_143330_tiles_block';
import * as migration_20260914_150937_faq_block from './20260914_150937_faq_block';
import * as migration_20260914_154856_guide_and_documents_blocks from './20260914_154856_guide_and_documents_blocks';
import * as migration_20260914_162727_group_cards_block from './20260914_162727_group_cards_block';
import * as migration_20260914_165619_advantages_block from './20260914_165619_advantages_block';
import * as migration_20260914_173438_best_price_we_inspect_blocks from './20260914_173438_best_price_we_inspect_blocks';
import * as migration_20260914_175735_quote_block from './20260914_175735_quote_block';
import * as migration_20260914_183254_hero_sales_and_yachts_blocks from './20260914_183254_hero_sales_and_yachts_blocks';
import * as migration_20260914_192256_descriptor_blocks from './20260914_192256_descriptor_blocks';
import * as migration_20260914_193505_small_hero_blocks from './20260914_193505_small_hero_blocks';
import * as migration_20260914_194732_contact_card_block from './20260914_194732_contact_card_block';
import * as migration_20260915_022850_empty_legs_block from './20260915_022850_empty_legs_block';
import * as migration_20260915_024225_personal_manager_block from './20260915_024225_personal_manager_block';
import * as migration_20260915_033955_hero_video_block from './20260915_033955_hero_video_block';
import * as migration_20260915_043206_telegram_lead_jobs from './20260915_043206_telegram_lead_jobs';

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
    name: '20260914_125349_privilege_block',
  },
  {
    up: migration_20260914_131928_yachts_promo_block.up,
    down: migration_20260914_131928_yachts_promo_block.down,
    name: '20260914_131928_yachts_promo_block',
  },
  {
    up: migration_20260914_134329_options_tiles_block.up,
    down: migration_20260914_134329_options_tiles_block.down,
    name: '20260914_134329_options_tiles_block',
  },
  {
    up: migration_20260914_143330_tiles_block.up,
    down: migration_20260914_143330_tiles_block.down,
    name: '20260914_143330_tiles_block',
  },
  {
    up: migration_20260914_150937_faq_block.up,
    down: migration_20260914_150937_faq_block.down,
    name: '20260914_150937_faq_block',
  },
  {
    up: migration_20260914_154856_guide_and_documents_blocks.up,
    down: migration_20260914_154856_guide_and_documents_blocks.down,
    name: '20260914_154856_guide_and_documents_blocks',
  },
  {
    up: migration_20260914_162727_group_cards_block.up,
    down: migration_20260914_162727_group_cards_block.down,
    name: '20260914_162727_group_cards_block',
  },
  {
    up: migration_20260914_165619_advantages_block.up,
    down: migration_20260914_165619_advantages_block.down,
    name: '20260914_165619_advantages_block',
  },
  {
    up: migration_20260914_173438_best_price_we_inspect_blocks.up,
    down: migration_20260914_173438_best_price_we_inspect_blocks.down,
    name: '20260914_173438_best_price_we_inspect_blocks',
  },
  {
    up: migration_20260914_175735_quote_block.up,
    down: migration_20260914_175735_quote_block.down,
    name: '20260914_175735_quote_block',
  },
  {
    up: migration_20260914_183254_hero_sales_and_yachts_blocks.up,
    down: migration_20260914_183254_hero_sales_and_yachts_blocks.down,
    name: '20260914_183254_hero_sales_and_yachts_blocks',
  },
  {
    up: migration_20260914_192256_descriptor_blocks.up,
    down: migration_20260914_192256_descriptor_blocks.down,
    name: '20260914_192256_descriptor_blocks',
  },
  {
    up: migration_20260914_193505_small_hero_blocks.up,
    down: migration_20260914_193505_small_hero_blocks.down,
    name: '20260914_193505_small_hero_blocks',
  },
  {
    up: migration_20260914_194732_contact_card_block.up,
    down: migration_20260914_194732_contact_card_block.down,
    name: '20260914_194732_contact_card_block',
  },
  {
    up: migration_20260915_022850_empty_legs_block.up,
    down: migration_20260915_022850_empty_legs_block.down,
    name: '20260915_022850_empty_legs_block',
  },
  {
    up: migration_20260915_024225_personal_manager_block.up,
    down: migration_20260915_024225_personal_manager_block.down,
    name: '20260915_024225_personal_manager_block',
  },
  {
    up: migration_20260915_033955_hero_video_block.up,
    down: migration_20260915_033955_hero_video_block.down,
    name: '20260915_033955_hero_video_block',
  },
  {
    up: migration_20260915_043206_telegram_lead_jobs.up,
    down: migration_20260915_043206_telegram_lead_jobs.down,
    name: '20260915_043206_telegram_lead_jobs'
  },
];
