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
export function drawOak(f: Foliage, seed: number): Img {
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
  return img.outline(C.outline).shadow(16, 46, 11, 2.5);
}

/** Pinheiro 32x48 em três camadas. */
export function drawPine(seed: number): Img {
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
      img.hline(16 - hw, 16 + hw - 1, y, GREEN.dark);
      if (y < bottom - 1) img.hline(16 - hw + 1, 16 + hw - 3, y, GREEN.mid);
      if (y < bottom - 2 && hw > 3) img.hline(16 - hw + 2, 16 - 1, y, GREEN.light);
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 38);
    if (img.alpha(x, y) === 0) continue;
    img.set(x, y, rand() < 0.6 ? GREEN.dark : GREEN.shine);
  }
  return img.outline(C.outline).shadow(16, 46, 9, 2.5);
}

export function drawTrees(): Record<string, Img> {
  return {
    "tree-oak": drawOak(GREEN, 3),
    "tree-oak-autumn": drawOak(AUTUMN, 11),
    "tree-pine": drawPine(5),
  };
}
