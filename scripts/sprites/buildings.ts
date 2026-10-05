import { Img } from "./draw";
import { C } from "./palette";

/**
 * Fachadas dos prédios. Todos deixam 1px livre na borda para o contorno
 * automático e têm a porta alinhada à grade de 16px — o jogo usa essa
 * posição (ver `door` em src/maps/village.ts).
 */

function bricks(img: Img, x: number, y: number, w: number, h: number, base: string, mortar: string) {
  img.rect(x, y, w, h, base);
  for (let row = 0; row * 4 < h; row++) {
    const yy = y + row * 4;
    img.hline(x, x + w - 1, yy + 3, mortar);
    for (let bx = x + (row % 2) * 4; bx < x + w; bx += 8) img.vline(bx, yy, yy + 2, mortar);
  }
}

function glassWindow(img: Img, x: number, y: number, w: number, h: number, frame: string) {
  img.rect(x, y, w, h, frame);
  img.rect(x + 2, y + 2, w - 4, h - 4, C.blue);
  // reflexo diagonal
  for (let i = 0; i < Math.min(w, h) - 6; i++) {
    img.set(x + 3 + i, y + h - 4 - i, C.sky);
    img.set(x + 4 + i, y + h - 4 - i, C.sky);
  }
  img.frame(x, y, w, h, C.outline);
}

function shingles(img: Img, rows: [number, number, number][], base: string, line: string, light: string) {
  // rows: [y, xStart, xEnd]
  rows.forEach(([y, x0, x1], i) => {
    img.hline(x0, x1, y, base);
    if (i % 4 === 3) img.hline(x0, x1, y, line);
    if (i % 4 === 0) img.hline(x0 + 1, x1 - 1, y, light);
    if (i % 4 === 1 || i % 4 === 2) {
      const offset = Math.floor(i / 4) % 2 === 0 ? 0 : 4;
      for (let x = x0 + offset; x <= x1; x += 8) img.set(x, y, line);
    }
  });
}

/** Linhas de um telhado em trapézio (topo estreito, base larga). */
function trapezoid(top: number, bottom: number, topX: [number, number], bottomX: [number, number]) {
  const rows: [number, number, number][] = [];
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / (bottom - top);
    rows.push([
      y,
      Math.round(topX[0] + (bottomX[0] - topX[0]) * t),
      Math.round(topX[1] + (bottomX[1] - topX[1]) * t),
    ]);
  }
  return rows;
}

function pottedPlant(img: Img, x: number, y: number) {
  img.rect(x, y + 5, 6, 5, C.wood);
  img.hline(x, x + 5, y + 5, C.woodLight);
  img.circle(x + 3, y + 3, 3.2, C.grassDark);
  img.set(x + 2, y + 2, C.grass).set(x + 3, y + 1, C.leaf);
}

/** Escritório Catsuc — 112x96, tijolo, telhado plano com antena. */
export function drawCatsuc(): Img {
  const img = new Img(112, 96);
  // telhado plano
  img.rect(2, 10, 108, 24, C.stoneDark);
  img.rect(4, 12, 104, 17, C.stoneMid);
  for (let i = 0; i < 60; i++) img.set(6 + ((i * 37) % 100), 13 + ((i * 11) % 15), C.slate);
  img.rect(2, 29, 108, 5, C.stone);
  img.hline(2, 109, 33, C.stoneMid);
  // ar-condicionado
  img.rect(60, 15, 16, 10, C.stone).frame(60, 15, 16, 10, C.outline);
  for (let x = 62; x < 74; x += 2) img.vline(x, 17, 22, C.stoneMid);
  // antena
  img.vline(92, 1, 14, C.slate).hline(89, 95, 5, C.slate).hline(90, 94, 9, C.slate);
  img.set(92, 1, C.redLight);
  // antena parabólica
  img.ellipse(22, 18, 7, 5, C.white).ellipse(22, 18, 5, 3, C.stone);
  img.line(22, 18, 27, 13, C.slate).set(27, 13, C.redLight);
  img.rect(21, 23, 3, 5, C.slate);

  // parede de tijolos
  bricks(img, 1, 34, 110, 61, C.wood, "#a35a3e");
  img.rect(1, 34, 110, 3, C.stone);
  img.hline(1, 110, 37, C.stoneDark);
  // letreiro
  img.rect(24, 40, 64, 14, C.ink).frame(24, 40, 64, 14, C.outline);
  img.frame(25, 41, 62, 12, C.slate);
  img.textCenter(56, 43, "CATSUC", C.yellow, 2);
  // janelas
  for (const x of [6, 26, 70, 90]) {
    glassWindow(img, x, 58, 16, 18, C.stone);
    img.rect(x - 1, 76, 18, 2, C.stoneDark);
  }
  // porta de vidro
  img.rect(45, 64, 22, 32, C.stone);
  img.frame(45, 64, 22, 32, C.outline);
  img.rect(48, 67, 16, 29, C.slate);
  glassWindow(img, 48, 67, 8, 28, C.slate);
  glassWindow(img, 56, 67, 8, 28, C.slate);
  img.vline(55, 80, 83, C.stone).vline(56, 80, 83, C.stone);
  // base
  img.rect(1, 91, 44, 4, C.woodDark);
  img.rect(67, 91, 44, 4, C.woodDark);
  img.rect(44, 93, 24, 2, C.stoneMid);
  pottedPlant(img, 36, 81);
  pottedPlant(img, 70, 81);
  return img.outline(C.outline);
}

