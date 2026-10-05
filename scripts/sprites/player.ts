import { Img, sheet } from "./draw";
import { C } from "./palette";
import { PLAYER_COLS, PLAYER_FRAME } from "../../src/entities/player-sheet";

/**
 * Personagem principal: frames de 16x24, layout em src/entities/player-sheet.ts
 * (por direção: parado + 6 frames de caminhada).
 *
 * Cada pose é montada em camadas: pernas (perna de trás mais escura),
 * corpo sem braços (cabeça + tronco) e braços por cima. Assim a
 * caminhada mexe pernas e braços sem redesenhar a cabeça. O contorno
 * escuro é aplicado no final.
 */
export { PLAYER_FRAME };

const PAL: Record<string, string> = {
  h: "#3d212d", // cabelo
  H: "#6b3a3a", // brilho do cabelo
  s: "#c98a60", // pele
  S: "#a8694a", // sombra da pele
  e: C.ink, // olhos
  t: "#4a7fc1", // camisa
  T: "#35599a", // sombra da camisa
  A: "#6a9be0", // brilho da manga (braço de perfil)
  c: C.stone, // gola
  p: "#3f4a6a", // calça (perna da frente)
  P: C.ink, // calça (perna de trás) e cinto
  b: C.woodDark, // bota (perna da frente)
  B: C.soilDark, // bota (perna de trás)
};

/** Linha (y) onde começam as pernas; o corpo é desenhado em y = 1 + bob. */
const LEGS_Y = 18;
/** Descida do corpo em cada frame da caminhada: desce 1px depois do contato. */
const BOB = [0, 1, 0, 0, 1, 0];

// ── corpos (cabeça + tronco, sem braços) ──

const DOWN_BODY = [
  ".... ..hh hh.. ....",
  ".... hhhh hhhh ....",
  "...h hHHh hhhh h...",
  "...h Hhhh hhhh h...",
  "...h hhhs hhhh h...",
  "...h ssss ssss h...",
  "...s sess sses s...",
  "...s sess sses s...",
  "...S ssss ssss S...",
  ".... Ssss sssS ....",
  ".... ..sS Ss.. ....",
  ".... tttc cttt ....",
  ".... tttt tttt ....",
  ".... tttt tttt ....",
  ".... tttt tttt ....",
  ".... tttt tttt ....",
  ".... Pppp pppP ....",
];

const UP_BODY = [
  ".... ..hh hh.. ....",
  ".... hhhh hhhh ....",
  "...h hhhh hHHh h...",
  "...h hhhh hhHh h...",
  "...h hhhh hhhh h...",
  "...h hhhh hhhh h...",
  "...h hhhh hhhh h...",
  "...h Hhhh hhhh h...",
  "...S hhhh hhhh S...",
  ".... hhhh hhhh ....",
  ".... ..sS Ss.. ....",
  ".... tttt tttt ....",
  ".... tttt tttt ....",
  ".... tttT Tttt ....",
  ".... tttt tttt ....",
  ".... tttt tttt ....",
  ".... Pppp pppP ....",
];

/** De perfil, olhando para a esquerda (a direita é o espelho). */
const SIDE_BODY = [
  ".... .hhh hh.. ....",
  ".... hhhh hhhh ....",
  "...h hHHh hhhh h...",
  "...h Hhhh hhhh h...",
  "...h shhh hhhh h...",
  "...s ssss hhhh h...",
  "...s esss shhh h...",
  "..ss esss Shhh h...",
  "...s ssss hhhh h...",
  ".... Ssss shhh ....",
  ".... .sSs .... ....",
  ".... tttt tttT ....",
  ".... tttt tttT ....",
  ".... tttt tttT ....",
  ".... tttt tttT ....",
  ".... tttt tttT ....",
  ".... Pppp pppP ....",
];

// ── braços ──
// Sobreposições nas linhas 11–16 do corpo (ombro até a mão).

/** Braços de frente/costas; `lift` = mão 1px mais alta (braço indo à frente). */
function frontArms(liftLeft: boolean, liftRight: boolean): string[] {
  const rows = Array.from({ length: 6 }, () => [..."................"]);
  const arm = (lift: boolean, outer: number, inner: number) => {
    const end = lift ? 3 : 4; // última linha da manga
    for (let r = 0; r < end; r++) {
      rows[r][outer] = "T";
      rows[r][inner] = "t";
    }
    rows[end][outer] = "s";
    rows[end][inner] = "T";
    rows[end + 1][outer] = "s";
  };
  arm(liftLeft, 2, 3);
  arm(liftRight, 13, 12);
  return rows.map((r) => r.join(""));
}

/** Braço visível de perfil (olhando para a esquerda): manga de 2px e mão. */
const SIDE_ARM = {
  neutral: [
    "................",
    "......AT........",
    "......AT........",
    "......AT........",
    "......ss........",
  ],
  forward: [
    "................",
    ".....AT.........",
    "....AT..........",
    "...AT...........",
    "..ss............",
  ],
  forwardHalf: [
    "................",
    "......AT........",
    ".....AT.........",
    ".....AT.........",
    "....ss..........",
  ],
  back: [
    "................",
    "........AT......",
    ".........AT.....",
    "..........AT....",
    "...........ss...",
  ],
  backHalf: [
    "................",
    ".......AT.......",
    ".......AT.......",
    "........AT......",
    "........ss......",
  ],
};

