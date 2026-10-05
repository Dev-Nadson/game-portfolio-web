import { Img, rng } from "./draw";
import { C } from "./palette";

interface Foliage {
  dark: string;
  mid: string;
  light: string;
  shine: string;
}

const GREEN: Foliage = { dark: "#2f7a43", mid: C.grassDark, light: C.grass, shine: C.leaf };
const AUTUMN: Foliage = { dark: "#b5541f", mid: C.orange, light: C.yellow, shine: "#ffe08a" };
const CHERRY: Foliage = { dark: "#c2577e", mid: "#ec7dab", light: "#ffaed0", shine: "#ffe1ee" };
const SPRING: Foliage = { dark: "#479f4a", mid: "#6cbf55", light: "#9ad86f", shine: "#c6ef94" };
const DEEP: Foliage = { dark: "#1d5536", mid: "#2f7a43", light: C.grassDark, shine: "#65a556" };

interface OakExtras {
  /** cor dos frutos espalhados pela copa (macieira, laranjeira) */
  fruit?: string;
  /** pétalas caídas em volta do tronco (cerejeira) */
  petals?: string;
}

function trunk(img: Img, cx: number, top: number, bottom: number): void {
  img.rect(cx - 3, top, 6, bottom - top, C.wood);
  img.vline(cx - 3, top, bottom - 1, C.woodDark);
  img.vline(cx + 1, top + 2, bottom - 3, C.woodDark);
  img.vline(cx - 1, top + 1, bottom - 2, C.woodLight);
  // raízes
  img.rect(cx - 5, bottom - 2, 2, 2, C.wood);
  img.rect(cx + 3, bottom - 2, 2, 2, C.wood);
  img.hline(cx - 5, cx + 4, bottom - 1, C.woodDark);
}

/** Carvalho 32x48 com copa em "nuvens", no espírito das árvores do Stardew. */
export function drawOak(f: Foliage, seed: number, extras: OakExtras = {}): Img {
  const img = new Img(32, 48);
  const rand = rng(seed);
  trunk(img, 16, 30, 46);

  const blobs: [number, number, number][] = [
    [16, 14, 11],
    [8, 20, 7.5],
    [24, 20, 7.5],
    [11, 27, 7],
    [21, 27, 7],
    [16, 24, 9],
  ];
  for (const [x, y, r] of blobs) img.circle(x, y, r, f.dark);
  for (const [x, y, r] of blobs) img.circle(x - 1, y - 1, r - 1.5, f.mid);
  img.circle(13, 11, 6, f.light);
  img.circle(7, 18, 3.5, f.light);
  img.circle(21, 17, 3, f.light);
  img.circle(11, 9, 2.5, f.shine);

  // textura de folhas
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 34);
    if (img.alpha(x, y) === 0 || img.alpha(x, y + 1) === 0) continue;
    img.set(x, y, rand() < 0.5 ? f.dark : f.light);
  }
  if (extras.fruit) fruits(img, rand, extras.fruit, 9, 34);
  img.outline(C.outline).shadow(16, 46, 11, 2.5);
  if (extras.petals) petals(img, rand, extras.petals, 16, 46);
  return img;
}

/** Frutos 2x2 com brilho, só onde há copa em volta. */
function fruits(img: Img, rand: () => number, color: string, count: number, maxY: number): void {
  for (let placed = 0, tries = 0; placed < count && tries < 200; tries++) {
    const x = 3 + Math.floor(rand() * (img.w - 6));
    const y = 3 + Math.floor(rand() * (maxY - 6));
    const inside = [-1, 0, 1, 2].every((d) => img.alpha(x + d, y - 1) > 0 && img.alpha(x + d, y + 2) > 0);
    if (!inside) continue;
    img.rect(x, y, 2, 2, color).set(x, y, "#ffffffb0");
    placed++;
  }
}

/** Pétalas soltas no chão, ao redor da base. */
function petals(img: Img, rand: () => number, color: string, cx: number, base: number): void {
  for (let i = 0; i < 14; i++) {
    const x = Math.round(cx + (rand() - 0.5) * 26);
    const y = Math.round(base - 1 + rand() * 2);
    if (img.alpha(x, y) === 0 || img.data[(y * img.w + x) * 4 + 3] < 255) img.set(x, y, color);
  }
}

