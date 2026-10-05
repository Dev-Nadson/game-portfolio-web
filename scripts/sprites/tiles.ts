import { Img, rng } from "./draw";
import { C } from "./palette";
import { EDGE_PARTS, type CustomTile, type EdgePart, type EdgedTile } from "../../src/maps/tileset";

const T = 16;

/** Mesma cor do tile de grama do Kenney, para as bordas emendarem. */
const GRASS = "#84c669";

const B = 3; // largura da margem (lado de fora) nos tiles de borda

function outside(x: number, y: number): boolean {
  return x < 0 || y < 0 || x >= T || y >= T;
}

/** Lados de um tile de borda que encostam no terreno vizinho. */
interface Sides {
  n?: boolean;
  s?: boolean;
  w?: boolean;
  e?: boolean;
}

/** Forma da margem de um tile de borda: true = pixel do lado de fora. */
function sideShape(
  side: Sides,
  wobble: (x: number, y: number) => number,
  profile?: readonly number[]
): (x: number, y: number) => boolean {
  return (x, y) => {
    if (outside(x, y)) return false;
    // `profile` desenha a margem: o deslocamento segue x nas bordas de cima e
    // de baixo e y nas laterais, e repete a cada 16px para emendar os tiles
    const bx = B + wobble(x, y) + (profile?.[x] ?? 0);
    const by = B + wobble(x, y) + (profile?.[y] ?? 0);
    if (side.n && y < bx) return true;
    if (side.s && y >= T - bx) return true;
    if (side.w && x < by) return true;
    if (side.e && x >= T - by) return true;
    // arredonda os cantos externos
    const r = 4;
    const far = (cx: number, cy: number) => (x - cx) ** 2 + (y - cy) ** 2 > r * r;
    const lo = B + r;
    const hi = T - 1 - B - r;
    if (side.n && side.w && x < lo && y < lo && far(lo, lo)) return true;
    if (side.n && side.e && x > hi && y < lo && far(hi, lo)) return true;
    if (side.s && side.w && x < lo && y > hi && far(lo, hi)) return true;
    if (side.s && side.e && x > hi && y > hi && far(hi, hi)) return true;
    return false;
  };
}

/** Canto interno: só um quarto de círculo do vizinho num canto. */
function innerShape(cx: number, cy: number): (x: number, y: number) => boolean {
  return (x, y) => !outside(x, y) && (x - cx) ** 2 + (y - cy) ** 2 < 20;
}

/**
 * Estilo de um terreno com borda. Os pixels de dentro ganham as cores de
 * `rims` conforme a distância até a margem (1px, 2px) e o resto vem de
 * `fill`; os de fora são `outer`, com `bank` colado na borda.
 */
interface EdgeStyle {
  seed: number;
  fill: (x: number, y: number, rand: () => number) => string;
  outer: (x: number, y: number) => string;
  bank?: string;
  rims: (string | null)[];
  /** a margem pode ser irregular (±1px), como as bordas de caminho do Kenney */
  wobble?: boolean;
  /** contorno da margem ao longo do tile (16 valores, 0–3px), para bordas orgânicas */
  profile?: readonly number[];
  /** detalhes pintados por cima (ondinhas, rachaduras, face do penhasco) */
  detail?: (img: Img, isOut: (x: number, y: number) => boolean, side: Sides) => void;
}

