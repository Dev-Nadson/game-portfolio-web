import { Img, rng, sheet, type SpriteOut } from "./draw";
import { C } from "./palette";

/**
 * Paisagem das bordas da vila: serra a oeste (montanhas, pedras,
 * cachoeira e caverna) e praia a sudoeste (farol, barco, guarda-sol...).
 */

/** Ruído suave 1D: passeio aleatório limitado, para encostas irregulares. */
function walk(len: number, rand: () => number, amp: number): number[] {
  const out: number[] = [];
  let v = 0;
  for (let i = 0; i < len; i++) {
    v += (rand() - 0.5) * 1.6;
    v = Math.max(-amp, Math.min(amp, v * 0.92));
    out.push(Math.round(v));
  }
  return out;
}

interface Peak {
  x: number;
  y: number;
  /** quanto a encosta desce por pixel em x */
  slope: number;
}

/**
 * Montanha com picos, lado esquerdo iluminado, lado direito na sombra,
 * fendas e neve no topo. A base é reta para encostar no chão de pedra.
 */
function drawMountain(w: number, h: number, seed: number, peaks: Peak[], snowDepth: number): Img {
  const img = new Img(w, h);
  const rand = rng(seed);
  const noise = walk(w, rand, 3);
  const top: number[] = [];
  const owner: number[] = [];
  for (let x = 0; x < w; x++) {
    const heights = peaks.map((p) => p.y + Math.abs(x - p.x) * p.slope);
    const y = Math.min(...heights);
    owner.push(heights.indexOf(y));
    top.push(Math.max(1, Math.round(y + noise[x])));
  }
  const main = peaks[0];
  const ridgeNoise = walk(h, rand, 2);
  const ridgeX = (y: number) => main.x + (y - main.y) * 0.18 + ridgeNoise[y];

  for (let x = 0; x < w; x++) {
    for (let y = top[x]; y < h; y++) {
      const lit = x < ridgeX(y);
      const depth = y - top[x];
      let c: string = lit ? C.rock : C.rockDark;
      if (lit && depth < 2) c = C.rockLight;
      if (!lit && depth < 2) c = C.rock;
      img.set(x, y, c);
    }
  }
  // textura e fendas diagonais
  for (let i = 0; i < (w * h) / 34; i++) {
    const x = Math.floor(rand() * w);
    const y = Math.floor(rand() * h);
    if (img.alpha(x, y) === 0) continue;
    const lit = x < ridgeX(y);
    img.set(x, y, lit ? (rand() < 0.5 ? C.rockLight : C.rockDark) : rand() < 0.6 ? C.rockFace : C.rock);
  }
  for (let i = 0; i < w / 10; i++) {
    let x = Math.floor(rand() * w);
    let y = top[Math.min(w - 1, x)] + 6 + Math.floor(rand() * (h / 2));
    const dir = x < ridgeX(y) ? -1 : 1;
    for (let k = 0; k < 6 + rand() * 8; k++) {
      if (img.alpha(x, y) > 0) img.set(x, y, C.rockFace);
      x += rand() < 0.5 ? dir : 0;
      y += 1;
    }
  }
  // crista: linha clara descendo do pico
  for (let y = main.y; y < h - 1; y++) {
    const x = Math.round(ridgeX(y));
    if (img.alpha(x, y) > 0 && (y - main.y) % 7 < 5) img.set(x, y, C.rockLight);
  }
  // neve com borda inferior serrilhada
  if (snowDepth > 0) {
    const edge = walk(w, rand, 3);
    // "escorridos" de neve em pontos aleatórios
    const drips = Array.from({ length: w }, () => (rand() < 0.12 ? 2 + Math.floor(rand() * 4) : 0));
    for (let x = 0; x < w; x++) {
      // cada coluna pertence ao pico que define a sua encosta; os menores têm menos neve
      const i = owner[x];
      const bottom = peaks[i].y + snowDepth * (i === 0 ? 1 : 0.6) + edge[x] + drips[x];
      for (let y = top[x]; y < bottom; y++) {
        if (img.alpha(x, y) === 0) continue;
        img.set(x, y, x < ridgeX(y) ? C.snow : C.snowShade);
      }
    }
  }
  // tufos de mato na parte de baixo, mais no lado iluminado
  for (let i = 0; i < w / 5; i++) {
    const x = Math.floor(rand() * w);
    const y = Math.floor(h * 0.62 + rand() * (h * 0.34));
    if (img.alpha(x, y) === 0 || img.alpha(x, y - 2) === 0) continue;
    const lit = x < ridgeX(y);
    if (!lit && rand() < 0.5) continue;
    img.ellipse(x, y, 2 + rand() * 1.5, 1.3, lit ? C.grassDark : "#2f7a43");
    img.set(x - 1, y - 1, lit ? C.grass : C.grassDark);
  }
  img.outline(C.outline);
  // sem contorno na base: a montanha se funde com o chão de pedra
  for (let x = 0; x < w; x++) img.clear(x, h - 1);
  return img;
}

