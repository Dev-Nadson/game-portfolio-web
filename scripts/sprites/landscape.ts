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
 * fendas e neve no topo. As laterais descem até os cantos da base (nada
 * de corte vertical) e a base é irregular e sem contorno, para a montanha
 * se fundir com o chão em vez de parecer um recorte colado.
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
    // encosta que desce até o canto da base
    const foot = h - 1 - Math.min(x, w - 1 - x) * 2.8;
    top.push(Math.max(1, Math.round(Math.max(y + noise[x], foot))));
  }
  // base irregular: cada coluna termina 0–2px acima da última linha
  const base = walk(w, rand, 1).map((v) => h - 2 + v);
  const main = peaks[0];
  const ridgeNoise = walk(h, rand, 2);
  const ridgeX = (y: number) => main.x + (y - main.y) * 0.18 + ridgeNoise[y];

  for (let x = 0; x < w; x++) {
    for (let y = top[x]; y <= base[x]; y++) {
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
  // tufos de capim atravessando a base
  for (let i = 0; i < w / 14; i++) {
    const x = 2 + Math.floor(rand() * (w - 4));
    if (img.alpha(x, base[x]) === 0) continue;
    img.vline(x, base[x] - 2, base[x], C.grassDark).set(x + 1, base[x] - 1, C.grass).set(x - 1, base[x], C.grassDark);
  }
  const before = img.clone();
  img.outline(C.outline);
  // sem contorno perto da base: a montanha se funde com o chão
  for (let y = h - 6; y < h; y++) for (let x = 0; x < w; x++) if (before.alpha(x, y) === 0) img.clear(x, y);
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

/**
 * Montículo de transição entre a serra e o campo: um morrinho de grama
 * com pedras aflorando. A base tem a cor exata da grama do chão e não
 * tem contorno, então ele "nasce" do terreno.
 */
function drawFoothill(w: number, h: number, seed: number): Img {
  const img = new Img(w, h);
  const rand = rng(seed);
  const noise = walk(w, rand, 2);
  const cx = (w - 1) / 2;
  const top: number[] = [];
  for (let x = 0; x < w; x++) {
    // perfil de domo com pés suaves: (1 − t²)^1,3 chega ao chão na horizontal
    // (uma meia-elipse teria laterais verticais na base, que parecem um corte)
    const t = Math.min(1, Math.abs((x - cx) / (w / 2)));
    top.push(Math.round(h - 1 - (h - 5) * 0.72 * Math.pow(1 - t * t, 1.15) + noise[x]));
  }
  for (let x = 0; x < w; x++) {
    for (let y = Math.max(0, top[x]); y < h; y++) {
      const depth = y - top[x];
      // luz da esquerda: brilho no topo, sombra só na borda direita
      const shade = (x - cx) / (w / 2) + (depth < 3 ? -0.6 : 0);
      let c: string = GRASS_GROUND;
      if (depth < 2 && shade < 0.4) c = C.leaf;
      else if (shade > 0.72 && y < h - 4) c = C.grassDeep;
      img.set(x, y, c);
    }
  }
  // pedras aflorando
  for (let i = 0; i < Math.round(w / 16) + 1; i++) {
    const x = Math.round(w * 0.2 + rand() * w * 0.6);
    const y = Math.round(top[x] + 4 + rand() * (h - top[x] - 9));
    const r = 2.5 + rand() * 2.5;
    img.ellipse(x, y, r + 1, r * 0.7 + 1, C.outline);
    img.ellipse(x, y, r, r * 0.7, C.rock);
    img.ellipse(x - 1, y - 1, r * 0.5, r * 0.35, C.rockLight);
    img.hline(Math.round(x - r + 1), Math.round(x + r - 1), Math.round(y + r * 0.5), C.rockDark);
  }
  // tufos e florzinhas
  for (let i = 0; i < w / 6; i++) {
    const x = Math.floor(rand() * w);
    const y = top[x] + 2 + Math.floor(rand() * (h - top[x] - 4));
    if (img.alpha(x, y) === 0 || img.alpha(x, y - 1) === 0) continue;
    if (rand() < 0.2) img.set(x, y, C.yellow);
    else img.set(x, y, C.grassDark).set(x, y - 1, C.grassDark);
  }
  const before = img.clone();
  // contorno verde-escuro: é relevo do chão, não um objeto
  img.outline(C.grassDark);
  for (let y = h - 6; y < h; y++) for (let x = 0; x < w; x++) if (before.alpha(x, y) === 0) img.clear(x, y);
  return img;
}

/** Mesma cor do tile de grama do Kenney. */
const GRASS_GROUND = "#84c669";

/**
 * Paredão de pedra da enseada (128x64): face com estratos verticais e
 * saliências com mato. O topo é irregular e sem contorno, para emendar
 * nas montanhas de trás; a base tem um vinco escuro onde encontra a grama.
 */
function drawCliffWall(): Img {
  const w = 128;
  const h = 64;
  const img = new Img(w, h);
  const rand = rng(97);
  const topNoise = walk(w, rand, 5);
  // topo irregular e laterais descendo em diagonal até a base, como as montanhas
  const top = topNoise.map((v, x) => {
    const edge = Math.min(x, w - 1 - x);
    return Math.max(4 + v + Math.round(5 * Math.abs(Math.sin(x / 11))), h - 1 - edge * 2.2);
  });
  // facetas de pedra de larguras variadas: claras em cima, escuras embaixo
  let fx = 0;
  while (fx < w) {
    const fw = 6 + Math.floor(rand() * 9);
    const dark = rand() < 0.5;
    // a parte de baixo, mais escura, começa numa altura diferente em cada faceta
    const split = h * 0.45 + Math.round((rand() - 0.5) * 14);
    for (let x = fx; x < Math.min(w, fx + fw); x++) {
      for (let y = Math.max(0, top[x]); y < h; y++) {
        const d = y - top[x];
        const low = y > split;
        let c: string = d < 2 ? C.rockLight : !low ? (dark ? C.rockDark : C.rock) : dark ? C.rockFace : "#655f75";
        if (d >= 2 && x === fx) c = low ? C.rockDark : C.rockLight;
        if (d >= 2 && x === fx + fw - 1) c = low ? "#4a4458" : C.rockFace;
        img.set(x, y, c);
      }
    }
    fx += fw;
  }
  // textura
  for (let i = 0; i < (w * h) / 18; i++) {
    const x = Math.floor(rand() * w);
    const y = Math.floor(rand() * h);
    if (img.alpha(x, y) > 0 && y > top[x] + 2) img.set(x, y, rand() < 0.5 ? C.rockDark : C.rock);
  }
  // saliências horizontais com mato
  for (const ledgeY of [24, 42]) {
    let x = 8 + Math.floor(rand() * 10);
    while (x < w - 8) {
      const len = 10 + Math.floor(rand() * 16);
      const y = ledgeY + Math.floor(rand() * 4);
      for (let k = x; k < Math.min(w - 8, x + len); k++) {
        if (img.alpha(k, y) === 0) continue;
        img.set(k, y, C.rockLight).set(k, y + 1, C.rockDark);
        if (rand() < 0.5) img.set(k, y - 1, C.grassDark);
        if (rand() < 0.25) img.set(k, y - 2, C.grass);
      }
      x += len + 8 + Math.floor(rand() * 12);
    }
  }
  // vinco na base, onde o paredão encontra a grama
  for (let x = 0; x < w; x++) if (img.alpha(x, h - 1) > 0) img.set(x, h - 1, "#4a4458").set(x, h - 2, C.rockDark);
  // sem contorno: o paredão continua a rocha da serra
  return img;
}

/**
 * Cachoeira 48x80 em 3 quadros: nasce num recorte de pedra no alto do
 * paredão e cai numa bacia com borda de pedras (que cobre o laguinho de
 * 3x2 tiles do mapa), com espuma, névoa e ondinhas.
 */
function drawWaterfall(): SpriteOut {
  const frames = [0, 1, 2].map((f) => {
    const img = new Img(48, 80);
    const rand = rng(50 + f);
    // bacia: borda de pedras e água
    img.ellipse(24, 64, 23.5, 15.5, C.rockDark);
    img.ellipse(24, 64, 21, 13, C.water);
    img.ellipse(24, 66, 17, 9, "#3584c6");
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + (i % 2) * 0.1;
      const x = 24 + Math.cos(a) * 21.5;
      const y = 64 + Math.sin(a) * 14;
      const r = 2.2 + ((i * 7) % 3) * 0.6;
      img.ellipse(x, y, r + 0.8, r * 0.75 + 0.8, C.outline);
      img.ellipse(x, y, r, r * 0.75, i % 3 === 0 ? C.rockLight : C.rock);
      img.set(Math.round(x - 1), Math.round(y - 1), C.rockLight);
    }
    // ondinhas que se abrem a partir da queda
    for (const k of [0, 1]) {
      const r = 5 + ((f + k * 1.5) % 3) * 4;
      for (let a = 0.15; a < Math.PI - 0.15; a += 0.12) img.set(Math.round(24 + Math.cos(a) * r * 1.4), Math.round(60 + Math.sin(a) * r * 0.55), C.waterLight);
    }
    // pedrinhas na borda de onde a água sai
    for (const [x, y] of [
      [14, 3],
      [34, 3],
      [12, 6],
    ]) {
      img.ellipse(x, y, 2.6, 2, C.rock);
      img.set(x - 1, y - 1, C.rockLight);
    }
    // a queda, um pouco mais larga embaixo
    for (let y = 0; y < 58; y++) {
      const half = 7 + Math.round((y / 58) * 2);
      img.hline(24 - half, 23 + half, y, C.water);
      img.set(24 - half, y, C.waterDark).set(23 + half, y, C.waterDark);
    }
    for (let x = 17; x < 31; x += 3) {
      for (let y = 4 + ((f * 5 + x * 7) % 15); y < 56; y += 15) img.vline(x, y, y + 5, C.waterLight);
    }
    img.hline(17, 30, 0, C.foam).hline(18, 29, 1, C.waterLight);
    img.outline(C.outline);
    // espuma e névoa (depois do contorno, para ficarem leves)
    img.ellipse(24, 58, 11, 4, C.foam);
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 2;
      const r = 6 + rand() * 9;
      const x = Math.round(24 + Math.cos(a) * r * 1.3);
      const y = Math.round(56 + Math.sin(a) * r * 0.5 - 2);
      if (y < 63) img.set(x, y, rand() < 0.5 ? C.foam : "#ffffff90");
    }
    return img;
  });
  return { img: sheet(frames, 3), frame: { w: 48, h: 80 } };
}

