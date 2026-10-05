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
 * Vila (mapa externo), 66x52 tiles.
 *
 *   O: serra (montanhas, caverna e cachoeira)   NO: prédio da Catsuc
 *   N: lago      NE: clínica NeuroKids          L: torre do mago
 *   centro: praça redonda (spawn)   SO: campo de flores e, abaixo, a praia
 *   com a ponte para a ilha do farol   SE: escola UNIFAVIP e a horta da stack
 *
 * Coordenadas em tiles. Props usam o centro-inferior do sprite:
 * um sprite de 16px na coluna c e linha r fica em (c + 0.5, r + 1).
 * Serra, mar e areia passam da borda do mapa: a câmera mostra o
 * horizonte, mas o jogador para na base da montanha e na beira d'água.
 */
const W = 66;
const H = 52;

const grid = new TerrainGrid(W, H, "grass");

// ── serra a oeste: chão de pedra (sólido) coberto por montanhas ──
// Faixa de 9 tiles com saliências de 1 tile, para a borda não ser reta
// (mais estreita, a grama sob as montanhas viraria andável).
grid.rect("rock", 0, 0, 9, 32);
grid.rect("rock", 9, 0, 1, 5).rect("rock", 9, 8, 1, 4).rect("rock", 9, 22, 1, 6);
// enseada da caverna, com o laguinho da cachoeira
grid.rect("grass", 2, 17, 7, 5);
grid.rect("water", 2, 17, 3, 2);

// ── praia, mar e a ilha do farol no canto sudoeste ──
grid.rect("sand", 0, 34, 36, H - 34).rect("sand", 36, 37, 4, H - 37);
grid.rect("sea", 0, 39, 32, H - 39).rect("sea", 32, 41, 4, H - 41);
// ilha de grama com uma faixa de areia em volta (inclusive nas diagonais);
// os retângulos extras arredondam o contorno
grid.rect("grass", 8, 42, 10, 7).rect("grass", 7, 43, 1, 5).rect("grass", 18, 43, 2, 4).rect("grass", 10, 49, 6, 1);
grid.ring("sand", "sea", "grass", [5, 40, 17, 12]);
// ponte da praia até a ilha
grid.rect("pier", 9, 39, 2, 3);

// campo de flores com a lagoinha no meio
grid.rect("meadow", 13, 22, 15, 12);
grid.rect("water", 15, 28, 5, 2).rect("water", 16, 27, 3, 1).rect("water", 16, 30, 3, 1);

// lago
grid.rect("water", 31, 2, 9, 5).rect("water", 33, 7, 5, 1);
// estrada principal (da caverna à torre do mago) e acessos às portas
grid.rect("path", 12, 10, 47, 2);
grid.rect("path", 16, 9, 3, 3); // Catsuc
grid.rect("path", 51, 9, 3, 3); // NeuroKids
// praça -> sul -> escola, e a descida para a praia
grid.rect("path", 33, 20, 4, 10);
grid.rect("path", 33, 30, 21, 2);
grid.rect("path", 49, 29, 4, 3);
grid.rect("path", 33, 32, 2, 2);
// praça -> campo de flores
grid.rect("path", 21, 20, 13, 2);
grid.rect("path", 21, 22, 2, 6);
// estrada -> caverna
grid.rect("path", 12, 12, 2, 9);
grid.rect("path", 6, 19, 8, 2);
grid.rect("path", 6, 17, 2, 2);
// estrada -> torre do mago
grid.rect("path", 57, 12, 2, 10);
grid.rect("path", 57, 20, 7, 2);

// horta cercada (no sudeste), com portão no topo e caminho até a estrada da escola
const GX = 46;
const GY = 34;
grid.rect("path", GX + 6, 32, 2, GY - 32 + 2);
grid.fenceRect(GX, GY, 15, 12, [
  [GX + 6, GY],
  [GX + 7, GY],
]);

const props: PropDef[] = [];
const place = (sprite: SpriteKey, x: number, y: number, extra: Partial<PropDef> = {}) =>
  props.push({ sprite, x, y, ...extra });
const kenney = (frame: number, x: number, y: number, extra: Partial<PropDef> = {}) =>
  props.push({ sprite: "kenney", frame, x, y, ...extra });
/** espelhamento determinístico por posição, para variar árvores */
const flip = (x: number, y: number) => hash(Math.round(x * 2), Math.round(y * 2), 7) < 0.5;
const scenery = { body: false } as const;

