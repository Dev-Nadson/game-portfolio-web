import { Img, rng } from "./draw";
import { C } from "./palette";
import type { CustomTile } from "../../src/maps/tileset";

const T = 16;

/** Mesma cor do tile de grama do Kenney, para as bordas emendarem. */
const GRASS = "#84c669";

/**
 * Tile de água com margem de grama. `land(x, y)` diz se o pixel é terra;
 * o resto é água. A linha de margem e a espuma saem das vizinhanças.
 */
function waterTile(land: (x: number, y: number) => boolean): Img {
  const img = new Img(T, T);
  const rand = rng(7);
  for (let y = 0; y < T; y++) {
    for (let x = 0; x < T; x++) {
      if (land(x, y)) {
        // barranco de terra na beira da água
        const nearWater = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => !outside(x + dx, y + dy) && !land(x + dx, y + dy));
        img.set(x, y, nearWater ? C.dirtDark : GRASS);
        continue;
      }
      const nearLand = land(x - 1, y) || land(x + 1, y) || land(x, y - 1) || land(x, y + 1);
      const nearLand2 = land(x, y - 2) || land(x - 2, y) || land(x + 2, y);
      if (nearLand) img.set(x, y, C.outline);
      else if (nearLand2) img.set(x, y, C.waterLight);
      else img.set(x, y, rand() < 0.04 ? C.waterLight : C.water);
    }
  }
  // ondinhas
  const waves: [number, number][] = [
    [3, 5],
    [10, 11],
  ];
  for (const [wx, wy] of waves) {
    if (!land(wx, wy) && !land(wx + 3, wy) && !land(wx, wy - 2)) {
      img.hline(wx, wx + 2, wy, C.waterLight);
      img.set(wx + 3, wy - 1, C.waterLight);
    }
  }
  return img;
}

const B = 3; // largura da margem de grama

function outside(x: number, y: number): boolean {
  return x < 0 || y < 0 || x >= T || y >= T;
}

function water(side: { n?: boolean; s?: boolean; w?: boolean; e?: boolean }): Img {
  return waterTile((x, y) => {
    if (outside(x, y)) return false;
    if (side.n && y < B) return true;
    if (side.s && y >= T - B) return true;
    if (side.w && x < B) return true;
    if (side.e && x >= T - B) return true;
    // arredonda os cantos externos
    const r = 4;
    const far = (cx: number, cy: number) => (x - cx) ** 2 + (y - cy) ** 2 > r * r;
    const lo = B + r;
    const hi = T - 1 - B - r;
    if (side.n && side.w && x < lo && y < lo && far(lo, lo)) return true;
    if (side.n && side.e && x > hi && y < lo && far(hi, lo)) return true;
    if (side.s && side.w && x < lo && y > hi && far(lo, hi)) return true;
    if (side.s && side.e && x > hi && y > hi && far(hi, hi)) return true;
    return false;
  });
}

function waterInner(cx: number, cy: number): Img {
  // só um quarto de círculo de grama num canto
  return waterTile((x, y) => !outside(x, y) && (x - cx) ** 2 + (y - cy) ** 2 < 20);
}

function soil(): Img {
  const img = new Img(T, T);
  img.rect(0, 0, T, T, GRASS);
  img.rect(1, 1, 14, 14, C.soil);
  img.frame(1, 1, 14, 14, C.soilDark);
  for (const y of [4, 8, 12]) img.hline(3, 12, y, C.soilDark);
  for (const y of [3, 7, 11]) img.hline(3, 12, y, C.soilLight);
  [0, 15].forEach((x) => [0, 15].forEach((y) => img.set(x, y, GRASS)));
  return img;
}

function planks(base: string, light: string, dark: string, offset: number): Img {
  const img = new Img(T, T);
  img.rect(0, 0, T, T, base);
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    img.hline(0, 15, y, light);
    img.hline(0, 15, y + 3, dark);
    const seam = (row * 7 + offset) % 16;
    img.vline(seam, y, y + 3, dark);
  }
  return img;
}

function clinicFloor(): Img {
  const img = new Img(T, T);
  img.rect(0, 0, 8, 8, C.white).rect(8, 8, 8, 8, C.white);
  img.rect(8, 0, 8, 8, C.mint).rect(0, 8, 8, 8, C.mint);
  img.hline(0, 15, 15, "#a9d6c4").vline(15, 0, 15, "#a9d6c4");
  return img;
}