/** Distância (1 ou 2) até a margem; a 2ª linha não aparece acima de margens de baixo (perspectiva). */
const RIM_OFFSETS: [number, number][][] = [
  [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
  [
    [0, -2],
    [-2, 0],
    [2, 0],
  ],
];

function edgedTile(isOut: (x: number, y: number) => boolean, style: EdgeStyle, side: Sides = {}): Img {
  const img = new Img(T, T);
  const rand = rng(style.seed);
  for (let y = 0; y < T; y++) {
    for (let x = 0; x < T; x++) {
      if (isOut(x, y)) {
        const touches = RIM_OFFSETS[0].some(([dx, dy]) => !outside(x + dx, y + dy) && !isOut(x + dx, y + dy));
        img.set(x, y, touches && style.bank ? style.bank : style.outer(x, y));
        continue;
      }
      const ring = RIM_OFFSETS.findIndex((offsets) => offsets.some(([dx, dy]) => isOut(x + dx, y + dy)));
      const rim = ring >= 0 ? style.rims[ring] : null;
      const base = style.fill(x, y, rand);
      img.set(x, y, rim ?? base);
    }
  }
  style.detail?.(img, isOut, side);
  return img;
}

/** Hash por pixel para margens irregulares que emendam entre tiles. */
function bump(x: number, y: number): number {
  const h = Math.imul(x * 73 + 11, 9301) ^ Math.imul(y * 29 + 7, 4973);
  return ((h >>> 3) & 7) === 0 ? 1 : 0;
}

/** As 13 peças de um terreno com borda (mesmo esquema do caminho de terra). */
function edgedSet(kind: EdgedTile, style: EdgeStyle): Record<`${EdgedTile}_${EdgePart}`, Img> {
  const wobble = style.wobble ? bump : () => 0;
  const shape = (side: Sides) => sideShape(side, wobble, style.profile);
  const parts: Record<EdgePart, Img> = {
    tl: edgedTile(shape({ n: true, w: true }), style, { n: true, w: true }),
    t: edgedTile(shape({ n: true }), style, { n: true }),
    tr: edgedTile(shape({ n: true, e: true }), style, { n: true, e: true }),
    l: edgedTile(shape({ w: true }), style, { w: true }),
    c: edgedTile(shape({}), style),
    r: edgedTile(shape({ e: true }), style, { e: true }),
    bl: edgedTile(shape({ s: true, w: true }), style, { s: true, w: true }),
    b: edgedTile(shape({ s: true }), style, { s: true }),
    br: edgedTile(shape({ s: true, e: true }), style, { s: true, e: true }),
    in_tl: edgedTile(innerShape(-1, -1), style),
    in_tr: edgedTile(innerShape(T, -1), style),
    in_bl: edgedTile(innerShape(-1, T), style),
    in_br: edgedTile(innerShape(T, T), style),
  };
  return Object.fromEntries(EDGE_PARTS.map((p) => [`${kind}_${p}`, parts[p]])) as Record<
    `${EdgedTile}_${EdgePart}`,
    Img
  >;
}

/** Ondinhas em pontos fixos do tile, só onde há água em volta. */
function ripples(points: [number, number][], color: string) {
  return (img: Img, isOut: (x: number, y: number) => boolean) => {
    for (const [wx, wy] of points) {
      if (!isOut(wx, wy) && !isOut(wx + 3, wy) && !isOut(wx, wy - 2) && !isOut(wx + 3, wy + 1)) {
        img.hline(wx, wx + 2, wy, color);
        img.set(wx + 3, wy - 1, color);
      }
    }
  };
}

const speckle =
  (base: string, dots: [string, number][]) =>
  (_x: number, _y: number, rand: () => number): string => {
    const r = rand();
    let acc = 0;
    for (const [color, p] of dots) {
      acc += p;
      if (r < acc) return color;
    }
    return base;
  };

/** Lago: margem de grama com barranco de terra. */
const WATER: EdgeStyle = {
  seed: 7,
  fill: speckle(C.water, [[C.waterLight, 0.04]]),
  outer: () => GRASS,
  bank: C.dirtDark,
  rims: [C.outline, C.waterLight],
  detail: ripples(
    [
      [3, 5],
      [10, 11],
    ],
    C.waterLight
  ),
};

/** Areia da praia: borda de grama irregular, como os caminhos do Kenney. */
const SAND: EdgeStyle = {
  seed: 21,
  fill: speckle(C.sand, [
    [C.sandDark, 0.03],
    [C.sandLight, 0.03],
  ]),
  outer: () => GRASS,
  bank: C.grassDeep,
  rims: [C.sandDark, null],
  wobble: true,
};

/** Mar, quadro A: espuma na beira e areia molhada. */
const SEA: EdgeStyle = {
  seed: 33,
  fill: speckle(C.sea, [[C.waterLight, 0.03]]),
  outer: () => C.sand,
  bank: C.sandDark,
  rims: [C.foam, C.waterLight],
  detail: ripples(
    [
      [3, 5],
      [10, 11],
    ],
    C.waterLight
  ),
};

/** Mar, quadro B: a espuma sobe 1px na areia e as ondinhas mudam de lugar. */
const SEA2: EdgeStyle = {
  ...SEA,
  seed: 34,
  bank: C.foam,
  rims: [C.waterLight, null],
  detail: ripples(
    [
      [8, 4],
      [2, 12],
    ],
    C.waterLight
  ),
};

/**
 * Chão de pedra da serra. A margem é orgânica (perfil irregular), sem
 * contorno duro: só uma linha de pedra escura por dentro, sombra e
 * pedrinhas soltas na grama. Ao sul, uma face curta de penhasco.
 */
const ROCK: EdgeStyle = {
  seed: 45,
  fill: speckle(C.rock, [
    [C.rockDark, 0.08],
    [C.rockLight, 0.06],
  ]),
  outer: () => GRASS,
  bank: C.grassDeep,
  rims: [C.rockDark, null],
  profile: [0, 1, 1, 2, 2, 1, 0, 0, 1, 2, 3, 2, 1, 1, 0, 0],
  detail: (img, isOut, side) => {
    const rand = rng(46);
    // pedrinhas soltas na grama, perto da margem
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(rand() * T);
      const y = Math.floor(rand() * T);
      if (!isOut(x, y)) continue;
      const near = [-2, -1, 1, 2].some((d) => !isOut(x + d, y) || !isOut(x, y + d));
      if (near && rand() < 0.35) img.set(x, y, rand() < 0.5 ? C.rock : C.rockDark);
    }
    if (!side.s) return;
    // face vertical do penhasco logo acima da grama
    for (let x = 0; x < T; x++) {
      let ground = T - 1;
      while (ground > 0 && isOut(x, ground)) ground--;
      if (isOut(x, ground)) continue;
      for (let k = 0; k < 5; k++) {
        const y = ground - k;
        if (y < 0 || isOut(x, y)) break;
        const c = k === 0 ? "#4a4458" : k === 4 ? C.rockDark : x % 5 === 2 ? C.rockDark : C.rockFace;
        img.set(x, y, c);
      }
    }
  },
};

