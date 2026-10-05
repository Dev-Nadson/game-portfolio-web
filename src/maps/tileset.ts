/**
 * Índices do tileset combinado `public/assets/tilesets/world.png`.
 *
 * Os primeiros 132 tiles são o Kenney Tiny Town (12 colunas x 11 linhas),
 * copiados sem alteração. Depois vêm os tiles próprios, na ordem de
 * CUSTOM_TILES — o gerador de sprites usa essa mesma lista, então para
 * criar um tile novo basta adicionar o nome aqui e desenhá-lo em
 * scripts/sprites/tiles.ts (o TypeScript acusa o que faltar).
 */
export const TILESET_COLUMNS = 12;
export const KENNEY_TILE_COUNT = 132;

/** As 9 partes + 4 cantos internos de um terreno com borda (autotile). */
export const EDGE_PARTS = ["tl", "t", "tr", "l", "c", "r", "bl", "b", "br", "in_tl", "in_tr", "in_bl", "in_br"] as const;
export type EdgePart = (typeof EDGE_PARTS)[number];

/**
 * Terrenos desenhados com borda pelo gerador. `sea2` é o segundo quadro
 * da animação do mar (a espuma avança sobre a areia).
 */
export const EDGED = ["water", "sand", "sea", "sea2", "rock"] as const;
export type EdgedTile = (typeof EDGED)[number];

const OTHER_TILES = [
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
  "pier_l",
  "pier_r",
] as const;

export type CustomTile = `${EdgedTile}_${EdgePart}` | (typeof OTHER_TILES)[number];

export const CUSTOM_TILES: readonly CustomTile[] = [
  ...EDGED.flatMap((kind) => EDGE_PARTS.map((part) => `${kind}_${part}` as const)),
  ...OTHER_TILES,
];

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
