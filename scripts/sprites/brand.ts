import { Img } from "./draw";
import { C } from "./palette";

/**
 * Logo da Catsuc em pixel art, redesenhada a partir do SVG oficial:
 * ícone em "C" chanfrado (rasterizado dos polígonos originais) e a
 * palavra "catsuc" em minúsculas geométricas, traço de 2px.
 *
 * Proporções do SVG (230 de altura): o ícone e o "t" ocupam a altura
 * toda, as outras letras 9 de 12 linhas (altura-x).
 */
export const LOGO_ICON = [
  ".....#####",
  "....######",
  "...#######",
  "..#.......",
  ".##.......",
  "###.......",
  "###.......",
  "###.......",
  "###.......",
  "##########",
  "###.######",
  "###..#####",
];

const X_HEIGHT_ROW = 3;

const GLYPHS: Record<string, string[]> = {
  c: [
    "..#####..",
    ".#######.",
    "###...###",
    "##.......",
    "##.......",
    "##.......",
    "###...###",
    ".#######.",
    "..#####..",
  ],
  a: [
    "..####.##",
    ".########",
    "###...###",
    "##.....##",
    "##.....##",
    "##.....##",
    "###...###",
    ".########",
    "..####.##",
  ],
  // o "t" sobe acima da altura-x: as 3 primeiras linhas ficam acima
  t: [
    "..##...",
    "..##...",
    "..##...",
    "#######",
    "#######",
    "..##...",
    "..##...",
    "..##...",
    "..##...",
    "..##...",
    "..#####",
    "...####",
  ],
  s: [
    ".#######",
    "########",
    "##......",
    "###.....",
    ".######.",
    ".....###",
    "......##",
    "########",
    "#######.",
  ],
  u: [
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "###..###",
    ".######.",
    "..####..",
  ],
};

const ICON_GAP = 4;
const LETTER_GAP = 1;

function stamp(img: Img, x: number, y: number, rows: string[], color: string): void {
  rows.forEach((row, j) => [...row].forEach((ch, i) => ch === "#" && img.set(x + i, y + j, color)));
}

/** Largura da palavra "catsuc" em px. */
export function wordmarkWidth(): number {
  return [..."catsuc"].reduce((w, ch) => w + GLYPHS[ch][0].length + LETTER_GAP, -LETTER_GAP);
}

/** Largura da logo completa (ícone + palavra). */
export const LOGO_WIDTH = LOGO_ICON[0].length + ICON_GAP + wordmarkWidth();
export const LOGO_HEIGHT = LOGO_ICON.length;

/** Desenha ícone + "catsuc" com o canto superior esquerdo em (x, y). */
export function drawCatsucLogo(img: Img, x: number, y: number, color: string = C.catsuc): void {
  stamp(img, x, y, LOGO_ICON, color);
  let cx = x + LOGO_ICON[0].length + ICON_GAP;
  for (const ch of "catsuc") {
    const glyph = GLYPHS[ch];
    const top = glyph.length === LOGO_HEIGHT ? y : y + X_HEIGHT_ROW;
    stamp(img, cx, top, glyph, color);
    cx += glyph[0].length + LETTER_GAP;
  }
}

/** Ícone 10x12 (ou 5x6 com `small`, para a marquise). */
export function drawCatsucIcon(img: Img, x: number, y: number, color: string = C.catsuc, small = false): void {
  stamp(img, x, y, small ? LOGO_ICON_SMALL : LOGO_ICON, color);
}

/** Ícone reduzido 5x6 (cada pixel = 2x2 do original, arredondado à mão). */
const LOGO_ICON_SMALL = [
  "..###",
  ".#...",
  "##...",
  "##...",
  "#####",
  "##.##",
];

/** Placa de parede com a logo, para o interior do escritório (80x24). */
export function drawLogoSign(): Img {
  const w = LOGO_WIDTH + 12;
  const img = new Img(w, 24);
  img.rect(1, 2, w - 2, 20, C.white);
  img.hline(1, w - 2, 21, C.stone);
  img.frame(1, 2, w - 2, 20, C.catsuc);
  drawCatsucLogo(img, 6, 6);
  return img.outline(C.outline);
}