/**
 * Ponte de madeira com 2 tiles de largura: tábuas na horizontal e, do
 * lado de fora de cada metade, viga escura com corrimão e postes.
 */
function bridge(side: "l" | "r"): Img {
  const img = new Img(T, T);
  for (let y = 0; y < T; y++) {
    const inRow = y % 4;
    const base = Math.floor(y / 4) % 2 ? C.wood : "#c97b55";
    img.hline(0, T - 1, y, inRow === 3 ? C.woodDark : inRow === 0 ? C.woodLight : base);
  }
  // pregos nas pontas das tábuas
  const nail = side === "l" ? 5 : 10;
  for (let y = 1; y < T; y += 4) img.set(nail, y + 1, C.outline);
  // viga, corrimão e postes do lado de fora
  const x0 = side === "l" ? 0 : T - 3;
  img.rect(x0, 0, 3, T, C.woodDark);
  img.vline(side === "l" ? 1 : T - 2, 0, T - 1, C.wood);
  for (const py of [2, 10]) {
    img.rect(x0, py, 3, 4, C.wood);
    img.hline(x0, x0 + 2, py, C.woodLight);
    img.hline(x0, x0 + 2, py + 3, C.outline);
  }
  // sombra da viga sobre as tábuas
  img.vline(side === "l" ? 3 : T - 4, 0, T - 1, "#00000030");
  return img;
}

function soil(): Img {
  const img = new Img(T, T);
  img.rect(0, 0, T, T, GRASS);
  img.rect(1, 1, 14, 14, C.soil);
  img.frame(1, 1, 14, 14, C.soilDark);
  for (const y of [4, 8, 12]) img.hline(3, 12, y, C.soilDark);
  for (const y of [3, 7, 11]) img.hline(3, 12, y, C.soilLight);
  [0, 15].forEach((x) => [0, 15].forEach((y) => img.set(x, y, GRASS)));
  return img;
}

function planks(base: string, light: string, dark: string, offset: number): Img {
  const img = new Img(T, T);
  img.rect(0, 0, T, T, base);
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    img.hline(0, 15, y, light);
    img.hline(0, 15, y + 3, dark);
    const seam = (row * 7 + offset) % 16;
    img.vline(seam, y, y + 3, dark);
  }
  return img;
}

