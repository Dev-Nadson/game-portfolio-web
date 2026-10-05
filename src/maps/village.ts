import type { Content, MapDef, PropDef } from "../types";
import type { SpriteKey } from "../assets/sprites.gen";
import { TerrainGrid, bake, hash } from "./terrain";
import { KENNEY } from "./tileset";
import { ABOUT, CONTACT, LANGUAGES, WELCOME } from "../data/profile";
import { CATSUC_DOOR } from "../data/catsuc";
import { NEUROKIDS_DOOR } from "../data/neurokids";
import { SCHOOL_DOOR } from "../data/education";
import { CAVE, LIGHTHOUSE, WIZARD_TOWER } from "../data/extras";
import { STACK, categoryContent, techContent, type CropKind } from "../data/stack";

/**
 * Vila (mapa externo), 66x46 tiles.
 *
 *   O: serra (montanhas, caverna e cachoeira)   NO: torre Catsuc
 *   N: lago      NE: clínica NeuroKids          L: torre do mago
 *   centro: praça (spawn)    SO: horta da stack e, abaixo, a praia com o farol
 *   SE: escola UNIFAVIP e um prado com o carvalho antigo
 *
 * Coordenadas em tiles. Props usam o centro-inferior do sprite:
 * um sprite de 16px na coluna c e linha r fica em (c + 0.5, r + 1).
 * Serra, mar e areia passam da borda do mapa: a câmera mostra o
 * horizonte, mas o jogador para na base da montanha e na beira d'água.
 */
const W = 66;
const H = 46;

const grid = new TerrainGrid(W, H, "grass");

// ── serra a oeste: chão de pedra (sólido) coberto por montanhas ──
grid.rect("rock", 0, 0, 9, 32);
// borda leste irregular, para a serra não parecer uma parede reta
grid.rect("grass", 8, 25, 1, 4);
// enseada da caverna, com o laguinho da cachoeira
grid.rect("grass", 2, 17, 7, 5);
grid.rect("water", 2, 17, 3, 2);

// ── praia e mar no canto sudoeste ──
grid.rect("sand", 0, 34, 36, 12).rect("sand", 36, 37, 4, 9);
grid.rect("sea", 0, 39, 32, 7).rect("sea", 32, 41, 4, 5);
grid.rect("pier", 14, 38, 2, 5);

// lago
grid.rect("water", 31, 2, 9, 5).rect("water", 33, 7, 5, 1);
// estrada principal (da caverna à torre do mago) e acessos às portas
grid.rect("path", 12, 10, 47, 2);
grid.rect("path", 16, 9, 3, 3); // Catsuc
grid.rect("path", 51, 9, 3, 3); // NeuroKids
grid.rect("path", 33, 12, 4, 1); // estrada -> praça
// praça
grid.rect("plaza", 28, 13, 14, 7);
// praça -> sul -> escola, e a descida para a praia
grid.rect("path", 33, 20, 4, 10);
grid.rect("path", 33, 30, 21, 2);
grid.rect("path", 49, 29, 4, 3);
grid.rect("path", 33, 32, 2, 2);
// praça -> horta
grid.rect("path", 18, 20, 15, 2);
grid.rect("path", 19, 20, 2, 4);
// estrada -> caverna
grid.rect("path", 12, 12, 2, 9);
grid.rect("path", 6, 19, 8, 2);
grid.rect("path", 6, 17, 2, 2);
// estrada -> torre do mago
grid.rect("path", 57, 12, 2, 10);
grid.rect("path", 57, 20, 7, 2);
// horta cercada com portão no topo
grid.fenceRect(13, 22, 15, 12, [
  [19, 22],
  [20, 22],
]);

const props: PropDef[] = [];
const place = (sprite: SpriteKey, x: number, y: number, extra: Partial<PropDef> = {}) =>
  props.push({ sprite, x, y, ...extra });
const kenney = (frame: number, x: number, y: number, extra: Partial<PropDef> = {}) =>
  props.push({ sprite: "kenney", frame, x, y, ...extra });
/** espelhamento determinístico por posição, para variar árvores e montanhas */
const flip = (x: number, y: number) => hash(Math.round(x * 2), Math.round(y * 2), 7) < 0.5;

