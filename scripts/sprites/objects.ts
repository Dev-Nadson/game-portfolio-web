import { Img, rng, sheet, type SpriteOut } from "./draw";
import { C } from "./palette";

/** Objetos externos: praça, horta e decoração da vila. */

function post(img: Img, x: number, top: number, bottom: number) {
  img.rect(x, top, 3, bottom - top, C.wood);
  img.vline(x, top, bottom - 1, C.woodDark);
  img.set(x + 2, top, C.woodLight);
}

/** Quadro de avisos 32x32 — seção "Sobre". */
function bulletinBoard(): Img {
  const img = new Img(32, 32);
  post(img, 4, 20, 31);
  post(img, 25, 20, 31);
  // telhadinho
  img.rect(1, 1, 30, 4, C.red).hline(2, 29, 1, C.redLight).hline(1, 30, 4, "#8f3526");
  // quadro
  img.rect(2, 5, 28, 18, C.woodDark);
  img.rect(4, 7, 24, 14, C.wood);
  img.checker(4, 7, 24, 14, C.wood, "#b0623f");
  // papéis
  const papers: [number, number, number, number, string][] = [
    [6, 8, 8, 7, C.paper],
    [16, 9, 10, 6, C.white],
    [9, 15, 7, 5, C.cream],
    [18, 16, 7, 4, C.paper],
  ];
  for (const [x, y, w, h, c] of papers) {
    img.rect(x, y, w, h, c);
    for (let yy = y + 2; yy < y + h - 1; yy += 2) img.hline(x + 1, x + w - 2, yy, C.stoneMid);
  }
  img.set(10, 8, C.redLight).set(21, 9, C.blue).set(12, 15, C.yellow).set(21, 16, C.grassDark);
  return img.outline(C.outline).shadow(16, 31, 12, 1.5);
}

/** Caixa de correio 16x24 — seção "Contato". */
function mailbox(): Img {
  const img = new Img(16, 24);
  post(img, 7, 12, 23);
  img.rect(2, 3, 12, 9, "#4a7fc1");
  img.rect(3, 2, 10, 1, "#4a7fc1");
  img.hline(3, 12, 3, C.sky);
  img.rect(2, 10, 12, 2, "#35599a");
  img.rect(4, 6, 6, 2, "#35599a");
  // bandeirinha
  img.vline(14, 2, 7, C.stoneDark);
  img.rect(14, 1, 2, 3, C.redLight);
  // carta saindo
  img.rect(5, 4, 5, 3, C.white).set(7, 5, C.redLight);
  return img.outline(C.outline).shadow(8, 23, 5, 1.2);
}

/** Placa de direções 16x32 — seção "Idiomas" (PT / EN). */
function signpost(): Img {
  const img = new Img(20, 32);
  post(img, 9, 3, 31);
  // placa PT apontando pra esquerda
  img.rect(2, 5, 14, 7, C.woodLight);
  img.set(1, 8, C.woodLight).vline(1, 7, 9, C.woodLight);
  img.hline(2, 15, 11, C.wood);
  img.text(5, 6, "PT", C.woodDark);
  // placa EN apontando pra direita
  img.rect(4, 14, 14, 7, C.woodLight);
  img.vline(18, 16, 18, C.woodLight);
  img.hline(4, 17, 20, C.wood);
  img.text(8, 15, "EN", C.woodDark);
  return img.outline(C.outline).shadow(10, 31, 5, 1.2);
}

/** Poço de pedra 32x32 — centro da praça. */
function well(): Img {
  const img = new Img(32, 34);
  // telhado
  img.rect(3, 2, 26, 6, C.wood);
  img.hline(3, 28, 2, C.woodLight).hline(3, 28, 7, C.woodDark);
  for (let x = 5; x < 28; x += 4) img.vline(x, 3, 6, C.woodDark);
  post(img, 6, 8, 20);
  post(img, 23, 8, 20);
  // corda e balde
  img.hline(8, 23, 10, C.woodDark);
  img.vline(16, 10, 14, C.cream);
  img.rect(14, 14, 5, 4, C.stoneDark).hline(14, 18, 14, C.stone);
  // anel de pedra
  img.ellipse(16, 22, 13, 5, C.stoneDark);
  img.ellipse(16, 22, 10, 3, C.water);
  img.hline(10, 14, 21, C.waterLight);
  img.rect(3, 22, 27, 9, C.stoneMid);
  img.ellipse(16, 30, 13.5, 3, C.stoneMid);
  for (let x = 4; x < 30; x += 5) {
    img.vline(x, 23, 30, C.stoneDark);
    img.hline(x + 1, x + 3, 26, C.stone);
  }
  img.hline(3, 29, 22, C.stone);
  return img.outline(C.outline).shadow(16, 33, 14, 1.5);
}

