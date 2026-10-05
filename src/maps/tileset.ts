/**
 * Índices do tileset combinado `public/assets/tilesets/world.png`.
 *
 * Os primeiros 132 tiles são o Kenney Tiny Town (12 colunas x 11 linhas),
 * copiados sem alteração. Depois vêm os tiles próprios, na ordem de
 * CUSTOM_TILES — o gerador de sprites usa essa mesma lista, então para
 * criar um tile novo basta adicionar o nome aqui e desenhá-lo em
 * scripts/sprites/tiles.ts.
 */
export const TILESET_COLUMNS = 12;
export const KENNEY_TILE_COUNT = 132;

export const CUSTOM_TILES = [
  // água: 9 partes + 4 cantos internos (mesmo esquema do caminho de terra)
  "water_tl",
  "water_t",
  "water_tr",
  "water_l",
  "water_c",
  "water_r",
  "water_bl",
  "water_b",
  "water_br",
  "water_in_tl",
  "water_in_tr",
  "water_in_bl",
  "water_in_br",
  "soil",
  "floor_wood_a",
  "floor_wood_b",
  "floor_clinic",
  "floor_school_a",
  "floor_school_b",
  "wall_trim",
  "wall_office_top",
  "wall_office_bottom",
  "wall_clinic_top",
  "wall_clinic_bottom",
  "wall_school_top",
  "wall_school_bottom",
  "void",
  "exit_mat",
] as const;

export type CustomTile = (typeof CUSTOM_TILES)[number];

export function customTile(name: CustomTile): number {
  return KENNEY_TILE_COUNT + CUSTOM_TILES.indexOf(name);
}

/** Tiles do Kenney usados pelo mapa (índices em docs/tileset-indices.png). */
export const KENNEY = {
  grass: 0,
  grassTufts: 1,
  grassFlowers: 2,
  path: { tl: 12, t: 13, tr: 14, l: 24, c: 25, r: 26, bl: 36, b: 37, br: 38 },
  pathInner: { tl: 39, tr: 40, bl: 42, br: 41 },
  plaza: 43,
  fence: { left: 80, mid: 81, right: 82, top: 47, vmid: 59, bottom: 71 },
  // props de 16x16 reaproveitados como sprites soltos
  bushRound: 5,
  pineSmall: 4,
  pineSmallAutumn: 3,
  treeRound: 16,
  treeRoundAutumn: 15,
  sprout: 17,
  mushrooms: 29,
  sign: 83,
  wheelbarrow: 57,
  beehive: 94,
  log: 106,
  pot: 107,
  barrel: 130,
  bucket: 131,
} as const;