function clinicFloor(): Img {
  const img = new Img(T, T);
  img.rect(0, 0, 8, 8, C.white).rect(8, 8, 8, 8, C.white);
  img.rect(8, 0, 8, 8, C.mint).rect(0, 8, 8, 8, C.mint);
  img.hline(0, 15, 15, "#a9d6c4").vline(15, 0, 15, "#a9d6c4");
  return img;
}

function parquet(flip: boolean): Img {
  const img = new Img(T, T);
  const a = C.dirtDark;
  const b = C.dirt;
  for (let q = 0; q < 4; q++) {
    const qx = (q % 2) * 8;
    const qy = Math.floor(q / 2) * 8;
    const horizontal = (q === 0 || q === 3) !== flip;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const stripe = horizontal ? Math.floor(j / 2) : Math.floor(i / 2);
        img.set(qx + i, qy + j, stripe % 2 === 0 ? a : b);
      }
    }
  }
  return img;
}

function wallTrim(): Img {
  const img = new Img(T, T);
  img.rect(0, 0, T, T, C.black);
  img.rect(0, 10, T, 6, C.outline);
  img.hline(0, 15, 13, C.woodDark);
  img.hline(0, 15, 15, C.wood);
  return img;
}

function wallpaper(kind: "office" | "clinic" | "school", lower: boolean): Img {
  const img = new Img(T, T);
  if (kind === "office") {
    img.rect(0, 0, T, T, C.stoneMid);
    img.vline(3, 0, 15, C.stone).vline(11, 0, 15, C.stone);
    img.vline(4, 0, 15, "#7a8aa3").vline(12, 0, 15, "#7a8aa3");
  } else if (kind === "clinic") {
    img.rect(0, 0, T, T, C.mint);
    const dots: [number, number, string][] = [
      [3, 3, C.pink],
      [11, 7, C.yellow],
      [5, 12, C.sky],
    ];
    for (const [x, y, c] of dots) img.rect(x, y, 2, 2, c);
  } else {
    img.rect(0, 0, T, T, C.cream);
    img.vline(7, 0, 15, "#f0b98a");
    img.vline(15, 0, 15, "#f0b98a");
  }
  if (lower) {
    // lambri + rodapé
    if (kind === "school") {
      img.rect(0, 6, T, 10, C.wood);
      img.hline(0, 15, 6, C.woodLight);
      img.vline(4, 7, 13, C.woodDark).vline(12, 7, 13, C.woodDark);
    }
    img.rect(0, 13, T, 3, C.woodDark);
    img.hline(0, 15, 13, C.wood);
  }
  return img;
}

function exitMat(): Img {
  const img = planks(C.wood, C.woodLight, C.woodDark, 3);
  img.rect(2, 3, 12, 10, C.red);
  img.frame(2, 3, 12, 10, C.outline);
  img.frame(3, 4, 10, 8, C.yellow);
  // seta para baixo
  img.hline(6, 9, 6, C.white).hline(7, 8, 7, C.white);
  img.hline(6, 9, 8, C.white).hline(7, 8, 9, C.white);
  return img;
}

export function drawCustomTiles(): Record<CustomTile, Img> {
  return {
    ...edgedSet("water", WATER),
    ...edgedSet("sand", SAND),
    ...edgedSet("sea", SEA),
    ...edgedSet("sea2", SEA2),
    ...edgedSet("rock", ROCK),
    pier_l: bridge("l"),
    pier_r: bridge("r"),
    soil: soil(),
    floor_wood_a: planks(C.wood, C.woodLight, C.woodDark, 0),
    floor_wood_b: planks(C.wood, C.woodLight, C.woodDark, 9),
    floor_clinic: clinicFloor(),
    floor_school_a: parquet(false),
    floor_school_b: parquet(true),
    wall_trim: wallTrim(),
    wall_office_top: wallpaper("office", false),
    wall_office_bottom: wallpaper("office", true),
    wall_clinic_top: wallpaper("clinic", false),
    wall_clinic_bottom: wallpaper("clinic", true),
    wall_school_top: wallpaper("school", false),
    wall_school_bottom: wallpaper("school", true),
    void: new Img(T, T).rect(0, 0, T, T, C.black),
    exit_mat: exitMat(),
  };
}