/** Pedregulho 32x24. */
function drawBoulder(seed: number): Img {
  const img = new Img(32, 24);
  const rand = rng(seed);
  img.ellipse(16, 14, 13, 8.5, C.rockDark);
  img.ellipse(14, 12, 11, 7, C.rock);
  img.ellipse(11, 9, 5, 3, C.rockLight);
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 24);
    if (img.alpha(x, y) > 0) img.set(x, y, rand() < 0.5 ? C.rockDark : C.rockLight);
  }
  img.line(18, 9, 21, 15, C.rockFace);
  // musgo
  img.set(7, 10, C.grassDark).set(8, 9, C.grass).set(9, 9, C.grassDark);
  return img.outline(C.outline).shadow(16, 22, 12, 1.6);
}

/** Pedrinha 16x16. */
function drawRockSmall(): Img {
  const img = new Img(16, 16);
  img.ellipse(8, 10, 5.5, 3.6, C.rockDark);
  img.ellipse(7, 9, 4.5, 2.8, C.rock);
  img.set(5, 8, C.rockLight).set(6, 8, C.rockLight);
  return img.outline(C.outline).shadow(8, 13, 5, 1);
}

/** Cachoeira 32x48 em 3 quadros: listras descendo e espuma na base. */
function drawWaterfall(): SpriteOut {
  const frames = [0, 1, 2].map((f) => {
    const img = new Img(32, 48);
    const rand = rng(50 + f);
    img.rect(8, 0, 16, 40, C.water);
    img.vline(8, 0, 39, C.waterDark).vline(23, 0, 39, C.waterDark);
    for (let x = 10; x < 22; x += 3) {
      for (let y = (f * 4 + x * 5) % 12; y < 40; y += 12) img.vline(x, y, y + 4, C.waterLight);
    }
    img.hline(9, 22, 0, C.foam);
    // espuma na base
    img.ellipse(16, 41, 13, 5, C.waterLight);
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI;
      const r = rand() * 11;
      img.set(Math.round(16 + Math.cos(a) * r * 1.2), Math.round(41 - Math.sin(a) * r * 0.5), C.foam);
    }
    img.hline(5, 26, 44, C.foam);
    return img.outline(C.outline);
  });
  return { img: sheet(frames, 3), frame: { w: 32, h: 48 } };
}

/**
 * Entrada da caverna 48x48: afloramento de pedra com a boca virada para o
 * sul. A abertura ocupa x 16–31, alinhada à grade — pode virar porta.
 */
function drawCave(): Img {
  const img = new Img(48, 48);
  const rand = rng(61);
  // pedra em volta
  img.ellipse(24, 26, 23, 21, C.rockDark);
  img.ellipse(22, 23, 20, 18, C.rock);
  img.ellipse(16, 14, 9, 6, C.rockLight);
  img.rect(1, 30, 46, 17, C.rockDark);
  img.rect(2, 30, 30, 15, C.rock);
  for (let i = 0; i < 120; i++) {
    const x = Math.floor(rand() * 48);
    const y = Math.floor(rand() * 48);
    if (img.alpha(x, y) > 0) img.set(x, y, rand() < 0.5 ? C.rockDark : C.rockLight);
  }
  // boca
  img.rect(16, 26, 16, 21, C.black);
  img.ellipse(24, 26, 8, 7, C.black);
  img.ellipse(24, 27, 6, 5, "#0e0f18");
  img.rect(18, 27, 12, 20, "#0e0f18");
  // escoras de madeira
  img.rect(15, 24, 3, 23, C.wood).vline(15, 24, 46, C.woodDark);
  img.rect(30, 24, 3, 23, C.wood).vline(32, 24, 46, C.woodDark);
  img.rect(13, 21, 22, 4, C.wood).hline(13, 34, 21, C.woodLight).hline(13, 34, 24, C.woodDark);
  // lanterna
  img.vline(36, 22, 25, C.slate);
  img.rect(35, 26, 4, 5, C.yellow).frame(35, 26, 4, 5, C.outline);
  img.set(36, 27, C.paper);
  // capim na base
  for (const x of [4, 7, 39, 43]) img.vline(x, 44, 46, C.grassDark).set(x + 1, 45, C.grass);
  return img.outline(C.outline);
}