/** Poste de luz 16x32. */
function lamp(): Img {
  const img = new Img(16, 32);
  img.rect(7, 10, 2, 20, C.slate);
  img.rect(5, 29, 6, 2, C.slate);
  img.rect(4, 2, 8, 8, C.slate);
  img.rect(5, 3, 6, 6, C.yellow);
  img.rect(6, 4, 2, 3, "#fff3b0");
  img.hline(3, 12, 1, C.slate).hline(5, 10, 0, C.slate);
  return img.outline(C.outline).shadow(8, 31, 4, 1);
}

/** Banco de praça 32x16. */
function bench(): Img {
  const img = new Img(32, 18);
  img.rect(2, 2, 28, 3, C.wood).hline(2, 29, 2, C.woodLight);
  img.rect(2, 6, 28, 3, C.wood).hline(2, 29, 6, C.woodLight);
  img.rect(2, 10, 28, 2, C.woodDark);
  for (const x of [4, 26]) img.rect(x, 5, 2, 11, C.slate);
  return img.outline(C.outline).shadow(16, 16, 13, 1.2);
}

/** Canteiro de flores 16x16 (decoração). */
function flowerBed(): Img {
  const img = new Img(16, 16);
  img.rect(1, 8, 14, 7, C.soil).hline(1, 14, 8, C.soilLight);
  const flowers: [number, number, string][] = [
    [3, 5, C.pink],
    [8, 4, C.yellow],
    [12, 6, C.purpleLight],
    [5, 9, C.redLight],
    [11, 10, C.sky],
  ];
  for (const [x, y, c] of flowers) {
    img.vline(x, y + 1, y + 4, C.grassDark);
    img.set(x - 1, y, c).set(x + 1, y, c).set(x, y - 1, c).set(x, y + 1, c).set(x, y, C.yellow);
  }
  return img.outline(C.outline);
}

/** Placas dos canteiros da horta, 16x16, uma por categoria da stack. */
export const PLOT_SIGNS = {
  backend: { label: "API", color: C.grassDark },
  frontend: { label: "UI", color: C.orange },
  data: { label: "DB", color: "#4a7fc1" },
  ai: { label: "IA", color: C.purple },
  devops: { label: "OPS", color: C.red },
} as const;

function plotSign(label: string, color: string): Img {
  const img = new Img(16, 16);
  post(img, 7, 9, 15);
  img.rect(1, 1, 14, 9, C.woodLight);
  img.rect(1, 1, 14, 2, color);
  img.hline(1, 14, 9, C.wood);
  img.textCenter(8, 4, label, C.woodDark);
  return img.outline(C.outline);
}

/** Estrela piscante (2 frames de 8x8) que marca conteúdo ainda não visto. */
function sparkle(): SpriteOut {
  const a = new Img(8, 8);
  a.vline(3, 0, 6, C.yellow).hline(0, 6, 3, C.yellow).set(3, 3, C.white);
  const b = new Img(8, 8);
  b.vline(3, 1, 5, C.white).hline(1, 5, 3, C.white).set(3, 3, C.yellow);
  b.set(1, 1, C.yellow).set(5, 1, C.yellow).set(1, 5, C.yellow).set(5, 5, C.yellow);
  return { img: sheet([a.outline(C.outline), b.outline(C.outline)], 2), frame: { w: 8, h: 8 } };
}

/** Cinzas do piso da praça (paralelepípedos, rejunte, meio-fio e medalhão). */
const PAVE = {
  stones: ["#b4b8c6", "#a2a7b8", "#c3c7d3", "#9499ab"],
  light: "#d3d7e1",
  shade: "#8a8fa2",
  mortar: "#6d7286",
  curb: "#7d8396",
  curbLight: "#a9afbf",
  curbDark: "#5d6276",
  medal: "#b8bdca",
  starLight: "#f1f2f6",
  starDark: "#9da3b5",
  starLight2: "#d9dce4",
  starDark2: "#8e93a6",
};

/** Hash inteiro simples para variar a cor de cada pedra. */
function pick(a: number, b: number, n: number): number {
  const h = Math.imul(a * 73856093 + 19, 2654435761) ^ Math.imul(b * 19349663 + 7, 83492791);
  return ((h >>> 0) % n + n) % n;
}