// ── prédios ──
place("building-catsuc", 17.5, 9, { body: { w: 124, h: 52 } });
place("building-neurokids", 52.5, 9, { body: { w: 108, h: 50 } });
place("building-school", 51, 29, { body: { w: 124, h: 54 } });
const signAt = (x: number, y: number, content: Content) =>
  kenney(KENNEY.sign, x, y, { body: { w: 12, h: 6 }, content });
signAt(15.5, 10, CATSUC_DOOR);
signAt(54.5, 10, NEUROKIDS_DOOR);
signAt(53.5, 30, SCHOOL_DOOR);

// ── praça redonda: piso de pedra (centro em 35, 16.2; raio 5) e objetos em anel ──
place("plaza-floor", 35, 21.2, { layer: "floor", body: false });
place("obj-well", 35, 17, { body: { w: 28, h: 12 } });
kenney(KENNEY.sign, 35, 19.1, { body: { w: 12, h: 6 }, content: WELCOME });
place("obj-bulletin", 32, 14.3, { body: { w: 28, h: 6 }, content: ABOUT });
place("obj-mailbox", 38.2, 14.2, { body: { w: 8, h: 5 }, content: CONTACT });
place("obj-signpost", 32.6, 20.3, { body: { w: 6, h: 5 }, content: LANGUAGES });
place("obj-bench", 35, 12.9, { body: { w: 28, h: 6 } });
place("obj-bench", 37.6, 20.4, { body: { w: 28, h: 6 } });
for (const x of [30.9, 39.1]) place("obj-flowerbed", x, 16.9, { body: { w: 14, h: 6 } });
for (const [x, y] of [
  [30.6, 13.9],
  [39.4, 13.9],
  [31, 19.2],
  [39, 19.2],
])
  place("obj-lamp", x, y, { body: { w: 6, h: 4 } });

// ── horta da stack ──
const CROP_ROW: Record<CropKind, number> = { backend: 0, frontend: 1, data: 2, ai: 3, devops: 4 };
STACK.forEach((cat, i) => {
  const row = GY + 2 + i * 2;
  grid.rect("soil", GX + 2, row, cat.techs.length, 1);
  place(`sign-${cat.kind}` as SpriteKey, GX + 1.5, row + 1, {
    body: { w: 12, h: 6 },
    content: categoryContent(cat),
  });
  const base = CROP_ROW[cat.kind] * 2;
  cat.techs.forEach((tech, j) => {
    place("crops", GX + 2.5 + j, row + 1, {
      frame: base,
      anim: { frames: [base, base + 1], fps: 1.2 },
      body: { w: 12, h: 5 },
      content: techContent(cat, tech),
    });
  });
});
kenney(KENNEY.beehive, GX + 13.5, GY + 2, { body: { w: 12, h: 8 } });
kenney(KENNEY.wheelbarrow, GX + 9.5, GY + 2, { body: { w: 14, h: 6 } });

// ── campo de flores (onde ficava a horta) ──
const FLOWER_KINDS = ["tulip", "daisy", "lavender", "buttercup", "poppy"] as const;
/** Espécie da mancha de flores em (x, y): blocos de ~4x3 que se misturam nas bordas. */
function flowerKind(x: number, y: number): (typeof FLOWER_KINDS)[number] {
  let px = Math.floor(x / 4);
  const py = Math.floor(y / 3);
  if (hash(x, y, 23) < 0.25) px += 1;
  return FLOWER_KINDS[Math.floor(hash(px, py, 13) * FLOWER_KINDS.length)];
}
const near = (x: number, y: number, t: string) =>
  [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].some(([dx, dy]) => grid.get(x + dx, y + dy) === t);
for (let y = 22; y <= 33; y++) {
  for (let x = 13; x <= 27; x++) {
    if (grid.get(x, y) !== "meadow") continue;
    // mais flores na beira da lagoa, menos junto dos caminhos
    let count = hash(x, y, 11) < 0.42 ? 0 : hash(x, y, 12) < 0.85 ? 1 : 2;
    if (near(x, y, "water") && hash(x, y, 14) < 0.5) count += 1;
    if (near(x, y, "path")) count -= 1;
    for (let k = 0; k < count; k++) {
      const jx = (hash(x, y, 17 + k) - 0.5) * 0.9;
      const jy = (hash(x, y, 19 + k) - 0.5) * 0.8;
      const variant = hash(x, y, 29 + k) < 0.5 ? "" : "-b";
      place(`flower-${flowerKind(x, y)}${variant}` as SpriteKey, x + 0.5 + jx, y + 1 + jy, { body: false });
    }
    if (hash(x, y, 31) < 0.15) {
      const g = hash(x, y, 37) < 0.5 ? "tall-grass" : "tall-grass-b";
      place(g, x + 0.5 + (hash(x, y, 41) - 0.5) * 0.8, y + 0.7, { body: false });
    }
  }
}
// lagoinha: vitórias-régias, taboas nas bordas e patinhos
for (const [x, y] of [
  [16.6, 29.2],
  [18.8, 30.4],
  [17.9, 28.2],
])
  place("lily-pad", x, y, { layer: "floor", body: false });