// ── pernas ──
// Cada pose de perna é uma lista de faixas [linha, x0, x1] a partir de
// LEGS_Y; as duas últimas faixas são a bota. De perfil o pé aponta para
// a esquerda.

type Span = [row: number, x0: number, x1: number];

const SIDE_LEG: Record<string, Span[]> = {
  stand: [[0, 6, 8], [1, 6, 8], [2, 6, 8], [3, 5, 8], [4, 4, 8]],
  /** calcanhar tocando o chão, à frente */
  forward: [[0, 6, 8], [1, 5, 7], [2, 4, 6], [3, 3, 5], [4, 2, 5]],
  /** à frente, já com o pé inteiro no chão (frame de descida) */
  forwardFlat: [[0, 6, 8], [1, 5, 7], [2, 5, 7], [3, 4, 6], [4, 3, 6]],
  /** atrás, empurrando com a ponta do pé */
  back: [[0, 7, 9], [1, 8, 10], [2, 9, 11], [3, 10, 11], [4, 9, 10]],
  /** atrás, pé saindo do chão */
  backLift: [[0, 7, 9], [1, 8, 10], [2, 10, 12], [3, 10, 12]],
  /** perna de apoio, na vertical */
  support: [[0, 6, 8], [1, 6, 8], [2, 6, 8], [3, 5, 7], [4, 4, 7]],
  /** passando por baixo do corpo com o pé erguido */
  passing: [[0, 7, 9], [1, 7, 9], [2, 6, 9], [3, 6, 8]],
};

/** De frente/costas: `up` = quantos px o pé sobe (perna que está andando). */
function frontLeg(side: "left" | "right", up: number): Span[] {
  const mirror = (x: number) => (side === "left" ? x : 15 - x);
  const span = (row: number, x0: number, x1: number): Span => {
    const [a, b] = [mirror(x0), mirror(x1)].sort((m, n) => m - n);
    return [row, a, b];
  };
  const spans: Span[] = [span(0, 4, 7)];
  for (let r = 1; r < 3 - up; r++) spans.push(span(r, 4, 6));
  spans.push(span(3 - up, 4, 6), span(4 - up, 3, 5));
  return spans;
}

function drawLeg(img: Img, spans: Span[], near: boolean): void {
  // as duas últimas faixas são a bota
  const pants = near ? PAL.p : PAL.P;
  const boot = near ? PAL.b : PAL.B;
  spans.forEach(([row, x0, x1], i) => img.hline(x0, x1, LEGS_Y + row, i >= spans.length - 2 ? boot : pants));
}

interface Pose {
  body: string[];
  arms: string[];
  /** linha do corpo onde a sobreposição dos braços começa */
  armsRow: number;
  far: Span[];
  near: Span[];
  bob: number;
  /** de frente/costas as duas pernas estão à mesma distância: mesma cor */
  sameShade?: boolean;
}

function pose(p: Pose): Img {
  const img = new Img(PLAYER_FRAME.w, PLAYER_FRAME.h);
  drawLeg(img, p.far, p.sameShade ?? false);
  drawLeg(img, p.near, true);
  img.ascii(0, 1 + p.bob, p.body, PAL);
  img.ascii(0, 1 + p.bob + p.armsRow, p.arms, PAL);
  return img.outline(C.outline);
}

/** Linha de frente ou costas: parado + 6 frames alternando as pernas. */
function frontRow(body: string[]): Img[] {
  const L = (up: number) => frontLeg("left", up);
  const R = (up: number) => frontLeg("right", up);
  // [perna esq. erguida, perna dir. erguida]; o braço oposto à perna que anda vai à frente
  const steps: [number, number][] = [[0, 1], [0, 1], [0, 0], [1, 0], [1, 0], [0, 0]];
  const frames = steps.map(([l, r], i) =>
    pose({ body, arms: frontArms(r > 0, l > 0), armsRow: 11, far: L(l), near: R(r), bob: BOB[i], sameShade: true })
  );
  const idle = pose({ body, arms: frontArms(false, false), armsRow: 11, far: L(0), near: R(0), bob: 0, sameShade: true });
  return [idle, ...frames];
}

/** Linha de perfil (esquerda). Frames 1–3: perna da frente avança; 4–6: a de trás. */
function sideRow(): Img[] {
  const g = SIDE_LEG;
  const a = SIDE_ARM;
  const steps: [Span[], Span[], string[]][] = [
    // [perna de trás, perna da frente, braço]
    [g.back, g.forward, a.back],
    [g.backLift, g.forwardFlat, a.backHalf],
    [g.passing, g.support, a.neutral],
    [g.forward, g.back, a.forward],
    [g.forwardFlat, g.backLift, a.forwardHalf],
    [g.support, g.passing, a.neutral],
  ];
  const frames = steps.map(([far, near, arms], i) =>
    pose({ body: SIDE_BODY, arms, armsRow: 11, far, near, bob: BOB[i] })
  );
  const idle = pose({ body: SIDE_BODY, arms: a.neutral, armsRow: 11, far: g.stand, near: g.stand, bob: 0 });
  return [idle, ...frames];
}

export function drawPlayer(): Img {
  const down = frontRow(DOWN_BODY);
  const up = frontRow(UP_BODY);
  const left = sideRow();
  const right = left.map((f) => f.flipX());
  return sheet([...down, ...left, ...right, ...up], PLAYER_COLS);
}
