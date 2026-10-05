import { Img, sheet, type SpriteOut } from "./draw";
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
  };
  for (const [id, { label, color }] of Object.entries(PLOT_SIGNS)) {
    out[`sign-${id}`] = plotSign(label, color);
  }
  return out;
}