for (const [x, y] of [
  [15.5, 28.1],
  [19.5, 31.1],
  [14.6, 29.9],
  [20.4, 28.4],
])
  place("cattails", x, y, { body: false });
for (const [x, y, wx, ms] of [
  [17.2, 28.9, 1.2, 3200],
  [17.6, 30.3, -0.8, 2800],
])
  place("duck", x, y, { body: false, anim: { frames: [0, 1], fps: 2 }, wander: { x: wx, y: 0.25, ms } });
place("obj-bench", 21, 29.8, { body: { w: 28, h: 6 } });
for (const [sprite, x, y, wx, wy, ms] of [
  ["butterfly", 15, 24.5, 2, 0.8, 2600],
  ["butterfly-blue", 24.5, 29, -1.5, 1, 2200],
  ["butterfly", 19, 32.5, 2.5, -0.6, 3000],
  ["butterfly-blue", 26, 24, -2, 0.7, 2800],
  ["butterfly", 14.5, 31.5, 1.5, -1, 2400],
] as [SpriteKey, number, number, number, number, number][])
  place(sprite, x, y, { body: false, anim: { frames: [0, 1], fps: 8 }, wander: { x: wx, y: wy, ms } });

// ── serra: montanhas por cima do chão de pedra (a pedra é que bloqueia) ──
// Ordem por profundidade (y): as de trás ficam mais no alto. Na faixa de
// baixo, nenhuma montanha passa da linha 22 para não cobrir a enseada.
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
  ["mountain-low", 8, 24.6],
  ["mountain-low-b", 6.5, 25.5],
  ["mountain-low-b", 8.6, 27.6],
  ["mountain-big-b", 4, 29],
  ["mountain-mid", 2, 32],
  ["mountain-mid-b", 6.5, 32],
];
// sem espelhar: a luz vem sempre da esquerda
for (const [sprite, x, y] of MOUNTAINS) place(sprite, x, y, scenery);

// montículos de grama no pé da serra, suavizando a passagem para o campo;
// o colisor cobre só a parte que fica sobre a grama
const FOOTHILLS: [SpriteKey, number, number, { w: number; h: number; dx: number }][] = [
  ["foothill-b", 10.5, 7.2, { w: 56, h: 18, dx: 4 }],
  ["foothill-a", 9.6, 15.6, { w: 34, h: 16, dx: 7 }],
  ["foothill-a", 10, 24.6, { w: 24, h: 14, dx: 12 }],
  ["foothill-b", 11, 28, { w: 48, h: 16, dx: 8 }],
  ["foothill-a", 9.6, 31.4, { w: 34, h: 16, dx: 7 }],
  ["foothill-b", 3, 33.4, { w: 60, h: 20, dx: 0 }],
  ["foothill-a", 7, 33.2, { w: 44, h: 18, dx: 0 }],
];
for (const [sprite, x, y, body] of FOOTHILLS) place(sprite, x, y, { body });

// enseada: paredão com a boca da caverna e a cachoeira caindo na bacia
place("cliff-wall", 5, 17, scenery);
place("cave-entrance", 6.5, 17.01, { body: false, content: CAVE });
place("waterfall", 3.5, 19, { ...scenery, anim: { frames: [0, 1, 2], fps: 8 } });
for (const [x, y] of [
  [0.9, 20.3],
  [1.1, 22.5],
])
  place("boulder", x, y, { body: { w: 24, h: 8 } });
for (const [x, y] of [
  [8.5, 21.6],
  [9.5, 16.8],
  [10.5, 32.8],
  [9.4, 28.7],
])
  place("rock-small", x, y, { body: { w: 10, h: 5 } });

// ── praia ──
place("boat", 4.5, 38.6, { body: { w: 26, h: 8 } });
place("beach-towel", 21, 38.6, { layer: "floor", body: false });
place("beach-umbrella", 22.5, 38, { body: { w: 4, h: 4 } });
place("sandcastle", 26.5, 36.6, { body: { w: 12, h: 5 } });
place("shells", 13.5, 36.4, scenery);
place("shells", 30.5, 39.2, scenery);
place("starfish", 17.5, 36.5, scenery);
place("starfish", 34.5, 40.4, scenery);