/**
 * Piso da praça redonda (160x160, raio de 5 tiles): anéis concêntricos de
 * paralelepípedos, rosa-dos-ventos de 8 pontas no centro (sob o poço) e
 * meio-fio de blocos na borda. Fica no chão, sob todos os objetos.
 */
function plazaFloor(): Img {
  const S = 160;
  const c = (S - 1) / 2;
  const R = 80;
  const MEDAL = 36;
  const RING = 6.5;
  const img = new Img(S, S);
  const TAU = Math.PI * 2;
  const starR = (ang: number) => {
    const p = Math.round(ang / (Math.PI / 4));
    const delta = Math.abs(ang - (p * Math.PI) / 4);
    const tip = p % 2 === 0 ? 31 : 20;
    return { r: tip - (tip - 6) * (delta / (Math.PI / 8)), main: p % 2 === 0, side: ang - (p * Math.PI) / 4 > 0 };
  };
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - c;
      const dy = y - c;
      const d = Math.hypot(dx, dy);
      if (d > R - 0.5) continue;
      // ângulo a partir do norte, sentido horário (0..2π)
      const ang = (Math.atan2(dx, -dy) + TAU) % TAU;
      let color: string;
      if (d > R - 6) {
        // meio-fio: blocos de ~10px
        const n = Math.round((TAU * (R - 3)) / 10);
        const a = (ang / TAU) * n;
        const seam = (a - Math.floor(a)) * 10 < 1;
        if (d > R - 1.5 || seam) color = PAVE.curbDark;
        else if (d < R - 4.5) color = dy < 0 ? PAVE.curbLight : PAVE.curb;
        else color = PAVE.curb;
      } else if (d < MEDAL) {
        // medalhão com rosa-dos-ventos
        const star = starR(ang);
        if (d > MEDAL - 2.5) color = PAVE.curbDark;
        else if (d < 2.5) color = PAVE.mortar;
        else if (d < star.r) {
          if (star.main) color = star.side ? PAVE.starLight : PAVE.starDark;
          else color = star.side ? PAVE.starLight2 : PAVE.starDark2;
        } else if (Math.abs(d - (MEDAL - 7)) < 0.7) color = PAVE.shade;
        else color = PAVE.medal;
      } else {
        // anéis de paralelepípedos, desencontrados de um anel para o outro
        const rr = d - MEDAL;
        const ring = Math.floor(rr / RING);
        const inRing = rr - ring * RING;
        const rm = MEDAL + (ring + 0.5) * RING;
        const n = Math.max(8, Math.round((TAU * rm) / 7));
        const a = (ang / TAU) * n + (ring % 2) * 0.5;
        const k = Math.floor(a);
        const along = (a - k) * ((TAU * rm) / n);
        if (inRing < 1 || along < 1) color = PAVE.mortar;
        else if (inRing < 2 || along < 2) color = PAVE.light;
        else if (inRing > RING - 1.2) color = PAVE.shade;
        else color = PAVE.stones[pick(ring, ((k % n) + n) % n, PAVE.stones.length)];
      }
      img.set(x, y, color);
    }
  }
  return img;
}

type FlowerKind = "tulip" | "daisy" | "lavender" | "buttercup" | "poppy";

const PETALS: Record<FlowerKind, { main: string; dark: string; light: string; center?: string }> = {
  tulip: { main: C.pink, dark: "#d65d9a", light: "#ffc2df" },
  daisy: { main: C.white, dark: C.stone, light: C.white, center: C.yellow },
  lavender: { main: C.purpleLight, dark: C.purple, light: "#e2c8fa" },
  buttercup: { main: C.yellow, dark: C.orange, light: "#fff1a8" },
  poppy: { main: C.redLight, dark: C.red, light: "#ff9a8a", center: C.ink },
};

/**
 * Raminho de flores 16x16: 2–3 hastes finas de alturas diferentes, folhas
 * e cabeças de uma espécie. Sem contorno nas hastes e folhas (só as
 * pétalas têm a borda de baixo mais escura), para parecer planta, não carimbo.
 */