/**
 * Boca da caverna 48x48, escavada no paredão: arco de pedra sem contorno
 * por fora (emenda na rocha), escuridão em degradê, escoras de madeira,
 * lanterna e entulho. A abertura ocupa x 16–31, alinhada à grade.
 */
function drawCave(): Img {
  const img = new Img(48, 48);
  const rand = rng(61);
  // arco de pedra em volta da boca (vai se misturar com a face do paredão)
  img.ellipse(24, 26, 15, 13, C.rockFace);
  img.rect(9, 26, 30, 22, C.rockFace);
  for (let i = 0; i < 70; i++) {
    const a = Math.PI + rand() * Math.PI;
    const r = 9 + rand() * 6;
    img.set(Math.round(24 + Math.cos(a) * r), Math.round(26 + Math.sin(a) * r * 0.95), rand() < 0.5 ? C.rock : C.rockLight);
  }
  for (let y = 26; y < 47; y++) {
    if (rand() < 0.5) img.set(10 + Math.floor(rand() * 4), y, C.rock);
    if (rand() < 0.5) img.set(34 + Math.floor(rand() * 4), y, C.rockDark);
  }
  // escuridão
  img.ellipse(24, 26, 9, 9, C.outline);
  img.rect(15, 26, 18, 22, C.outline);
  img.ellipse(24, 27, 8, 8, C.black);
  img.rect(16, 27, 16, 21, C.black);
  img.ellipse(24, 30, 5, 5, "#0b0c14");
  img.rect(19, 30, 10, 18, "#0b0c14");
  // escoras de madeira
  img.rect(14, 22, 3, 26, C.wood).vline(14, 22, 47, C.woodDark).vline(16, 22, 47, C.woodLight);
  img.rect(31, 22, 3, 26, C.wood).vline(33, 22, 47, C.woodDark).vline(31, 22, 47, C.woodLight);
  img.rect(12, 19, 24, 4, C.wood).hline(12, 35, 19, C.woodLight).hline(12, 35, 22, C.woodDark);
  img.set(15, 20, C.outline).set(32, 20, C.outline);
  // lanterna pendurada
  img.vline(37, 21, 24, C.slate);
  img.rect(36, 25, 4, 5, C.yellow).frame(36, 25, 4, 5, C.outline);
  img.set(37, 26, C.paper);
  // entulho e tábua na base
  for (const [x, y, r] of [
    [8, 45, 2.5],
    [11, 46, 1.8],
    [38, 45, 2.2],
    [41, 46, 2.6],
  ] as const) {
    img.ellipse(x, y, r + 0.8, r * 0.7 + 0.8, C.outline);
    img.ellipse(x, y, r, r * 0.7, C.rock);
    img.set(x - 1, y - 1, C.rockLight);
  }
  img.line(18, 46, 27, 44, C.woodLight).line(18, 47, 27, 45, C.wood);
  return img;
}

