import { Img, sheet } from "./draw";
import { C } from "./palette";

/**
 * Plantas da horta da stack: 16x32, 2 frames (balanço ao vento).
 * Linha da spritesheet = categoria, na ordem de CROP_ORDER.
 */
export const CROP_FRAME = { w: 16, h: 32 };
export const CROP_ORDER = ["backend", "frontend", "data", "ai", "devops"] as const;

function leaf(img: Img, x: number, y: number, dir: 1 | -1, len = 4) {
  for (let i = 0; i < len; i++) {
    img.set(x + i * dir, y - Math.floor(i / 2), C.grassDark);
    img.set(x + i * dir, y - Math.floor(i / 2) - 1, C.grass);
  }
}

function tomato(): Img {
  const img = new Img(16, 32);
  img.vline(11, 5, 30, C.wood).vline(12, 5, 30, C.woodDark);
  img.vline(7, 10, 30, C.grassDark);
  for (const [x, y] of [
    [7, 11],
    [6, 16],
    [8, 21],
    [6, 26],
  ]) {
    img.circle(x, y, 3, C.grassDark);
    img.circle(x - 0.5, y - 0.5, 2, C.grass);
  }
  for (const [x, y] of [
    [9, 14],
    [4, 19],
    [10, 24],
  ]) {
    img.circle(x, y, 2, C.red);
    img.set(x - 1, y - 1, C.salmon);
    img.set(x, y - 2, C.grassDark);
  }
  return img;
}

function sunflower(): Img {
  const img = new Img(16, 32);
  img.vline(8, 12, 30, C.grassDark).vline(7, 14, 30, C.grass);
  leaf(img, 8, 22, 1, 5);
  leaf(img, 7, 26, -1, 5);
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    img.circle(8 + Math.cos(ang) * 4, 8 + Math.sin(ang) * 4, 2, C.yellow);
  }
  img.circle(8, 8, 3, C.orange);
  img.circle(8, 8, 2, C.woodDark);
  img.set(7, 7, C.wood);
  return img;
}

function blueberry(): Img {
  const img = new Img(16, 32);
  img.ellipse(8, 24, 7, 6, C.grassDark);
  img.ellipse(7, 23, 5.5, 4.5, C.grass);
  img.set(5, 21, C.leaf).set(9, 20, C.leaf);
  for (const [x, y] of [
    [4, 24],
    [7, 26],
    [11, 23],
    [9, 21],
    [12, 27],
    [3, 27],
  ]) {
    img.rect(x, y, 2, 2, "#35599a");
    img.set(x, y, "#7fa8e0");
  }
  return img;
}

function crystalFlower(): Img {
  const img = new Img(16, 32);
  img.vline(8, 13, 30, C.grassDark);
  leaf(img, 8, 24, 1, 5);
  leaf(img, 8, 27, -1, 4);
  // pétalas de cristal
  img.ellipse(8, 5, 2, 4, C.purple);
  img.ellipse(3, 10, 3.5, 2, C.purple);
  img.ellipse(13, 10, 3.5, 2, C.purple);
  img.ellipse(8, 14, 2, 2.5, C.purple);
  img.set(8, 3, C.purpleLight).set(2, 10, C.purpleLight).set(13, 9, C.purpleLight);
  img.circle(8, 10, 2.5, C.purpleLight);
  img.rect(7, 9, 2, 2, C.white);
  return img;
}

function corn(): Img {
  const img = new Img(16, 32);
  img.vline(7, 2, 30, C.grassDark).vline(8, 3, 30, C.grass);
  leaf(img, 8, 12, 1, 6);
  leaf(img, 7, 17, -1, 6);
  leaf(img, 8, 25, 1, 6);
  leaf(img, 7, 28, -1, 5);
  for (const [x, y] of [
    [10, 15],
    [3, 20],
  ]) {
    img.ellipse(x + 1.5, y + 3, 1.8, 3.5, C.yellow);
    img.set(x + 1, y + 1, "#fff3b0");
    img.vline(x, y + 3, y + 7, C.grass);
    img.vline(x + 3, y + 3, y + 7, C.grass);
  }
  img.set(7, 1, C.woodLight).set(8, 0, C.woodLight);
  return img;
}

/** Frame 2: a metade de cima inclina 1px, como se o vento passasse. */
function sway(img: Img, cut: number): Img {
  const out = new Img(img.w, img.h);
  const bottom = new Img(img.w, img.h);
  const top = new Img(img.w, img.h);
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const i = (y * img.w + x) * 4;
      if (img.data[i + 3] === 0) continue;
      const target = y < cut ? top : bottom;
      target.data.set(img.data.subarray(i, i + 4), i);
    }
  }
  out.blit(bottom, 0, 0).blit(top, 1, 0);
  return out;
}

export function drawCrops(): Img {
  const kinds: Record<(typeof CROP_ORDER)[number], () => Img> = {
    backend: tomato,
    frontend: sunflower,
    data: blueberry,
    ai: crystalFlower,
    devops: corn,
  };
  const frames = CROP_ORDER.flatMap((k) => {
    const base = kinds[k]();
    return [base.clone().outline(C.outline), sway(base, 20).outline(C.outline)];
  });
  return sheet(frames, 2);
}