function flowerSprig(kind: FlowerKind, seed: number): Img {
  const img = new Img(16, 16);
  const rand = rng(seed);
  const p = PETALS[kind];
  img.ellipse(8, 14.5, 6, 1.4, "#00000022");
  // touceira de folhas na base, que dá volume
  img.ellipse(8, 13, 5, 2, C.grassDark);
  img.ellipse(7, 12.5, 3, 1.2, C.grass);
  for (const [lx, ly] of [
    [3, 12],
    [13, 12],
    [5, 10],
    [11, 10],
  ])
    img.set(lx, ly, rand() < 0.5 ? C.grass : C.leaf);
  const stems = rand() < 0.5 ? [4, 8, 12] : [3, 7, 10, 13];
  for (const base of stems) {
    const x = base + Math.round((rand() - 0.5) * 2);
    const head = 2 + Math.floor(rand() * 6);
    const lean = rand() < 0.5 ? -1 : 1;
    // haste levemente curva
    for (let y = head + 1; y <= 12; y++) img.set(y < head + 3 && rand() < 0.4 ? x + lean : x, y, C.grassDark);
    if (rand() < 0.6) img.set(x + lean, head + 4, C.grass).set(x + 2 * lean, head + 3, C.leaf);
    // cabeça
    if (kind === "tulip") {
      img.set(x - 1, head - 1, p.light).set(x + 1, head - 1, p.main);
      img.hline(x - 1, x + 1, head, p.main).set(x - 1, head, p.light);
      img.hline(x - 1, x + 1, head + 1, p.main).set(x + 1, head + 1, p.dark);
      img.set(x, head + 2, p.dark);
    } else if (kind === "daisy") {
      img.hline(x - 1, x + 1, head - 1, p.light).hline(x - 2, x + 2, head, p.main).hline(x - 1, x + 1, head + 1, p.dark);
      img.set(x, head - 2, p.light).set(x, head + 2, p.dark);
      img.set(x, head, p.center ?? p.main);
    } else if (kind === "lavender") {
      for (let k = 0; k < 5; k++) {
        img.set(x, head + k, k === 0 ? p.light : k % 2 ? p.dark : p.main);
        if (k > 0 && k < 4) img.set(x + (k % 2 ? 1 : -1), head + k, p.main);
      }
    } else if (kind === "buttercup") {
      img.hline(x - 1, x + 1, head, p.main).set(x - 1, head, p.light);
      img.hline(x - 1, x + 1, head + 1, p.main).set(x + 1, head + 1, p.dark);
      img.set(x, head - 1, p.light).set(x, head + 2, p.dark);
    } else {
      img.hline(x - 2, x + 1, head, p.main).set(x - 2, head, p.light);
      img.hline(x - 2, x + 1, head + 1, p.dark).set(x - 1, head + 1, p.main);
      img.set(x - 1, head - 1, p.light).set(x, head - 1, p.main);
      img.set(x - 1, head, p.center ?? p.main);
    }
  }
  return img;
}

/** Tufo de capim alto 16x16, para preencher entre as flores. */
function tallGrass(seed: number): Img {
  const img = new Img(16, 16);
  const rand = rng(seed);
  img.ellipse(8, 14.5, 5, 1.2, "#00000022");
  for (let i = 0; i < 5; i++) {
    const x0 = 4 + Math.floor(rand() * 8);
    const len = 5 + Math.floor(rand() * 6);
    const lean = (rand() - 0.5) * 0.5;
    for (let k = 0; k < len; k++) {
      const x = Math.round(x0 + lean * k);
      img.set(x, 14 - k, k > len - 3 ? C.leaf : k > len / 2 ? C.grass : C.grassDark);
    }
  }
  return img;
}

/** Vitória-régia: duas folhas redondas com recorte e uma florzinha. */
function lilyPad(): Img {
  const img = new Img(16, 16);
  const pad = (cx: number, cy: number, r: number, flower: boolean) => {
    img.ellipse(cx, cy, r + 0.6, r * 0.65 + 0.6, "#2f7a43");
    img.ellipse(cx, cy, r, r * 0.65, C.grassDark);
    img.ellipse(cx - 1, cy - 0.6, r * 0.55, r * 0.3, C.grass);
    // recorte em cunha até o centro
    img.line(Math.round(cx), Math.round(cy), Math.round(cx + r), Math.round(cy - 1), C.sea);
    img.set(Math.round(cx + r - 1), Math.round(cy), C.sea);
    if (flower) img.set(cx - 1, cy - 2, C.pink).set(cx, cy - 2, "#ffc2df").set(cx - 1, cy - 1, C.pink).set(cx, cy - 1, C.yellow);
  };
  pad(6, 9, 4, true);
  pad(11.5, 12, 2.6, false);
  return img;
}