/** Farol 32x80, 2 quadros: a luz acende e solta raios. */
function drawLighthouse(): SpriteOut {
  const frames = [false, true].map((on) => {
    const img = new Img(32, 80);
    // base de pedra
    img.rect(5, 70, 22, 9, C.stoneMid);
    img.hline(5, 26, 70, C.stone);
    for (const x of [9, 15, 21]) img.vline(x, 71, 78, C.stoneDark);
    img.hline(5, 26, 74, C.stoneDark);
    // torre afunilada com listras vermelhas e brancas
    for (let y = 26; y < 70; y++) {
      const t = (y - 26) / 44;
      const half = Math.round(6 + 4 * t);
      const red = Math.floor((y - 26) / 8) % 2 === 0;
      img.hline(16 - half, 15 + half, y, red ? C.red : C.white);
      img.hline(16 + half - 2, 15 + half, y, red ? "#8f3526" : C.stone);
      img.set(16 - half, y, red ? C.redLight : C.white);
    }
    // janelinhas e porta
    img.rect(14, 38, 4, 5, C.blue).frame(14, 38, 4, 5, C.outline);
    img.rect(14, 54, 4, 5, C.blue).frame(14, 54, 4, 5, C.outline);
    img.rect(12, 62, 8, 8, C.woodDark);
    img.circle(16, 62, 4, C.woodDark);
    img.rect(13, 62, 6, 8, C.wood);
    img.circle(16, 62, 3, C.wood);
    img.set(17, 66, C.yellow);
    // varanda
    img.rect(6, 23, 20, 3, C.slate);
    img.hline(6, 25, 23, C.stoneMid);
    for (let x = 7; x < 26; x += 3) img.vline(x, 19, 22, C.slate);
    img.hline(6, 25, 19, C.slate);
    // sala da lanterna
    img.rect(10, 12, 12, 8, on ? C.yellow : "#c99a3a");
    img.rect(12, 13, 8, 6, on ? C.paper : C.yellow);
    img.vline(13, 12, 19, C.slate).vline(18, 12, 19, C.slate);
    // cúpula
    img.ellipse(16, 11, 7, 4, C.red);
    img.rect(9, 10, 14, 2, "#8f3526");
    img.ellipse(15, 9, 3, 1.5, C.redLight);
    img.vline(16, 3, 7, C.slate).set(16, 2, C.yellow);
    img.outline(C.outline);
    if (on) {
      // raios de luz para os lados
      for (let x = 0; x < 9; x++) {
        const spread = Math.floor((9 - x) / 3);
        img.vline(x, 15 - spread, 16 + spread, "#fff4b066");
        img.vline(31 - x, 15 - spread, 16 + spread, "#fff4b066");
      }
    }
    return img.shadow(16, 78, 12, 1.5);
  });
  return { img: sheet(frames, 2), frame: { w: 32, h: 80 } };
}

/** Barquinho a remo encalhado na areia, 32x20. */
function drawBoat(): Img {
  const img = new Img(32, 20);
  img.ellipse(16, 11, 14, 6.5, C.woodDark);
  img.ellipse(16, 10, 13, 5.5, C.wood);
  img.ellipse(16, 10, 10, 3.5, C.woodDark);
  img.hline(8, 24, 10, C.soil);
  img.vline(13, 7, 13, C.wood).vline(19, 7, 13, C.wood);
  img.hline(4, 28, 5, C.woodLight);
  // remo
  img.line(6, 15, 27, 4, C.woodLight);
  img.ellipse(27, 4, 2.5, 1.5, C.woodLight);
  img.hline(3, 29, 15, "#4a7fc1");
  return img.outline(C.outline).shadow(16, 17, 14, 1.5);
}