function parquet(flip: boolean): Img {
  const img = new Img(T, T);
  const a = C.dirtDark;
  const b = C.dirt;
  for (let q = 0; q < 4; q++) {
    const qx = (q % 2) * 8;
    const qy = Math.floor(q / 2) * 8;
    const horizontal = (q === 0 || q === 3) !== flip;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const stripe = horizontal ? Math.floor(j / 2) : Math.floor(i / 2);
        img.set(qx + i, qy + j, stripe % 2 === 0 ? a : b);
      }
    }
  }
  return img;
}

function wallTrim(): Img {
  const img = new Img(T, T);
  img.rect(0, 0, T, T, C.black);
  img.rect(0, 10, T, 6, C.outline);
  img.hline(0, 15, 13, C.woodDark);
  img.hline(0, 15, 15, C.wood);
  return img;
}

function wallpaper(kind: "office" | "clinic" | "school", lower: boolean): Img {
  const img = new Img(T, T);
  if (kind === "office") {
    img.rect(0, 0, T, T, C.stoneMid);
    img.vline(3, 0, 15, C.stone).vline(11, 0, 15, C.stone);
    img.vline(4, 0, 15, "#7a8aa3").vline(12, 0, 15, "#7a8aa3");
  } else if (kind === "clinic") {
    img.rect(0, 0, T, T, C.mint);
    const dots: [number, number, string][] = [
      [3, 3, C.pink],
      [11, 7, C.yellow],
      [5, 12, C.sky],
    ];
    for (const [x, y, c] of dots) img.rect(x, y, 2, 2, c);
  } else {
    img.rect(0, 0, T, T, C.cream);
    img.vline(7, 0, 15, "#f0b98a");
    img.vline(15, 0, 15, "#f0b98a");
  }
  if (lower) {
    // lambri + rodapé
    if (kind === "school") {
      img.rect(0, 6, T, 10, C.wood);
      img.hline(0, 15, 6, C.woodLight);
      img.vline(4, 7, 13, C.woodDark).vline(12, 7, 13, C.woodDark);
    }
    img.rect(0, 13, T, 3, C.woodDark);
    img.hline(0, 15, 13, C.wood);
  }
  return img;
}

function exitMat(): Img {
  const img = planks(C.wood, C.woodLight, C.woodDark, 3);
  img.rect(2, 3, 12, 10, C.red);
  img.frame(2, 3, 12, 10, C.outline);
  img.frame(3, 4, 10, 8, C.yellow);
  // seta para baixo
  img.hline(6, 9, 6, C.white).hline(7, 8, 7, C.white);
  img.hline(6, 9, 8, C.white).hline(7, 8, 9, C.white);
  return img;
}

export function drawCustomTiles(): Record<CustomTile, Img> {
  return {
    water_tl: water({ n: true, w: true }),
    water_t: water({ n: true }),
    water_tr: water({ n: true, e: true }),
    water_l: water({ w: true }),
    water_c: water({}),
    water_r: water({ e: true }),
    water_bl: water({ s: true, w: true }),
    water_b: water({ s: true }),
    water_br: water({ s: true, e: true }),
    water_in_tl: waterInner(-1, -1),
    water_in_tr: waterInner(T, -1),
    water_in_bl: waterInner(-1, T),
    water_in_br: waterInner(T, T),
    soil: soil(),
    floor_wood_a: planks(C.wood, C.woodLight, C.woodDark, 0),
    floor_wood_b: planks(C.wood, C.woodLight, C.woodDark, 9),
    floor_clinic: clinicFloor(),
    floor_school_a: parquet(false),
    floor_school_b: parquet(true),
    wall_trim: wallTrim(),
    wall_office_top: wallpaper("office", false),
    wall_office_bottom: wallpaper("office", true),
    wall_clinic_top: wallpaper("clinic", false),
    wall_clinic_bottom: wallpaper("clinic", true),
    wall_school_top: wallpaper("school", false),
    wall_school_bottom: wallpaper("school", true),
    void: new Img(T, T).rect(0, 0, T, T, C.black),
    exit_mat: exitMat(),
  };
}
