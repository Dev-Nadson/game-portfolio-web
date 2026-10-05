import { Img, rng, sheet, type SpriteOut } from "./draw";
import { C } from "./palette";
import { LOGO_WIDTH, drawCatsucIcon, drawCatsucLogo } from "./brand";

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

const GLASS = { dark: "#2b4fb8", mid: "#4a7fe0", light: "#9cc8ff", shine: "#d6ecff" };

/** Painel de vidro espelhado com reflexo diagonal, para a fachada da torre. */
function curtainPanel(img: Img, x: number, y: number, w: number, h: number, phase: number) {
  img.rect(x, y, w, h, GLASS.mid);
  img.rect(x, y + h - 3, w, 3, GLASS.dark);
  img.hline(x, x + w - 1, y, GLASS.light);
  for (let i = 0; i < h; i++) {
    const rx = x + ((i + phase) % (w + h)) - Math.floor(h / 2);
    for (const d of [0, 1]) if (rx + d >= x && rx + d < x + w && y + h - 1 - i >= y) img.set(rx + d, y + h - 1 - i, GLASS.light);
  }
  img.set(x + 1, y + 1, GLASS.shine);
}

/**
 * Torre da Catsuc — 128x144, 3 andares: térreo com porta automática e
 * marquise azul, dois andares de vidro separados por faixas na cor da
 * marca e o letreiro com a logo no topo. A porta fica em x 56–71.
 */