/**
 * Farol grande — torre de 48x128 num quadro de 112px (espaço para o feixe),
 * 4 quadros: feixe à esquerda, apagado, feixe à direita, apagado.
 * Base octogonal de pedra com porta e degraus, torre afunilada listrada,
 * varanda com grade, sala da lanterna envidraçada e cúpula com cata-vento.
 */
function drawLighthouse(): SpriteOut {
  const W = 112;
  const H = 128;
  const cx = 56;
  const frames = [-1, 0, 1, 0].map((beam, f) => {
    const img = new Img(W, H);
    const lit = beam !== 0;
    // base octogonal de pedra
    img.rect(cx - 26, 112, 52, 14, C.stoneMid);
    img.rect(cx - 22, 108, 44, 4, C.stoneMid);
    img.rect(cx - 22, 108, 44, 2, C.stone);
    img.rect(cx - 26, 112, 52, 3, C.stone);
    for (let x = cx - 24; x < cx + 26; x += 8) img.vline(x, 116, 125, C.stoneDark);
    img.hline(cx - 26, cx + 25, 120, C.stoneDark);
    img.vline(cx + 25, 112, 125, C.slate);
    // degraus
    img.rect(cx - 8, 122, 16, 2, C.stone).rect(cx - 10, 124, 20, 3, C.stone);
    img.hline(cx - 10, cx + 9, 126, C.stoneDark);
    // torre afunilada com faixas
    for (let y = 40; y < 112; y++) {
      const t = (y - 40) / 72;
      const half = Math.round(13 + 7 * t);
      const red = Math.floor((y - 40) / 12) % 2 === 0;
      for (let x = cx - half; x < cx + half; x++) {
        const u = (x - (cx - half)) / (2 * half);
        const base = red ? (u < 0.25 ? C.redLight : u < 0.8 ? C.red : "#8f3526") : u < 0.25 ? C.white : u < 0.8 ? C.paper : C.stone;
        img.set(x, y, base);
      }
    }
    // janelas e porta
    for (const [x, y] of [
      [cx - 3, 54],
      [cx + 2, 78],
      [cx - 4, 96],
    ]) {
      img.rect(x, y, 5, 7, C.slate);
      img.rect(x + 1, y + 1, 3, 5, lit ? C.yellow : C.blue);
    }
    img.rect(cx - 6, 98, 12, 14, C.woodDark);
    img.circle(cx, 98, 6, C.woodDark);
    img.rect(cx - 5, 98, 10, 14, C.wood);
    img.circle(cx, 98, 5, C.wood);
    img.vline(cx, 93, 111, C.woodDark);
    img.set(cx + 2, 104, C.yellow);
    // varanda com grade
    img.rect(cx - 22, 36, 44, 5, C.slate);
    img.hline(cx - 22, cx + 21, 36, C.stoneMid);
    img.hline(cx - 22, cx + 21, 40, C.ink);
    img.hline(cx - 22, cx + 21, 28, C.slate);
    for (let x = cx - 22; x < cx + 22; x += 4) img.vline(x, 28, 35, C.slate);
    // sala da lanterna envidraçada
    img.rect(cx - 12, 14, 24, 22, C.slate);
    img.rect(cx - 10, 16, 20, 19, lit ? C.yellow : "#c99a3a");
    img.rect(cx - 6, 18, 12, 15, lit ? C.paper : C.yellow);
    for (const x of [cx - 4, cx + 3]) img.vline(x, 16, 34, C.slate);
    // cúpula e cata-vento
    img.ellipse(cx, 13, 14, 7, C.red);
    img.rect(cx - 14, 12, 28, 3, "#8f3526");
    img.ellipse(cx - 4, 10, 5, 2.5, C.redLight);
    img.circle(cx, 5, 2, C.yellow);
    img.vline(cx, 0, 4, C.slate).hline(cx - 3, cx + 3, 1, C.slate).set(cx + 3, 2, C.slate);
    img.outline(C.outline);
    // feixe girando
    if (beam !== 0) {
      for (let k = 0; k < 44; k++) {
        const x = beam < 0 ? cx - 14 - k : cx + 13 + k;
        const spread = Math.floor(k / 4);
        img.vline(x, 25 - spread, 26 + spread, k < 6 ? "#fff4b0b0" : "#fff4b066");
      }
    }
    if (f === 0) img.set(cx, 25, C.white);
    return img.shadow(cx, 125, 30, 2);
  });
  return { img: sheet(frames, 4), frame: { w: W, h: H } };
}

