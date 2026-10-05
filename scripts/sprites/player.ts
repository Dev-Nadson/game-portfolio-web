import { Img, sheet } from "./draw";
import { C } from "./palette";

/**
 * Personagem principal: frames de 16x24, 4 direções x 4 frames.
 * Linhas da spritesheet: baixo, esquerda, direita, cima.
 * Colunas: passo A, parado, passo B, parado (ciclo de caminhada).
 *
 * Cada pose é "tronco" (cabeça + corpo) + "pernas", para que os passos
 * troquem só as pernas. O contorno escuro é aplicado no final.
 */
export const PLAYER_FRAME = { w: 16, h: 24 };

const PAL: Record<string, string> = {
  h: "#3d212d", // cabelo
  H: "#6b3a3a", // brilho do cabelo
  s: "#c98a60", // pele
  S: "#a8694a", // sombra da pele
  e: C.ink, // olhos
  t: "#4a7fc1", // camisa
  T: "#35599a", // sombra da camisa
  c: C.stone, // gola
  p: "#3f4a6a", // calça
  P: C.ink,
  b: C.woodDark, // botas
};

const DOWN_TOP = [
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
  "..Tt tttc cttt tT..",
  "..Tt tttt tttt tT..",
  "..Tt tttt tttt tT..",
  "..Tt tttt tttt tT..",
  "..sT tttt tttt Ts..",
  "..s. Pppp pppP .s..",
];

const UP_TOP = [
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
  "..Tt tttt tttt tT..",
  "..Tt tttt tttt tT..",
  "..Tt tttT Tttt tT..",
  "..Tt tttt tttt tT..",
  "..sT tttt tttt Ts..",
  "..s. Pppp pppP .s..",
];

const LEFT_TOP = [
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
  ".... tTTt tttT ....",
  ".... tTtt tttT ....",
  ".... tstt tttT ....",
  ".... Pppp pppP ....",
];

const LEGS_FRONT = {
  stand: [
    ".... pppp pppp ....",
    ".... ppp. .ppp ....",
    ".... ppp. .ppp ....",
    ".... bbb. .bbb ....",
    "...b bb.. ..bb b...",
  ],
  stepA: [
    ".... pppp pppp ....",
    ".... ppp. .ppp ....",
    ".... bbb. .ppp ....",
    "...b bb.. .bbb ....",
    ".... .... ..bb b...",
  ],
  stepB: [
    ".... pppp pppp ....",
    ".... ppp. .ppp ....",
    ".... ppp. .bbb ....",
    ".... bbb. ..bb b...",
    "...b bb.. .... ....",
  ],
};

const LEGS_SIDE = {
  stand: [
    ".... .ppp pp.. ....",
    ".... .ppp pp.. ....",
    ".... .ppp pp.. ....",
    ".... .bbb bb.. ....",
    "...b bbbb b... ....",
  ],
  stepA: [
    ".... pppp ppp. ....",
    "...p pp.. .pp. ....",
    "...p p... ..pp ....",
    "..bb .... ..bb ....",
    "..bb b... ..bb b...",
  ],
  stepB: [
    ".... .ppp pp.. ....",
    ".... .ppp pp.. ....",
    ".... pp.. ppp. ....",
    "...b bb.. .bbb ....",
    "..bb b... .bbb ....",
  ],
};

function pose(top: string[], legs: string[], bob: number): Img {
  const img = new Img(PLAYER_FRAME.w, PLAYER_FRAME.h);
  img.ascii(0, 18, legs, PAL);
  img.ascii(0, 1 + bob, top, PAL);
  return img.outline(C.outline);
}

function walk(top: string[], legs: typeof LEGS_FRONT): Img[] {
  return [
    pose(top, legs.stepA, 1),
    pose(top, legs.stand, 0),
    pose(top, legs.stepB, 1),
    pose(top, legs.stand, 0),
  ];
}

export function drawPlayer(): Img {
  const down = walk(DOWN_TOP, LEGS_FRONT);
  const up = walk(UP_TOP, LEGS_FRONT);
  const left = walk(LEFT_TOP, LEGS_SIDE);
  const right = left.map((f) => f.flipX());
  return sheet([...down, ...left, ...right, ...up], 4);
}