export function drawCatsuc(): Img {
  const img = new Img(128, 144);
  const L = 3;
  const R = 124;

  // letreiro no telhado, preso em dois postes
  const signW = LOGO_WIDTH + 12;
  const signX = Math.round(64 - signW / 2);
  img.rect(signX + 10, 18, 3, 8, C.slate).rect(signX + signW - 13, 18, 3, 8, C.slate);
  img.rect(signX, 2, signW, 17, C.white);
  img.hline(signX, signX + signW - 1, 17, C.stone).hline(signX, signX + signW - 1, 18, C.stoneMid);
  img.frame(signX, 2, signW, 17, C.catsuc);
  drawCatsucLogo(img, signX + 6, 5);

  // telhado (parapeito) com ar-condicionado e antena
  img.rect(L, 24, R - L + 1, 8, C.stoneMid);
  img.rect(L, 24, R - L + 1, 2, C.stone);
  img.rect(L + 6, 20, 14, 6, C.stone).frame(L + 6, 20, 14, 6, C.slate);
  for (let x = L + 8; x < L + 19; x += 2) img.vline(x, 21, 24, C.stoneMid);
  img.vline(R - 10, 8, 24, C.slate).hline(R - 13, R - 7, 12, C.slate).set(R - 10, 7, C.redLight);
  img.hline(L, R, 31, C.stoneDark);

  // andares de vidro (2º e 3º), separados por faixas azuis
  const mullions = [L, 18, 33, 48, 63, 64, 79, 94, 109, R];
  const floor = (top: number, bottom: number, phase: number) => {
    img.rect(L, top, R - L + 1, bottom - top, C.stone);
    for (let i = 0; i < mullions.length - 1; i++) {
      const x0 = mullions[i] + 1;
      const x1 = mullions[i + 1] - 1;
      if (x1 - x0 < 4) continue;
      curtainPanel(img, x0 + 1, top + 2, x1 - x0 - 1, bottom - top - 4, phase + i * 5);
    }
  };
  floor(32, 64, 0);
  img.rect(L, 64, R - L + 1, 5, C.catsuc).hline(L, R, 64, C.catsucLight).hline(L, R, 68, C.catsucDark);
  floor(69, 100, 9);
  img.rect(L, 100, R - L + 1, 5, C.catsuc).hline(L, R, 100, C.catsucLight).hline(L, R, 104, C.catsucDark);

  // térreo: parede clara, vitrines e a porta automática
  img.rect(L, 105, R - L + 1, 38, C.stone);
  img.hline(L, R, 105, C.white);
  for (const x of [8, 28, 84, 104]) {
    curtainPanel(img, x, 112, 16, 24, x);
    img.frame(x - 1, 111, 18, 26, C.stoneDark);
  }
  // marquise
  img.rect(48, 106, 32, 6, C.catsuc);
  img.hline(48, 79, 106, C.catsucLight).hline(48, 79, 111, C.catsucDark);
  drawCatsucIcon(img, 59, 107, C.white, true);
  // porta de vidro dupla (x 56–71)
  img.rect(54, 112, 20, 32, C.stoneDark);
  curtainPanel(img, 56, 114, 7, 29, 2);
  curtainPanel(img, 65, 114, 7, 29, 6);
  img.vline(63, 114, 143, C.slate).vline(64, 114, 143, C.slate);
  img.rect(61, 126, 2, 4, C.stone).rect(65, 126, 2, 4, C.stone);
  // volume: lateral direita na sombra
  img.vline(R, 24, 143, C.stoneDark).vline(R - 1, 32, 143, "#00000030");
  // calçada e plantas
  img.rect(L, 141, R - L + 1, 3, C.stoneMid);
  img.rect(50, 141, 28, 3, C.stone);
  pottedPlant(img, 44, 131);
  pottedPlant(img, 78, 131);
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

const ARCANE = { glow: "#c496f0", bright: "#f3e6ff", crystal: "#7ff0ff", crystalDark: "#3fbfd8" };

/**
 * Torre do mago — 64x128, 2 quadros (cristal e janelas pulsam): torre
 * redonda de pedra, chapéu cônico roxo com estrela e lua e um cristal na
 * ponta. A porta em arco fica em x 24–39, alinhada à grade.
 */
function drawWizardTower(): SpriteOut {
  const frames = [false, true].map((lit) => {
    const img = new Img(64, 128);
    const rand = rng(91);
    // corpo cilíndrico: blocos de pedra com luz da esquerda
    const L = 12;
    const R = 51;
    for (let y = 50; y < 127; y++) {
      for (let x = L; x <= R; x++) {
        const t = (x - L) / (R - L);
        img.set(x, y, t < 0.25 ? C.stone : t < 0.7 ? C.stoneMid : t < 0.9 ? C.stoneDark : C.slate);
      }
    }
    for (let row = 0, y = 52; y < 126; row++, y += 6) {
      img.hline(L, R, y, C.slate);
      let x = L + (row % 2) * 4 + Math.floor(rand() * 3);
      while (x < R) {
        img.vline(x, y + 1, y + 5, C.slate);
        x += 6 + Math.floor(rand() * 5);
      }
    }
    // faixa de pedra mais larga sob o telhado
    img.rect(L - 3, 46, R - L + 7, 6, C.stoneMid);
    img.hline(L - 3, R + 3, 46, C.stone).hline(L - 3, R + 3, 51, C.slate);
    // janelas redondas com luz violeta
    const glow = lit ? ARCANE.bright : ARCANE.glow;
    for (const [cx, cy] of [
      [24, 66],
      [40, 86],
    ]) {
      img.circle(cx, cy, 5, C.slate);
      img.circle(cx, cy, 3.6, glow);
      img.vline(cx, cy - 3, cy + 3, C.slate).hline(cx - 3, cx + 3, cy, C.slate);
      if (lit) img.set(cx - 2, cy - 2, C.white);
    }
    // porta em arco (x 24–39)
    img.rect(24, 110, 16, 17, C.stoneDark);
    img.circle(32, 110, 8, C.stoneDark);
    img.rect(26, 110, 12, 17, C.woodDark);
    img.circle(32, 110, 6, C.woodDark);
    img.rect(27, 110, 4, 17, C.wood).rect(33, 110, 4, 17, C.wood);
    img.vline(32, 104, 126, C.woodDark);
    img.set(30, 118, C.yellow).set(34, 118, C.yellow);
    img.rect(22, 125, 20, 2, C.stone);
    // chapéu: cone roxo com a ponta torta
    for (let y = 8; y <= 46; y++) {
      const t = (y - 8) / 38;
      const half = Math.round(1 + 28 * t ** 1.15);
      const bend = Math.round(6 * (1 - t) ** 2);
      const cx = 32 + bend;
      for (let x = cx - half; x <= cx + half; x++) {
        const side = (x - (cx - half)) / (2 * half + 1);
        img.set(x, y, side < 0.3 ? C.purpleLight : side < 0.8 ? C.purple : "#5e3a8f");
      }
      // telhas
      if (y % 5 === 0) for (let x = cx - half + ((y / 5) % 2) * 2; x <= cx + half; x += 4) img.set(x, y, "#5e3a8f");
    }
    img.hline(2, 61, 46, "#5e3a8f");
    // faixa dourada do chapéu
    for (const y of [41, 42]) {
      const t = (y - 8) / 38;
      const half = Math.round(1 + 28 * t ** 1.15);
      img.hline(32 - half, 32 + half, y, y === 41 ? C.yellow : C.orange);
    }
    // estrela e lua douradas
    img.ascii(22, 30, ["..y..", ".yyy.", "yyyyy", ".y.y."], { y: C.yellow });
    img.ascii(38, 24, [".yy", "y..", "y..", ".yy"], { y: C.yellow });
    // cristal na ponta
    const crystal = lit ? ARCANE.crystal : ARCANE.crystalDark;
    img.ascii(36, 3, ["..c..", ".cCc.", "cCCcc", ".ccc.", "..c.."], { c: crystal, C: lit ? C.white : ARCANE.crystal });
    img.outline(C.outline);
    if (lit) {
      // brilho em volta do cristal
      for (const [x, y] of [
        [33, 3],
        [44, 4],
        [38, 1],
        [34, 8],
        [43, 8],
      ])
        img.set(x, y, "#ffffffaa");
    }
    return img.shadow(32, 126, 22, 2.5);
  });
  return { img: sheet(frames, 2), frame: { w: 64, h: 128 } };
}

/** Faísca mágica 16x16 em 3 quadros, para flutuar perto da torre do mago. */
function drawMagicSparkle(): SpriteOut {
  const frames = [
    [".....", "..p..", ".pWp.", "..p..", "....."],
    ["..p..", "..p..", "ppWpp", "..p..", "..p.."],
    [".....", ".c.c.", "..W..", ".c.c.", "....."],
  ].map((rows) => new Img(16, 16).ascii(5, 5, rows, { p: ARCANE.glow, W: C.white, c: ARCANE.crystal }));
  return { img: sheet(frames, 3), frame: { w: 16, h: 16 } };
}

export function drawBuildings(): Record<string, SpriteOut> {
  return {
    "building-catsuc": drawCatsuc(),
    "building-neurokids": drawNeuroKids(),
    "building-school": drawSchool(),
    "building-wizard": drawWizardTower(),
    "magic-sparkle": drawMagicSparkle(),
  };
}