// ── prédios ──
place("building-catsuc", 17.5, 9, { body: { w: 124, h: 60 } });
place("building-neurokids", 52.5, 9, { body: { w: 108, h: 50 } });
place("building-school", 51, 29, { body: { w: 124, h: 54 } });
const signAt = (x: number, y: number, content: Content) =>
  kenney(KENNEY.sign, x, y, { body: { w: 12, h: 6 }, content });
signAt(15.5, 10, CATSUC_DOOR);
signAt(54.5, 10, NEUROKIDS_DOOR);
signAt(53.5, 30, SCHOOL_DOOR);

// ── praça ──
kenney(KENNEY.sign, 33.5, 18, { body: { w: 12, h: 6 }, content: WELCOME });
place("obj-well", 35, 17, { body: { w: 28, h: 12 } });
place("obj-bulletin", 31, 15, { body: { w: 28, h: 6 }, content: ABOUT });
place("obj-mailbox", 39.5, 15, { body: { w: 8, h: 5 }, content: CONTACT });
place("obj-signpost", 29.5, 20, { body: { w: 6, h: 5 }, content: LANGUAGES });
for (const [x, y] of [
  [28.5, 14],
  [41.5, 14],
  [41.5, 20],
])
  place("obj-lamp", x, y, { body: { w: 6, h: 4 } });
place("obj-bench", 38, 20, { body: { w: 28, h: 6 } });
place("obj-bench", 38, 13.5, { body: { w: 28, h: 6 } });
for (const x of [29.5, 40.5]) place("obj-flowerbed", x, 17, { body: { w: 14, h: 6 } });

// ── horta da stack ──
const CROP_ROW: Record<CropKind, number> = { backend: 0, frontend: 1, data: 2, ai: 3, devops: 4 };
STACK.forEach((cat, i) => {
  const row = 24 + i * 2;
  grid.rect("soil", 15, row, cat.techs.length, 1);
  place(`sign-${cat.kind}` as SpriteKey, 14.5, row + 1, {
    body: { w: 12, h: 6 },
    content: categoryContent(cat),
  });
  const base = CROP_ROW[cat.kind] * 2;
  cat.techs.forEach((tech, j) => {
    place("crops", 15.5 + j, row + 1, {
      frame: base,
      anim: { frames: [base, base + 1], fps: 1.2 },
      body: { w: 12, h: 5 },
      content: techContent(cat, tech),
    });
  });
});
kenney(KENNEY.beehive, 26.5, 24, { body: { w: 12, h: 8 } });
kenney(KENNEY.wheelbarrow, 22.5, 24, { body: { w: 14, h: 6 } });

// ── serra: montanhas por cima do chão de pedra (a pedra é que bloqueia) ──
// Ordem por profundidade (y): as de trás ficam mais no alto. Na faixa de
// baixo, nenhuma montanha passa da linha 22 para não cobrir a enseada.
const scenery = { body: false } as const;
const MOUNTAINS: [SpriteKey, number, number][] = [
  ["mountain-low", 1, 3],
  ["mountain-low-b", 7.5, 3.5],
  ["mountain-low", 7, 6.8],
  ["mountain-big", 4, 7],
  ["mountain-mid-b", 1.5, 9.5],
  ["mountain-low-b", 7, 10],
  ["mountain-big-b", 3.5, 13.5],
  ["mountain-mid", 3, 16],
  ["mountain-low", 2, 25],
  ["mountain-low-b", 6.5, 25.5],
  ["mountain-big-b", 4, 29],
  ["mountain-mid", 2, 32],
  ["mountain-mid-b", 6.5, 32],
];
// sem espelhar: a luz vem sempre da esquerda
for (const [sprite, x, y] of MOUNTAINS) place(sprite, x, y, scenery);
place("cave-entrance", 6.5, 17, { body: { w: 44, h: 10 }, content: CAVE });
place("waterfall", 3.5, 18, { ...scenery, anim: { frames: [0, 1, 2], fps: 8 } });
for (const [x, y] of [
  [0.8, 20],
  [1, 22.2],
  [8.5, 33.6],
  [1.5, 33.4],
])
  place("boulder", x, y, { body: { w: 24, h: 8 } });
for (const [x, y] of [
  [8.5, 21.6],
  [9.5, 16.8],
  [5.5, 33.8],
  [10.5, 32.8],
])
  place("rock-small", x, y, { body: { w: 10, h: 5 } });