/** Rocha no mar: pedra molhada embaixo e anel de espuma em volta. */
function drawSeaRock(w: number, h: number, seed: number): Img {
  const img = new Img(w, h);
  const rand = rng(seed);
  const cx = w / 2;
  const cy = h - 7;
  img.ellipse(cx, cy, w / 2 - 3, h / 2 - 3, C.rockDark);
  img.ellipse(cx - 1, cy - 2, w / 2 - 5, h / 2 - 5, C.rock);
  img.ellipse(cx - 3, cy - 4, w / 5, h / 7, C.rockLight);
  for (let i = 0; i < (w * h) / 20; i++) {
    const x = Math.floor(rand() * w);
    const y = Math.floor(rand() * h);
    if (img.alpha(x, y) > 0 && y < cy) img.set(x, y, rand() < 0.5 ? C.rockDark : C.rockLight);
  }
  // parte molhada
  for (let y = cy; y < h; y++) for (let x = 0; x < w; x++) if (img.alpha(x, y) > 0) img.set(x, y, y > cy + 2 ? "#4a4458" : C.rockFace);
  img.outline(C.outline);
  // espuma em volta da base
  for (let a = 0; a < Math.PI * 2; a += 0.09) {
    const x = Math.round(cx + Math.cos(a) * (w / 2 - 1));
    const y = Math.round(cy + 2 + Math.sin(a) * 3);
    if (img.alpha(x, y) === 0) img.set(x, y, Math.sin(a) > 0 ? C.foam : C.waterLight);
  }
  return img;
}