/** Taboas 16x24: hastes compridas com as espigas marrons e folhas finas. */
function cattails(): Img {
  const img = new Img(16, 24);
  for (const [x, top, spike] of [
    [5, 5, true],
    [8, 2, true],
    [11, 7, true],
    [7, 10, false],
    [12, 12, false],
  ] as const) {
    img.vline(x, top, 22, C.grassDark);
    if (spike) {
      img.rect(x - 1, top + 2, 3, 6, C.woodDark);
      img.vline(x - 1, top + 2, top + 7, C.wood);
      img.set(x, top + 1, C.grassDark).set(x, top, C.grassDark);
    }
  }
  for (const [x, y, dx] of [
    [4, 22, -1],
    [10, 22, 1],
    [6, 22, -1],
  ] as const)
    for (let k = 0; k < 7; k++) img.set(x + Math.round((dx * k) / 3), y - k, k > 4 ? C.leaf : C.grass);
  return img;
}

/** Patinho 16x16 em 2 quadros (boiando), virado para a direita. */
function duck(): SpriteOut {
  const frames = [0, 1].map((bob) => {
    const img = new Img(16, 16);
    const y = 8 + bob;
    img.ellipse(7, y + 1, 5, 3, C.white);
    img.ellipse(7, y + 2, 4, 1.4, C.stone);
    img.circle(11, y - 2, 2.2, C.white);
    img.set(12, y - 3, C.ink);
    img.hline(13, 14, y - 2, C.orange).set(13, y - 1, C.orange);
    img.set(3, y, C.white).set(2, y - 1, C.white);
    img.outline(C.outline);
    // ondinha na água em volta
    img.hline(1, 13, y + 4, C.waterLight);
    img.set(bob ? 0 : 14, y + 3, C.foam);
    return img;
  });
  return { img: sheet(frames, 2), frame: { w: 16, h: 16 } };
}

/** Laje chata de pedra para a trilha da ilha (fica no chão). */
function steppingStone(seed: number): Img {
  const img = new Img(16, 16);
  const rand = rng(seed);
  img.ellipse(8, 10, 6.5, 3.8, C.stoneDark);
  img.ellipse(8, 9.5, 5.8, 3.2, C.stoneMid);
  img.ellipse(7, 8.8, 3.6, 1.8, C.stone);
  if (rand() < 0.7) img.set(11, 10, C.grassDark).set(12, 10, C.grass);
  return img;
}

/** Borboleta 16x16 em 2 quadros (asas abertas e fechadas). */
function butterfly(wing: string, spot: string): SpriteOut {
  const open = new Img(16, 16).ascii(3, 4, [
    "ww...ww",
    "wsw.wsw",
    "wwwbwww",
    ".wwbww.",
    ".w.b.w.",
  ], { w: wing, s: spot, b: C.ink });
  const shut = new Img(16, 16).ascii(3, 4, [
    "..w.w..",
    "..wbw..",
    "..wbw..",
    "...b...",
    ".......",
  ], { w: wing, b: C.ink });
  return { img: sheet([open.outline(C.outline), shut.outline(C.outline)], 2), frame: { w: 16, h: 16 } };
}

export function drawObjects(): Record<string, SpriteOut> {
  const out: Record<string, SpriteOut> = {
    "obj-bulletin": bulletinBoard(),
    "obj-mailbox": mailbox(),
    "obj-signpost": signpost(),
    "obj-well": well(),
    "obj-lamp": lamp(),
    "obj-bench": bench(),
    "obj-flowerbed": flowerBed(),
    sparkle: sparkle(),
    "plaza-floor": plazaFloor(),
    "tall-grass": tallGrass(201),
    "tall-grass-b": tallGrass(203),
    "lily-pad": lilyPad(),
    cattails: cattails(),
    duck: duck(),
    "stepping-stone": steppingStone(211),
    butterfly: butterfly(C.orange, C.yellow),
    "butterfly-blue": butterfly(C.sky, C.white),
  };
  (Object.keys(PETALS) as FlowerKind[]).forEach((kind, i) => {
    out[`flower-${kind}`] = flowerSprig(kind, 300 + i * 7);
    out[`flower-${kind}-b`] = flowerSprig(kind, 401 + i * 11);
  });
  for (const [id, { label, color }] of Object.entries(PLOT_SIGNS)) {
    out[`sign-${id}`] = plotSign(label, color);
  }
  return out;
}