/** Bétula 32x48: tronco branco com manchas e copa clara e esguia. */
export function drawBirch(seed: number): Img {
  const img = new Img(32, 48);
  const rand = rng(seed);
  const bark = "#efeadf";
  const barkShade = "#c9c1b0";
  img.rect(14, 16, 4, 30, bark);
  img.vline(17, 16, 45, barkShade);
  for (let y = 19; y < 45; y += 4) {
    const x = y % 8 === 3 ? 14 : 15;
    img.hline(x, x + 1, y, C.outline);
  }
  img.rect(12, 44, 2, 2, bark).rect(18, 44, 2, 2, barkShade);
  // galhos finos
  img.line(14, 24, 10, 20, barkShade).line(17, 21, 21, 17, barkShade);

  const blobs: [number, number, number, number][] = [
    // x, y, raio x, raio y
    [16, 10, 7, 8],
    [10, 18, 5.5, 7],
    [22, 17, 5.5, 7],
    [16, 22, 6, 6],
  ];
  for (const [x, y, rx, ry] of blobs) img.ellipse(x, y, rx, ry, SPRING.dark);
  for (const [x, y, rx, ry] of blobs) img.ellipse(x - 1, y - 1, rx - 1.5, ry - 1.5, SPRING.mid);
  img.ellipse(13, 7, 4, 4.5, SPRING.light);
  img.ellipse(8, 15, 2.5, 3, SPRING.light);
  img.set(12, 5, SPRING.shine).set(13, 5, SPRING.shine);
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 28);
    if (img.alpha(x, y) === 0 || img.alpha(x, y + 1) === 0) continue;
    img.set(x, y, rand() < 0.5 ? SPRING.dark : SPRING.light);
  }
  return img.outline(C.outline).shadow(16, 46, 8, 2);
}

/** Carvalho antigo 48x64: tronco grosso, raízes e copa larga — um marco da vila. */
export function drawOldOak(seed: number): Img {
  const img = new Img(48, 64);
  const rand = rng(seed);
  // tronco
  img.rect(19, 38, 10, 24, C.wood);
  img.vline(19, 38, 61, C.woodDark).vline(20, 40, 60, C.woodDark);
  img.vline(23, 39, 60, C.woodLight).vline(26, 42, 58, C.woodDark);
  // raízes
  img.rect(14, 58, 6, 4, C.wood).rect(28, 58, 6, 4, C.wood);
  img.rect(11, 60, 4, 2, C.wood).rect(33, 60, 4, 2, C.wood);
  img.hline(11, 36, 61, C.woodDark);
  // oco no tronco
  img.ellipse(24, 50, 2, 3, C.outline);

  const blobs: [number, number, number][] = [
    [24, 16, 14],
    [11, 24, 9],
    [37, 24, 9],
    [15, 35, 9],
    [33, 35, 9],
    [24, 30, 12],
    [24, 8, 8],
  ];
  for (const [x, y, r] of blobs) img.circle(x, y, r, DEEP.dark);
  for (const [x, y, r] of blobs) img.circle(x - 1, y - 1, r - 2, DEEP.mid);
  img.circle(19, 11, 7, DEEP.light);
  img.circle(9, 21, 4, DEEP.light);
  img.circle(30, 18, 4, DEEP.light);
  img.circle(16, 9, 3, DEEP.shine);
  for (let i = 0; i < 140; i++) {
    const x = Math.floor(rand() * 48);
    const y = Math.floor(rand() * 44);
    if (img.alpha(x, y) === 0 || img.alpha(x, y + 1) === 0) continue;
    img.set(x, y, rand() < 0.5 ? DEEP.dark : DEEP.light);
  }
  return img.outline(C.outline).shadow(24, 61, 16, 3);
}

/** Coqueiro 32x48: tronco curvo em gomos, folhas caídas e cocos. */
export function drawPalm(seed: number): Img {
  const img = new Img(32, 48);
  const rand = rng(seed);
  const barkA = "#c58b54";
  const barkB = "#9c6a3e";
  // tronco: curva suave da base (14, 46) até a copa (18, 13)
  for (let y = 46; y >= 13; y--) {
    const t = (46 - y) / 33;
    const x = Math.round(14 + 4 * t * t);
    const band = Math.floor(y / 3) % 2 === 0;
    img.hline(x - 2, x + 2, y, band ? barkA : barkB);
    img.set(x + 2, y, barkB);
    if (band) img.set(x - 1, y, "#dba873");
  }
  img.hline(11, 17, 46, barkB);
  // folhas: arcos grossos que saem do topo e caem, com franjas embaixo
  const top = { x: 18, y: 12 };
  const fronds: [number, number][] = [
    // alcance em x, quanto cai na ponta
    [-15, 10],
    [-11, 15],
    [15, 10],
    [11, 15],
    [8, -3],
    [-8, -3],
    [1, -7],
  ];
  for (const [dx, drop] of fronds) {
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(top.x + dx * t);
      const y = Math.round(top.y - 6 * t + (drop + 6) * t * t);
      // folha mais larga no meio, fina nas pontas
      const w = Math.round(1 + 2.6 * Math.sin(Math.PI * Math.min(1, t * 1.15)));
      img.vline(x, y - w, y + 1, GREEN.mid);
      img.set(x, y - w, GREEN.light);
      img.set(x, y + 1, GREEN.dark);
      if (i % 3 === 2 && t > 0.25) img.set(x, y + 2, GREEN.dark);
    }
  }
  // cocos
  for (const [x, y] of [
    [16, 14],
    [19, 15],
    [17, 16],
  ])
    img.circle(x, y, 1.7, C.woodDark);
  img.set(16, 13, C.wood).set(19, 14, C.wood);
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 30);
    if (img.alpha(x, y) > 0 && img.alpha(x, y + 1) > 0 && img.alpha(x, y - 1) > 0) img.set(x, y, GREEN.shine);
  }
  return img.outline(C.outline).shadow(14, 46, 8, 2);
}