/** Guarda-sol listrado 32x32. */
function drawUmbrella(): Img {
  const img = new Img(32, 32);
  img.vline(16, 8, 30, C.stoneMid).vline(17, 8, 30, C.stone);
  for (let y = 2; y <= 12; y++) {
    const t = (y - 2) / 10;
    const half = Math.round(3 + 12 * Math.sqrt(t));
    for (let x = 16 - half; x <= 16 + half; x++) {
      const stripe = Math.floor(((x - 16) / (half + 1)) * 3 + 3) % 2 === 0;
      img.set(x, y, stripe ? C.redLight : C.white);
    }
  }
  img.hline(1, 31, 12, "#8f3526");
  for (let x = 2; x < 31; x += 4) img.set(x, 13, C.redLight);
  img.set(16, 1, C.yellow);
  return img.outline(C.outline).shadow(17, 30, 9, 2);
}

/** Toalha de praia 16x24 (fica no chão, sob tudo). */
function drawTowel(): Img {
  const img = new Img(16, 24);
  img.rect(2, 2, 12, 20, C.sky);
  for (let y = 4; y < 22; y += 4) img.hline(2, 13, y, C.white);
  img.hline(2, 13, 2, C.blue).hline(2, 13, 21, C.blue);
  return img.outline("#00000040");
}

function drawShells(): Img {
  const img = new Img(16, 16);
  img.ellipse(5, 10, 2.5, 2, "#ffd9c7");
  img.set(4, 10, "#e8a58f").set(5, 9, "#e8a58f").set(6, 10, "#e8a58f");
  img.ellipse(11, 7, 2, 1.6, C.paper);
  img.set(11, 7, C.cream);
  return img.outline(C.sandDark);
}

function drawStarfish(): Img {
  const img = new Img(16, 16);
  const arms = [0, 1, 2, 3, 4].map((i) => (i * 2 * Math.PI) / 5 - Math.PI / 2);
  for (const a of arms) img.line(8, 9, Math.round(8 + Math.cos(a) * 5), Math.round(9 + Math.sin(a) * 5), C.orange);
  img.circle(8, 9, 2, C.orange);
  img.set(8, 9, C.yellow).set(7, 8, C.yellow);
  return img.outline(C.outline);
}

function drawSandcastle(): Img {
  const img = new Img(16, 16);
  img.rect(2, 9, 12, 6, C.sand);
  img.rect(2, 6, 4, 4, C.sand).rect(10, 6, 4, 4, C.sand).rect(6, 4, 4, 6, C.sand);
  for (const x of [2, 4, 10, 12]) img.set(x, 5, C.sand);
  img.set(6, 3, C.sand).set(9, 3, C.sand);
  img.vline(13, 9, 14, C.sandDark).hline(2, 13, 14, C.sandDark);
  img.rect(7, 11, 2, 4, C.sandDark);
  img.vline(8, 0, 3, C.woodDark).rect(9, 0, 3, 2, C.redLight);
  return img.outline(C.outline);
}

export function drawLandscape(): Record<string, SpriteOut> {
  return {
    "mountain-big": drawMountain(
      128,
      112,
      71,
      [
        { x: 60, y: 4, slope: 1.45 },
        { x: 98, y: 30, slope: 1.3 },
        { x: 22, y: 40, slope: 1.2 },
      ],
      30
    ),
    "mountain-big-b": drawMountain(
      128,
      112,
      72,
      [
        { x: 74, y: 8, slope: 1.5 },
        { x: 36, y: 22, slope: 1.35 },
        { x: 108, y: 44, slope: 1.2 },
      ],
      26
    ),
    "mountain-mid": drawMountain(
      96,
      80,
      73,
      [
        { x: 44, y: 6, slope: 1.35 },
        { x: 74, y: 26, slope: 1.2 },
      ],
      20
    ),
    "mountain-mid-b": drawMountain(
      96,
      80,
      75,
      [
        { x: 54, y: 10, slope: 1.3 },
        { x: 22, y: 24, slope: 1.25 },
      ],
      16
    ),
    "mountain-low": drawMountain(64, 48, 79, [{ x: 30, y: 6, slope: 1.1 }], 0),
    "mountain-low-b": drawMountain(64, 48, 81, [{ x: 38, y: 8, slope: 1.05 }, { x: 16, y: 20, slope: 1 }], 0),
    boulder: drawBoulder(83),
    "rock-small": drawRockSmall(),
    waterfall: drawWaterfall(),
    "cave-entrance": drawCave(),
    lighthouse: drawLighthouse(),
    boat: drawBoat(),
    "beach-umbrella": drawUmbrella(),
    "beach-towel": drawTowel(),
    shells: drawShells(),
    starfish: drawStarfish(),
    sandcastle: drawSandcastle(),
  };
}
