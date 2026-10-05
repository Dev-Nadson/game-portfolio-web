import { Img } from "./draw";
import { C } from "./palette";

/**
 * Peças de interface. As molduras são usadas como 9-slice pelo Phaser
 * (bordas de 6px), escaladas 3x para ter o mesmo tamanho de pixel do mundo.
 */
export const UI_SLICE = 6;

function woodFrame(size: number, fill: string, inner: string): Img {
  const img = new Img(size, size);
  const s = size;
  img.rect(0, 0, s, s, C.outline);
  img.rect(1, 1, s - 2, s - 2, C.wood);
  img.hline(2, s - 3, 1, C.woodLight);
  img.vline(1, 2, s - 3, C.woodLight);
  img.hline(2, s - 3, s - 2, C.woodDark);
  img.vline(s - 2, 2, s - 3, C.woodDark);
  img.rect(4, 4, s - 8, s - 8, inner);
  img.rect(5, 5, s - 10, s - 10, fill);
  // cantos arredondados
  for (const [x, y] of [
    [0, 0],
    [s - 1, 0],
    [0, s - 1],
    [s - 1, s - 1],
  ])
    img.clear(x, y);
  // pregos
  for (const [x, y] of [
    [2, 2],
    [s - 3, 2],
    [2, s - 3],
    [s - 3, s - 3],
  ])
    img.set(x, y, C.yellow);
  return img;
}

function arrow(): Img {
  const img = new Img(9, 7);
  img.hline(1, 7, 1, C.orange).hline(2, 6, 2, C.orange).hline(3, 5, 3, C.orange).set(4, 4, C.orange);
  img.hline(2, 6, 1, C.yellow);
  return img.outline(C.outline);
}

function keyIcon(letter: string): Img {
  const img = new Img(13, 13);
  img.rect(1, 1, 11, 11, C.woodDark);
  img.rect(1, 1, 11, 9, C.paper);
  img.hline(2, 10, 1, C.white);
  img.text(5, 3, letter, C.outline);
  img.outline(C.outline);
  img.clear(0, 0).clear(12, 0).clear(0, 12).clear(12, 12);
  return img;
}

export function drawUi(): Record<string, Img> {
  return {
    "ui-dialog": woodFrame(24, "#ffe7c2", C.woodDark),
    "ui-tag": woodFrame(18, C.woodLight, C.woodDark),
    "ui-arrow": arrow(),
    "ui-key-e": keyIcon("E"),
  };
}