/** Toco 16x16 com anéis. */
export function drawStump(): Img {
  const img = new Img(16, 16);
  img.rect(3, 6, 10, 8, C.wood);
  img.vline(3, 6, 13, C.woodDark).vline(12, 6, 13, C.woodDark).vline(6, 8, 13, C.woodDark);
  img.rect(1, 12, 3, 2, C.wood).rect(12, 12, 3, 2, C.wood);
  img.ellipse(7.5, 6, 5, 2.5, C.woodLight);
  img.ellipse(7.5, 6, 3, 1.4, C.cream);
  img.set(7, 6, C.wood).set(8, 6, C.wood);
  img.set(4, 10, C.grassDark).set(5, 11, C.grass);
  return img.outline(C.outline).shadow(8, 14, 6, 1.2);
}

/** Tronco caído 32x16, com musgo. */
export function drawLog(): Img {
  const img = new Img(32, 16);
  img.rect(4, 4, 25, 9, C.wood);
  img.hline(4, 28, 4, C.woodLight).hline(4, 28, 12, C.woodDark);
  for (const x of [9, 15, 22]) img.vline(x, 6, 10, C.woodDark);
  img.ellipse(4, 8, 3, 4.5, C.woodLight);
  img.ellipse(4, 8, 1.6, 2.6, C.cream);
  img.set(4, 8, C.wood);
  for (const [x, y] of [
    [12, 4],
    [13, 4],
    [18, 4],
    [25, 5],
    [26, 4],
  ])
    img.set(x, y, C.grassDark);
  img.set(12, 3, C.grass).set(25, 3, C.grass);
  return img.outline(C.outline).shadow(16, 13, 13, 1.5);
}

/** Pinheiro 32x48 em três camadas. */
export function drawPine(seed: number, f: Foliage = GREEN): Img {
  const img = new Img(32, 48);
  const rand = rng(seed);
  trunk(img, 16, 36, 46);

  const tiers: [number, number, number][] = [
    // topo, base, meia-largura na base
    [2, 18, 8],
    [10, 28, 11],
    [18, 38, 14],
  ];
  for (const [top, bottom, half] of tiers) {
    for (let y = top; y <= bottom; y++) {
      const t = (y - top) / (bottom - top);
      const hw = Math.round(1 + t * (half - 1));
      img.hline(16 - hw, 16 + hw - 1, y, f.dark);
      if (y < bottom - 1) img.hline(16 - hw + 1, 16 + hw - 3, y, f.mid);
      if (y < bottom - 2 && hw > 3) img.hline(16 - hw + 2, 16 - 1, y, f.light);
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 38);
    if (img.alpha(x, y) === 0) continue;
    img.set(x, y, rand() < 0.6 ? f.dark : f.shine);
  }
  return img.outline(C.outline).shadow(16, 46, 9, 2.5);
}

export function drawTrees(): Record<string, Img> {
  return {
    "tree-oak": drawOak(GREEN, 3),
    "tree-oak-autumn": drawOak(AUTUMN, 11),
    "tree-apple": drawOak(GREEN, 17, { fruit: C.redLight }),
    "tree-orange": drawOak(SPRING, 23, { fruit: "#e8641a" }),
    "tree-cherry": drawOak(CHERRY, 29, { petals: "#ffaed0" }),
    "tree-birch": drawBirch(31),
    "tree-oak-old": drawOldOak(37),
    "tree-pine": drawPine(5),
    "tree-pine-dark": drawPine(41, DEEP),
    "tree-palm": drawPalm(43),
    stump: drawStump(),
    "log-fallen": drawLog(),
  };
}