// ── praia ──
place("lighthouse", 4, 38, { anim: { frames: [0, 1], fps: 1.4 }, body: { w: 22, h: 8 }, content: LIGHTHOUSE });
place("boat", 11.5, 38.7, { body: { w: 26, h: 8 } });
place("beach-towel", 21, 38.6, { layer: "floor", body: false });
place("beach-umbrella", 22.5, 38, { body: { w: 4, h: 4 } });
place("sandcastle", 26.5, 36.6, { body: { w: 12, h: 5 } });
place("shells", 8.5, 36.4, { body: false });
place("shells", 30.5, 39.2, { body: false });
place("starfish", 17.5, 36.5, { body: false });
place("starfish", 34.5, 40.4, { body: false });

// ── torre do mago ──
place("building-wizard", 61.5, 20, { anim: { frames: [0, 1], fps: 1.1 }, body: { w: 40, h: 16 }, content: WIZARD_TOWER });
for (const [x, y] of [
  [58.5, 15],
  [64.2, 13],
  [60, 23],
  [63.8, 18.5],
])
  place("magic-sparkle", x, y, { body: false, anim: { frames: [0, 1, 2, 1], fps: 3 + (x % 2) } });

// ── natureza ──
const blocked: [number, number, number, number][] = [
  // x, y, w, h (tiles) — prédios, praça e horta, onde não nascem árvores
  [12, 0, 12, 10],
  [48, 1, 9, 9],
  [46, 20, 10, 10],
  [27, 12, 16, 9],
  [12, 21, 17, 14],
  [57, 11, 8, 12],
];
function freeOn(tx: number, ty: number, ground: "grass" | "sand" = "grass"): boolean {
  if (grid.get(tx, ty) !== ground || grid.fences[ty]?.[tx]) return false;
  return !blocked.some(([bx, by, bw, bh]) => tx >= bx && tx < bx + bw && ty >= by && ty < by + bh);
}
const free = (x: number, y: number) => freeOn(Math.floor(x), Math.ceil(y) - 1);

type TreeKey = Extract<SpriteKey, `tree-${string}`>;

/** Pesos de cada árvore; zonas da vila somam pesos para dar personalidade a cada canto. */
const TREE_WEIGHTS: Partial<Record<TreeKey, number>> = {
  "tree-oak": 4,
  "tree-pine": 3,
  "tree-oak-autumn": 1,
  "tree-birch": 1,
  "tree-pine-dark": 1,
};
const TREE_ZONES: { area: [number, number, number, number]; add: Partial<Record<TreeKey, number>> }[] = [
  // em volta da horta: frutíferas
  { area: [9, 17, 32, 36], add: { "tree-apple": 4, "tree-orange": 4 } },
  // perto da NeuroKids e da praça: cerejeiras
  { area: [26, 2, 58, 23], add: { "tree-cherry": 3 } },
  // bosque oeste, no pé da serra
  { area: [9, 0, 27, 20], add: { "tree-birch": 3, "tree-pine-dark": 2 } },
  // em volta da torre do mago: mata fechada
  { area: [50, 9, 66, 31], add: { "tree-pine-dark": 4, "tree-birch": 1 } },
];

/** Sorteio determinístico por posição: mexer numa árvore não muda as outras. */
function pickTree(x: number, y: number): TreeKey {
  const weights = { ...TREE_WEIGHTS };
  for (const { area, add } of TREE_ZONES) {
    const [x0, y0, x1, y1] = area;
    if (x < x0 || x >= x1 || y < y0 || y >= y1) continue;
    for (const [k, w] of Object.entries(add) as [TreeKey, number][]) weights[k] = (weights[k] ?? 0) + w;
  }
  const entries = Object.entries(weights) as [TreeKey, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = hash(Math.round(x * 2), Math.round(y * 2), 3) * total;
  for (const [k, w] of entries) if ((r -= w) < 0) return k;
  return entries[0][0];
}

function tree(x: number, y: number, force = false): void {
  if (!force && !free(x, y)) return;
  place(pickTree(x, y), x, y, { body: { w: 10, h: 6 }, flipX: flip(x, y) });
}

function palm(x: number, y: number): void {
  if (!freeOn(Math.floor(x), Math.ceil(y) - 1, "sand")) return;
  place("tree-palm", x, y, { body: { w: 8, h: 5 }, flipX: flip(x, y) });
}

/** Carvalho antigo: precisa de 3x2 tiles livres em volta da base. */
function oldOak(x: number, y: number): void {
  const tx = Math.floor(x);
  const ty = Math.ceil(y) - 1;
  for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) if (!freeOn(tx + dx, ty + dy)) return;
  place("tree-oak-old", x, y, { body: { w: 18, h: 8 } });
}

