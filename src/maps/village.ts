import type { Content, MapDef, PropDef } from "../types";
import type { SpriteKey } from "../assets/sprites.gen";
import { TerrainGrid, bake } from "./terrain";
import { KENNEY } from "./tileset";
import { ABOUT, CONTACT, LANGUAGES, WELCOME } from "../data/profile";
import { CATSUC_DOOR } from "../data/catsuc";
import { NEUROKIDS_DOOR } from "../data/neurokids";
import { SCHOOL_DOOR } from "../data/education";
import { STACK, categoryContent, techContent, type CropKind } from "../data/stack";

/**
 * Vila (mapa externo), 50x36 tiles.
 *
 *   NO: escritório Catsuc      N: lago      NE: clínica NeuroKids
 *   O:  bosque                 centro: praça (spawn)
 *   SO: horta da stack                      SE: escola UNIFAVIP
 *
 * Coordenadas em tiles. Props usam o centro-inferior do sprite:
 * um sprite de 16px na coluna c e linha r fica em (c + 0.5, r + 1).
 */
const W = 50;
const H = 36;

const grid = new TerrainGrid(W, H, "grass");

// lago
grid.rect("water", 21, 2, 9, 5).rect("water", 23, 7, 5, 1);
// estrada principal e acessos às portas
grid.rect("path", 3, 10, 44, 2);
grid.rect("path", 6, 9, 3, 3); // Catsuc
grid.rect("path", 41, 9, 3, 3); // NeuroKids
grid.rect("path", 23, 12, 4, 1); // estrada -> praça
// praça
grid.rect("plaza", 18, 13, 14, 7);
// praça -> sul -> escola
grid.rect("path", 23, 20, 4, 10);
grid.rect("path", 23, 30, 21, 2);
grid.rect("path", 39, 29, 4, 3);
// praça -> horta
grid.rect("path", 8, 20, 15, 2);
grid.rect("path", 9, 20, 2, 4);
// horta cercada com portão no topo
grid.fenceRect(3, 22, 15, 12, [
  [9, 22],
  [10, 22],
]);

const props: PropDef[] = [];
const place = (sprite: SpriteKey, x: number, y: number, extra: Partial<PropDef> = {}) =>
  props.push({ sprite, x, y, ...extra });
const kenney = (frame: number, x: number, y: number, extra: Partial<PropDef> = {}) =>
  props.push({ sprite: "kenney", frame, x, y, ...extra });

// ── prédios ──
place("building-catsuc", 7.5, 9, { body: { w: 110, h: 58 } });
place("building-neurokids", 42.5, 9, { body: { w: 108, h: 50 } });
place("building-school", 41, 29, { body: { w: 124, h: 54 } });
const signAt = (x: number, y: number, content: Content) =>
  kenney(KENNEY.sign, x, y, { body: { w: 12, h: 6 }, content });
signAt(5.5, 10, CATSUC_DOOR);
signAt(44.5, 10, NEUROKIDS_DOOR);
signAt(43.5, 30, SCHOOL_DOOR);

// ── praça ──
kenney(KENNEY.sign, 23.5, 18, { body: { w: 12, h: 6 }, content: WELCOME });
place("obj-well", 25, 17, { body: { w: 28, h: 12 } });
place("obj-bulletin", 21, 15, { body: { w: 28, h: 6 }, content: ABOUT });
place("obj-mailbox", 29.5, 15, { body: { w: 8, h: 5 }, content: CONTACT });
place("obj-signpost", 19.5, 20, { body: { w: 6, h: 5 }, content: LANGUAGES });
for (const [x, y] of [
  [18.5, 14],
  [31.5, 14],
  [31.5, 20],
])
  place("obj-lamp", x, y, { body: { w: 6, h: 4 } });
place("obj-bench", 28, 20, { body: { w: 28, h: 6 } });
place("obj-bench", 28, 13.5, { body: { w: 28, h: 6 } });
for (const x of [19.5, 30.5]) place("obj-flowerbed", x, 17, { body: { w: 14, h: 6 } });