const HEART = [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."];

/** Clínica NeuroKids — 112x96, telhado coral, paredes menta e bandeirinhas. */
export function drawNeuroKids(): Img {
  const img = new Img(112, 96);
  // chaminé
  bricks(img, 84, 2, 10, 16, C.red, "#8f3526");
  img.rect(82, 1, 14, 3, C.stoneDark);
  // telhado
  shingles(img, trapezoid(8, 40, [18, 93], [2, 109]), C.salmon, C.red, "#ffa98a");
  img.hline(18, 93, 8, C.cream);
  img.rect(2, 40, 108, 2, C.red);
  // emblema
  img.circle(56, 22, 9, C.outline).circle(56, 22, 8, C.white);
  img.ascii(53, 19, HEART, { p: C.pink });
  img.set(54, 20, C.white);

  // parede
  img.rect(6, 42, 100, 53, C.mint);
  for (let y = 45; y < 95; y += 4) img.hline(6, 105, y, "#a9d6c4");
  img.rect(6, 42, 3, 53, C.white).rect(103, 42, 3, 53, C.white);
  // bandeirinhas
  const flags = [C.pink, C.yellow, C.sky, C.purpleLight, C.leaf];
  for (let i = 0; i < 13; i++) {
    const x = 8 + i * 8;
    const c = flags[i % flags.length];
    img.hline(x, x + 4, 43, c).hline(x + 1, x + 3, 44, c).set(x + 2, 45, c);
  }
  // placa
  img.rect(32, 48, 48, 11, C.white).frame(32, 48, 48, 11, C.purple);
  img.textCenter(56, 51, "NEUROKIDS", C.purple);
  // janelas com floreira
  for (const [x, shutter] of [
    [14, C.pink],
    [78, C.yellow],
  ] as const) {
    img.rect(x - 4, 60, 4, 18, shutter).rect(x + 20, 60, 4, 18, shutter);
    glassWindow(img, x, 60, 20, 18, C.white);
    img.vline(x + 10, 61, 76, C.white).hline(x + 1, x + 18, 69, C.white);
    img.rect(x - 2, 78, 24, 5, C.wood).hline(x - 2, x + 21, 78, C.woodLight);
    for (let i = 0; i < 6; i++) img.set(x + i * 4, 77, i % 2 ? C.pink : C.yellow);
  }
  // porta arredondada
  img.rect(46, 64, 20, 32, C.white);
  img.circle(56, 66, 10, C.white);
  img.rect(48, 68, 16, 28, "#4a7fc1");
  img.circle(56, 68, 8, "#4a7fc1");
  img.rect(48, 66, 16, 2, "#4a7fc1");
  img.circle(56, 70, 3, C.sky);
  img.vline(56, 76, 94, "#35599a");
  img.set(60, 84, C.yellow).set(52, 84, C.yellow);
  img.rect(44, 93, 24, 2, C.stone);
  return img.outline(C.outline);
}

/** Escola UNIFAVIP — 128x112, telhado vermelho, torre do sino e relógio. */
export function drawSchool(): Img {
  const img = new Img(128, 112);
  // torre do sino
  img.rect(52, 10, 24, 22, C.cream);
  img.frame(52, 10, 24, 22, C.woodDark);
  img.rect(57, 14, 14, 14, C.outline);
  img.circle(64, 20, 4, C.yellow);
  img.rect(60, 20, 9, 5, C.yellow);
  img.hline(59, 69, 25, C.orange);
  img.set(64, 26, C.woodDark);
  shingles(img, trapezoid(1, 11, [62, 65], [48, 79]), C.red, "#8f3526", C.redLight);
  // telhado principal
  shingles(img, trapezoid(30, 54, [14, 113], [2, 125]), C.red, "#8f3526", C.redLight);
  img.rect(2, 54, 124, 2, "#8f3526");
  // relógio
  img.circle(64, 42, 8, C.outline).circle(64, 42, 7, C.white);
  img.vline(64, 37, 42, C.outline).hline(64, 67, 42, C.outline);
  // parede
  img.rect(6, 56, 116, 55, C.cream);
  for (let y = 60; y < 100; y += 5) img.hline(6, 121, y, "#f0b98a");
  bricks(img, 6, 99, 116, 12, C.red, "#8f3526");
  // placa
  img.rect(38, 58, 52, 11, "#2f5a3a").frame(38, 58, 52, 11, C.wood);
  img.textCenter(64, 61, "UNIFAVIP", C.white);
  // janelas
  for (const x of [12, 30, 82, 100]) {
    glassWindow(img, x, 70, 16, 20, C.white);
    img.vline(x + 8, 71, 88, C.white).hline(x + 1, x + 14, 79, C.white);
    img.rect(x - 1, 90, 18, 2, C.stoneMid);
  }
  // porta dupla
  img.rect(46, 84, 36, 28, C.stone);
  img.circle(64, 85, 17, C.stone);
  img.rect(48, 88, 32, 24, C.woodDark);
  img.circle(64, 88, 14, C.woodDark);
  img.rect(49, 89, 14, 23, C.wood).rect(65, 89, 14, 23, C.wood);
  img.circle(64, 89, 12.5, C.wood);
  img.rect(46, 102, 2, 10, C.stone).rect(80, 102, 2, 10, C.stone);
  img.vline(64, 76, 111, C.woodDark);
  for (const y of [90, 101]) {
    img.frame(51, y, 10, 8, C.woodDark);
    img.frame(67, y, 10, 8, C.woodDark);
  }
  img.set(62, 99, C.yellow).set(66, 99, C.yellow);
  img.rect(44, 108, 40, 3, C.stoneMid);
  return img.outline(C.outline);
}

export function drawBuildings(): Record<string, Img> {
  return {
    "building-catsuc": drawCatsuc(),
    "building-neurokids": drawNeuroKids(),
    "building-school": drawSchool(),
  };
}