// ── ilha do farol ──
place("lighthouse", 14.5, 47, { anim: { frames: [0, 1, 2, 3], fps: 2 }, body: { w: 52, h: 38 }, content: LIGHTHOUSE });
// estacas dos dois lados da ponte
for (const [x, y] of [
  [8.6, 39.9],
  [11.4, 39.9],
  [8.6, 41.9],
  [11.4, 41.9],
])
  place("piling", x, y, scenery);
// rochas no mar em volta da ilha
for (const [i, [x, y]] of [
  [13.5, 41.8],
  [17, 41.6],
  [5.8, 44.6],
  [6.3, 48.4],
  [20.8, 43.8],
  [20.2, 47.9],
  [8.6, 50.2],
  [12.5, 51.2],
  [16.6, 50.6],
  [18.6, 49.6],
].entries())
  place(i % 2 ? "sea-rock-b" : "sea-rock", x, y, scenery);
place("boulder", 17.4, 44, { body: { w: 24, h: 8 } });
place("rock-small", 17.8, 47.4, { body: { w: 10, h: 5 } });
// trilha de pedras da ponte até a frente do farol
for (const [x, y] of [
  [9.8, 43.6],
  [10.2, 44.7],
  [10.7, 45.8],
  [11.4, 46.9],
  [12.4, 47.8],
  [13.6, 48.2],
  [14.8, 48.3],
])
  place("stepping-stone", x, y, { layer: "floor", body: false });
// vegetação: arbustos, capim alto e flores na grama
for (const [x, y] of [
  [12.2, 43.4],
  [8.4, 46.2],
  [16.8, 48.6],
])
  kenney(KENNEY.bushRound, x, y, { body: { w: 12, h: 6 } });
for (const [sprite, x, y] of [
  ["tall-grass", 8.8, 44.2],
  ["tall-grass-b", 11.9, 45.2],
  ["flower-daisy", 12.3, 46.1],
  ["flower-poppy-b", 16.7, 46.3],
  ["flower-buttercup", 17.3, 45.4],
  ["tall-grass", 18.3, 46.2],
  ["flower-tulip-b", 9.2, 47.6],
  ["tall-grass-b", 15.2, 43.8],
] as [SpriteKey, number, number][])
  place(sprite, x, y, { body: false });

// ── torre do mago ──
place("building-wizard", 61.5, 20, { anim: { frames: [0, 1], fps: 1.1 }, body: { w: 40, h: 16 }, content: WIZARD_TOWER });
for (const [x, y] of [
  [58.5, 15],
  [64.2, 13],
  [60, 23],
  [63.8, 18.5],
])
  place("magic-sparkle", x, y, {
    body: false,
    anim: { frames: [0, 1, 2, 1], fps: 3 + (x % 2) },
    wander: { x: 0, y: -0.2, ms: 900 },
  });