// ── horta da stack ──
const CROP_ROW: Record<CropKind, number> = { backend: 0, frontend: 1, data: 2, ai: 3, devops: 4 };
STACK.forEach((cat, i) => {
  const row = 24 + i * 2;
  grid.rect("soil", 5, row, cat.techs.length, 1);
  place(`sign-${cat.kind}` as SpriteKey, 4.5, row + 1, {
    body: { w: 12, h: 6 },
    content: categoryContent(cat),
  });
  const base = CROP_ROW[cat.kind] * 2;
  cat.techs.forEach((tech, j) => {
    place("crops", 5.5 + j, row + 1, {
      frame: base,
      anim: { frames: [base, base + 1], fps: 1.2 },
      body: { w: 12, h: 5 },
      content: techContent(cat, tech),
    });
  });
});
kenney(KENNEY.beehive, 16.5, 24, { body: { w: 12, h: 8 } });
kenney(KENNEY.wheelbarrow, 12.5, 24, { body: { w: 14, h: 6 } });

// ── natureza ──
const blocked: [number, number, number, number][] = [
  // x, y, w, h (tiles) — prédios e praça, onde não nascem árvores
  [3, 1, 9, 9],
  [38, 1, 9, 9],
  [36, 20, 10, 10],
  [17, 12, 16, 9],
  [2, 21, 17, 14],
];
function free(tx: number, ty: number): boolean {
  if (grid.get(tx, ty) !== "grass" || grid.fences[ty]?.[tx]) return false;
  return !blocked.some(([bx, by, bw, bh]) => tx >= bx && tx < bx + bw && ty >= by && ty < by + bh);
}

const TREES: SpriteKey[] = ["tree-oak", "tree-pine", "tree-oak", "tree-pine", "tree-oak-autumn"];
let treeCount = 0;
function tree(x: number, y: number, force = false): void {
  const tx = Math.floor(x);
  const ty = Math.ceil(y) - 1;
  if (!force && !free(tx, ty)) return;
  place(TREES[treeCount++ % TREES.length], x, y, { body: { w: 10, h: 6 } });
}

// moldura de árvores na borda do mapa
for (let x = 1; x < W; x += 2) {
  tree(x, 1.6, true);
  tree(x + 0.5, H - 0.2, true);
}
for (let y = 3.5; y < H - 1; y += 2) {
  tree(0.8, y, true);
  tree(W - 0.8, y, true);
}
// bosques internos
const GROVES: [number, number][] = [
  [14, 5], [17, 7.5], [13, 8.5], [18.5, 4],
  [32, 5], [35, 7.5], [36.5, 3.5], [33.5, 8.5],
  [4, 14], [7, 16.5], [10.5, 14], [14, 17.5], [3.5, 19], [11, 18.5],
  [36, 14.5], [39.5, 16.5], [43, 14], [46, 17], [42, 19.5], [35, 18.5],
  [20.5, 25], [20, 29.5], [21, 33.5],
  [29.5, 23.5], [32.5, 26.5], [34.5, 22.5], [29, 28],
  [26.5, 34], [32, 34], [38, 34], [45.5, 33.5],
  [47, 24], [47.5, 28.5],
];
GROVES.forEach(([x, y]) => tree(x, y));

// arbustos e cogumelos
for (const [x, y] of [
  [12.5, 12.5], [16.5, 12.5], [34.5, 12.5], [37.5, 12.5], [2.5, 9],
  [30.5, 9], [19.5, 8], [45.5, 21.5], [27.5, 33], [35.5, 29.5],
])
  if (free(Math.floor(x), Math.ceil(y) - 1)) kenney(KENNEY.bushRound, x, y, { body: { w: 12, h: 6 } });
for (const [x, y] of [
  [15.5, 9], [33.5, 10], [8.5, 17.5], [44.5, 19],
])
  if (free(Math.floor(x), Math.ceil(y) - 1)) kenney(KENNEY.mushrooms, x, y, { body: false });

const baked = bake(grid);

export const VILLAGE: MapDef = {
  key: "village",
  name: "Vila do Nadson",
  width: W,
  height: H,
  ...baked,
  props,
  doors: [
    { x: 7, y: 8, w: 1, target: "catsuc" },
    { x: 42, y: 8, w: 1, target: "neurokids" },
    { x: 40, y: 28, w: 2, target: "school" },
  ],
  exits: [],
  spawns: {
    start: { x: 23.5, y: 19.6, facing: "up" },
    "from-catsuc": { x: 7.5, y: 9.8, facing: "down" },
    "from-neurokids": { x: 42.5, y: 9.8, facing: "down" },
    "from-school": { x: 41, y: 29.8, facing: "down" },
  },
};