// moldura de árvores: norte (a leste da serra), leste e sul (a leste da praia)
for (let x = 10; x < W; x += 2) if (x < 12 || x > 23) tree(x, 1.6, true);
for (let y = 3.5; y < H - 1; y += 2) tree(W - 0.8, y, true);
for (let x = 41; x < W - 1; x += 2) tree(x + 0.5, H - 0.2, true);

// bosques internos
const GROVES: [number, number][] = [
  // pé da serra
  [10.5, 3.5], [11, 7], [10, 13.5], [10.5, 24], [11, 28], [10, 31.5],
  // entre a Catsuc e o lago
  [24, 5], [27, 7.5], [23.5, 8.5], [28.5, 4],
  // entre o lago e a NeuroKids
  [42, 5], [45, 7.5], [46.5, 3.5], [43.5, 8.5],
  // bosque oeste
  [16, 14], [17, 16.5], [20.5, 14], [24, 17.5], [15.5, 19], [21, 18.5],
  // bosque leste
  [46, 14.5], [49.5, 16.5], [53, 14], [55.5, 16.5], [52, 19.5], [45, 18.5],
  // sul da praça
  [30.5, 25], [30, 29.5], [31, 33.5],
  [39.5, 23.5], [42.5, 26.5], [44.5, 22.5], [39, 28],
  [37.5, 34.5], [42, 33.8], [48, 34], [55.5, 33.5],
  [57, 24], [57.5, 28.5], [61, 25.5], [62.5, 29.5],
  // prado sudeste
  [41.5, 37.5], [44, 41.5], [52.5, 37.5], [55, 41.5], [58.5, 36.5], [61.5, 40.5], [47.5, 44], [58, 44.2], [62, 33.5],
];
GROVES.forEach(([x, y]) => tree(x, y));
oldOak(48.5, 40.5);

// coqueiros na areia
for (const [x, y] of [
  [8, 35.5], [17, 35.2], [24, 35.6], [29, 35.3], [33.5, 37.8], [38, 39.5], [37, 43.5], [1.5, 37.6],
])
  palm(x, y);

// tocos e troncos caídos
for (const [x, y] of [
  [11.5, 22.5], [44.5, 36.2], [56.5, 39], [25.5, 12.8], [60.5, 31.2],
])
  if (free(x, y)) place("stump", x, y, { body: { w: 10, h: 5 } });
for (const [x, y] of [
  [42.5, 44.4], [26, 16.6], [12, 15.8],
])
  if (free(x, y)) place("log-fallen", x, y, { body: { w: 24, h: 6 } });

// arbustos e cogumelos
for (const [x, y] of [
  [22.5, 12.5], [26.5, 12.5], [44.5, 12.5], [47.5, 12.5], [12.5, 9],
  [40.5, 9], [29.5, 8], [55.5, 21.5], [37.5, 33], [45.5, 29.5], [50.5, 42.5], [9.5, 25.5],
])
  if (free(x, y)) kenney(KENNEY.bushRound, x, y, { body: { w: 12, h: 6 } });
for (const [x, y] of [
  [25.5, 9], [43.5, 10], [18.5, 17.5], [54.5, 19], [10.5, 19.5], [59.5, 26.5],
])
  if (free(x, y)) kenney(KENNEY.mushrooms, x, y, { body: false });

const baked = bake(grid);

/** Paradas da câmera na tela inicial (centro da vista, em tiles). */
export const TITLE_TOUR: [number, number][] = [
  [34, 16],
  [18, 6],
  [6, 16],
  [12, 38],
  [50, 27],
  [60, 16],
];

export const VILLAGE: MapDef = {
  key: "village",
  name: "Vila do Nadson",
  width: W,
  height: H,
  ...baked,
  props,
  doors: [
    { x: 17, y: 8, w: 1, target: "catsuc" },
    { x: 52, y: 8, w: 1, target: "neurokids" },
    { x: 50, y: 28, w: 2, target: "school" },
  ],
  exits: [],
  spawns: {
    start: { x: 33.5, y: 19.6, facing: "up" },
    "from-catsuc": { x: 17.5, y: 9.8, facing: "down" },
    "from-neurokids": { x: 52.5, y: 9.8, facing: "down" },
    "from-school": { x: 51, y: 29.8, facing: "down" },
  },
};