/** Estaca de madeira saindo da água, com ondinha em volta. */
function drawPiling(): Img {
  const img = new Img(16, 16);
  img.ellipse(8, 13, 6, 2, C.waterLight);
  img.ellipse(8, 13, 4, 1.2, C.sea);
  img.rect(6, 3, 5, 10, C.wood);
  img.vline(10, 3, 12, C.woodDark).vline(6, 3, 12, C.woodLight);
  img.ellipse(8, 3, 2.5, 1, C.woodLight);
  img.hline(6, 10, 7, C.woodDark);
  img.outline(C.outline);
  img.set(3, 13, C.foam).set(13, 13, C.foam);
  return img;
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
    "foothill-a": drawFoothill(48, 32, 101),
    "foothill-b": drawFoothill(64, 40, 103),
    "cliff-wall": drawCliffWall(),
    waterfall: drawWaterfall(),
    "cave-entrance": drawCave(),
    lighthouse: drawLighthouse(),
    "sea-rock": drawSeaRock(32, 24, 107),
    "sea-rock-b": drawSeaRock(24, 20, 109),
    piling: drawPiling(),
    boat: drawBoat(),
    "beach-umbrella": drawUmbrella(),
    "beach-towel": drawTowel(),
    shells: drawShells(),
    starfish: drawStarfish(),
    sandcastle: drawSandcastle(),
  };
}