// ── natureza ──
const blocked: [number, number, number, number][] = [
  // x, y, w, h (tiles) — prédios, praça, campo de flores, horta e o pé da serra
  [12, 0, 12, 10],
  [48, 1, 9, 9],
  [46, 20, 10, 10],
  [29, 10, 13, 13],
  [12, 21, 17, 14],
  [45, 33, 17, 14],
  [57, 11, 8, 12],
  [8, 4, 5, 4],
  [8, 12, 4, 5],
  [8, 22, 6, 7],
  [8, 28, 4, 5],
  [0, 30, 10, 5],
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
/** Zonas em [x0, y0, x1, y1] (cantos, não largura/altura como `blocked`). */
const TREE_ZONES: { area: [number, number, number, number]; add: Partial<Record<TreeKey, number>> }[] = [
  // em volta da horta: frutíferas
  { area: [38, 31, 66, 52], add: { "tree-apple": 4, "tree-orange": 4 } },
  // em volta do campo de flores: cerejeiras e bétulas
  { area: [9, 20, 31, 35], add: { "tree-cherry": 3, "tree-birch": 2 } },
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
for (let x = 10; x < W; x += 2) tree(x, 1.6, true);
for (let y = 3.5; y < H - 1; y += 2) tree(W - 0.8, y, true);
for (let x = 41; x < W - 1; x += 2) tree(x + 0.5, H - 0.2, true);

// bosques internos
const GROVES: [number, number][] = [
  // pé da serra
  [10.5, 3.5], [10.6, 12.6], [12, 29.8],
  // entre a Catsuc e o lago
  [24, 5], [27, 7.5], [23.5, 8.5], [28.5, 4],
  // entre o lago e a NeuroKids
  [42, 5], [45, 7.5], [46.5, 3.5], [43.5, 8.5],
  // bosque oeste
  [16, 14], [17, 16.5], [20.5, 14], [24, 17.5], [15.5, 19], [27.5, 18.5],
  // em volta do campo de flores
  [11, 25.5], [29.5, 23.5], [29.5, 28], [11.5, 33.2],
  // bosque leste
  [46, 14.5], [49.5, 16.5], [53, 14], [55.5, 16.5], [52, 19.5], [45, 18.5],
  // sul da praça
  [30.5, 31], [39.5, 23.5], [42.5, 26.5], [44.5, 22.5], [39, 28],
  [37.5, 34.5], [42, 33.8],
  [57, 24], [57.5, 28.5], [61, 25.5], [62.5, 29.5],
  // em volta da horta
  [41.5, 37.5], [44, 41.5], [62.5, 36], [63, 42], [62, 47.5], [57.5, 48.5], [52, 48], [47.5, 49.5], [40.5, 45],
];
GROVES.forEach(([x, y]) => tree(x, y));
oldOak(43.5, 48.5);

// coqueiros na areia
for (const [x, y] of [
  [8, 35.5], [17, 35.2], [24, 35.6], [29, 35.3], [33.5, 37.8], [38, 39.5], [37, 43.5], [1.5, 37.6], [38.5, 48.5],
  // ilha
  [7.6, 44.6], [19.4, 45.8], [17.6, 49.6], [8.6, 48.6],
])
  palm(x, y);

// tocos e troncos caídos
for (const [x, y] of [
  [11.5, 22.5], [44.5, 36.2], [25.5, 12.8], [60.5, 31.2], [55, 47],
])
  if (free(x, y)) place("stump", x, y, { body: { w: 10, h: 5 } });
for (const [x, y] of [
  [42.5, 44.4], [26, 16.6], [49, 46.8],
])
  if (free(x, y)) place("log-fallen", x, y, { body: { w: 24, h: 6 } });

// arbustos e cogumelos
for (const [x, y] of [
  [22.5, 12.5], [26.5, 12.5], [44.5, 12.5], [47.5, 12.5], [12.5, 9],
  [40.5, 9], [29.5, 8], [55.5, 21.5], [37.5, 33], [45.5, 29.5], [9.5, 25.5], [60.5, 50],
])
  if (free(x, y)) kenney(KENNEY.bushRound, x, y, { body: { w: 12, h: 6 } });
for (const [x, y] of [
  [25.5, 9], [43.5, 10], [18.5, 17.5], [54.5, 19], [10.5, 19.5], [59.5, 26.5],
])
  if (free(x, y)) kenney(KENNEY.mushrooms, x, y, { body: false });

const baked = bake(grid);

/** Paradas da câmera na tela inicial (centro da vista, em tiles). */
export const TITLE_TOUR: [number, number][] = [
  [35, 16],
  [18, 6],
  [6, 17],
  [13, 44],
  [20, 27],
  [53, 39],
  [60, 16],
];

/** Lugares com nome no minimapa e no mapa grande. */
const LANDMARKS: MapDef["landmarks"] = [
  { name: "Catsuc", x: 17.5, y: 7, color: "#2749f2" },
  { name: "NeuroKids", x: 52.5, y: 7, color: "#f28462" },
  { name: "UNIFAVIP", x: 51, y: 27, color: "#c34b35" },
  { name: "Praça", x: 35, y: 16.2, color: "#c0cbdc" },
  { name: "Campo de flores", x: 20, y: 25, color: "#ff8ac2" },
  { name: "Horta", x: 53, y: 40, color: "#9a4f3f" },
  { name: "Praia", x: 27, y: 37, color: "#fdbe53" },
  { name: "Farol", x: 14.5, y: 45, color: "#e84537" },
  { name: "Caverna", x: 6.5, y: 16, color: "#5c566a" },
  { name: "Torre do Mago", x: 61.5, y: 17, color: "#8f5bc9" },
];

export const VILLAGE: MapDef = {
  key: "village",
  name: "Vila do Nadson",
  width: W,
  height: H,
  ...baked,
  props,
  landmarks: LANDMARKS,
  doors: [
    { x: 17, y: 8, w: 1, target: "catsuc" },
    { x: 52, y: 8, w: 1, target: "neurokids" },
    { x: 50, y: 28, w: 2, target: "school" },
  ],
  exits: [],
  spawns: {
    start: { x: 35, y: 20.4, facing: "up" },
    "from-catsuc": { x: 17.5, y: 9.8, facing: "down" },
    "from-neurokids": { x: 52.5, y: 9.8, facing: "down" },
    "from-school": { x: 51, y: 29.8, facing: "down" },
  },
};
