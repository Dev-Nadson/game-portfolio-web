import { EDGE_PARTS, KENNEY, customTile, type CustomTile, type EdgedTile } from "./tileset";

/**
 * Grade de terreno "semântica" (grama, caminho, água...) que vira tiles
 * com autotile. Os mapas descrevem O QUE existe em cada célula; a escolha
 * do tile certo (bordas, cantos) fica toda aqui.
 */
export type Terrain =
  | "grass"
  | "meadow"
  | "path"
  | "plaza"
  | "water"
  | "soil"
  | "sand"
  | "sea"
  | "rock"
  | "pier"
  | "void"
  | "wall"
  | "exit"
  | "floor-wood"
  | "floor-clinic"
  | "floor-school";

export type WallStyle = "office" | "clinic" | "school";

const SOLID: ReadonlySet<Terrain> = new Set(["water", "sea", "rock", "void", "wall"]);

/**
 * Quais vizinhos contam como "o mesmo terreno" no autotile. A cor da
 * margem fica gravada no tile, então a areia não desenha borda de grama
 * onde encosta no mar, e o mar trata o píer como água.
 */
const SAME_AS: Partial<Record<Terrain, ReadonlySet<Terrain>>> = {
  sand: new Set(["sand", "sea", "pier"]),
  sea: new Set(["sea", "pier"]),
};

export class TerrainGrid {
  readonly cells: Terrain[][];
  readonly fences: boolean[][];

  constructor(
    readonly width: number,
    readonly height: number,
    fill: Terrain
  ) {
    this.cells = Array.from({ length: height }, () => Array<Terrain>(width).fill(fill));
    this.fences = Array.from({ length: height }, () => Array<boolean>(width).fill(false));
  }

  get(x: number, y: number): Terrain | null {
    return this.cells[y]?.[x] ?? null;
  }

  rect(t: Terrain, x: number, y: number, w: number, h: number): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.cells[j]?.[i]) this.cells[j][i] = t;
    return this;
  }

  /**
   * Converte em `t` toda célula `within` que encosta (8 vizinhos) numa
   * célula `around` — ex.: a faixa de areia em volta de uma ilha de grama
   * no mar, incluindo as diagonais. `area` limita a busca (x, y, w, h).
   */
  ring(t: Terrain, around: Terrain, within: Terrain, area?: [number, number, number, number]): this {
    const [ax, ay, aw, ah] = area ?? [0, 0, this.width, this.height];
    const hits: [number, number][] = [];
    for (let y = ay; y < ay + ah; y++) {
      for (let x = ax; x < ax + aw; x++) {
        if (this.get(x, y) !== within) continue;
        let touches = false;
        for (let dy = -1; dy <= 1 && !touches; dy++)
          for (let dx = -1; dx <= 1 && !touches; dx++) touches = this.get(x + dx, y + dy) === around;
        if (touches) hits.push([x, y]);
      }
    }
    for (const [x, y] of hits) this.cells[y][x] = t;
    return this;
  }

  /** Cerca retangular (só o contorno), com aberturas opcionais. */
  fenceRect(x: number, y: number, w: number, h: number, gaps: [number, number][] = []): this {
    for (let i = x; i < x + w; i++) {
      this.fences[y][i] = true;
      this.fences[y + h - 1][i] = true;
    }
    for (let j = y; j < y + h; j++) {
      this.fences[j][x] = true;
      this.fences[j][x + w - 1] = true;
    }
    for (const [gx, gy] of gaps) this.fences[gy][gx] = false;
    return this;
  }
}

/**
 * Hash determinístico por célula (0..1) — variação sem Math.random. O
 * `salt` dá sequências independentes para a mesma célula.
 */
export function hash(x: number, y: number, salt = 0): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}

interface EdgeSet {
  tl: number;
  t: number;
  tr: number;
  l: number;
  c: number;
  r: number;
  bl: number;
  b: number;
  br: number;
  inTl: number;
  inTr: number;
  inBl: number;
  inBr: number;
}

const PATH_EDGES: EdgeSet = {
  ...KENNEY.path,
  inTl: KENNEY.pathInner.tl,
  inTr: KENNEY.pathInner.tr,
  inBl: KENNEY.pathInner.bl,
  inBr: KENNEY.pathInner.br,
};

const w = (name: CustomTile) => customTile(name);

/** As peças de um terreno desenhado pelo gerador (ver EDGED em tileset.ts). */
function edgeSet(kind: EdgedTile): EdgeSet {
  const [tl, t, tr, l, c, r, bl, b, br, inTl, inTr, inBl, inBr] = EDGE_PARTS.map((p) => w(`${kind}_${p}`));
  return { tl, t, tr, l, c, r, bl, b, br, inTl, inTr, inBl, inBr };
}

const WATER_EDGES = edgeSet("water");
const SAND_EDGES = edgeSet("sand");
const SEA_EDGES = edgeSet("sea");
const ROCK_EDGES = edgeSet("rock");

/**
 * Pares de tiles que o render troca em loop para animar o mar: cada peça
 * do quadro A com a mesma peça do quadro B.
 */
export const SEA_ANIM: [number, number][] = EDGE_PARTS.map((p) => [w(`sea_${p}`), w(`sea2_${p}`)]);

/** Autotile de 9 partes + cantos internos. Regiões precisam ter ≥ 2 tiles de largura. */
function autotile(same: (dx: number, dy: number) => boolean, e: EdgeSet): number {
  const n = same(0, -1);
  const s = same(0, 1);
  const wst = same(-1, 0);
  const est = same(1, 0);
  if (!n && !wst) return e.tl;
  if (!n && !est) return e.tr;
  if (!s && !wst) return e.bl;
  if (!s && !est) return e.br;
  if (!n) return e.t;
  if (!s) return e.b;
  if (!wst) return e.l;
  if (!est) return e.r;
  if (!same(-1, -1)) return e.inTl;
  if (!same(1, -1)) return e.inTr;
  if (!same(-1, 1)) return e.inBl;
  if (!same(1, 1)) return e.inBr;
  return e.c;
}

function fenceTile(grid: TerrainGrid, x: number, y: number): number {
  const f = (dx: number, dy: number) => grid.fences[y + dy]?.[x + dx] ?? false;
  const left = f(-1, 0);
  const right = f(1, 0);
  if (left || right) {
    if (!left) return KENNEY.fence.left;
    if (!right) return KENNEY.fence.right;
    return KENNEY.fence.mid;
  }
  const up = f(0, -1);
  const down = f(0, 1);
  if (!up && down) return KENNEY.fence.top;
  if (up && !down) return KENNEY.fence.bottom;
  return KENNEY.fence.vmid;
}

function wallTile(grid: TerrainGrid, x: number, y: number, style: WallStyle): number {
  let depth = 0;
  while (grid.get(x, y - depth - 1) === "wall") depth++;
  if (depth === 0) return w("wall_trim");
  return w(depth === 1 ? `wall_${style}_top` : `wall_${style}_bottom`);
}

export interface BakedTerrain {
  ground: number[][];
  overlay: number[][];
  collision: boolean[][];
  tileAnims: [number, number][];
}

export function bake(grid: TerrainGrid, wallStyle: WallStyle = "office"): BakedTerrain {
  const ground: number[][] = [];
  const overlay: number[][] = [];
  const collision: boolean[][] = [];
  let hasSea = false;

  for (let y = 0; y < grid.height; y++) {
    ground.push([]);
    overlay.push([]);
    collision.push([]);
    for (let x = 0; x < grid.width; x++) {
      const t = grid.cells[y][x];
      const group = SAME_AS[t];
      // fora do mapa conta como "igual" para não desenhar margem na borda
      const same = (dx: number, dy: number) => {
        const n = grid.get(x + dx, y + dy) ?? t;
        return group ? group.has(n) : n === t;
      };
      let tile: number;
      switch (t) {
        case "grass": {
          const r = hash(x, y);
          tile = r < 0.06 ? KENNEY.grassFlowers : r < 0.22 ? KENNEY.grassTufts : KENNEY.grass;
          break;
        }
        case "meadow": {
          // campo: a mesma grama, mas bem mais florida
          const r = hash(x, y);
          tile = r < 0.3 ? KENNEY.grassFlowers : r < 0.55 ? KENNEY.grassTufts : KENNEY.grass;
          break;
        }
        case "path":
          tile = autotile(same, PATH_EDGES);
          break;
        case "water":
          tile = autotile(same, WATER_EDGES);
          break;
        case "sand":
          tile = autotile(same, SAND_EDGES);
          break;
        case "sea":
          tile = autotile(same, SEA_EDGES);
          hasSea = true;
          break;
        case "rock":
          tile = autotile(same, ROCK_EDGES);
          break;
        case "pier":
          // ponte de 2 tiles: metade esquerda se o vizinho da direita também é ponte
          tile = w(grid.get(x + 1, y) === "pier" ? "pier_l" : "pier_r");
          break;
        case "plaza":
          tile = KENNEY.plaza;
          break;
        case "soil":
          tile = w("soil");
          break;
        case "floor-wood":
          tile = w(y % 2 === 0 ? "floor_wood_a" : "floor_wood_b");
          break;
        case "floor-clinic":
          tile = w("floor_clinic");
          break;
        case "floor-school":
          tile = w((x + y) % 2 === 0 ? "floor_school_a" : "floor_school_b");
          break;
        case "wall":
          tile = wallTile(grid, x, y, wallStyle);
          break;
        case "exit":
          tile = w("exit_mat");
          break;
        case "void":
          tile = w("void");
          break;
      }
      ground[y].push(tile);
      overlay[y].push(grid.fences[y][x] ? fenceTile(grid, x, y) : -1);
      collision[y].push(SOLID.has(t) || grid.fences[y][x]);
    }
  }
  return { ground, overlay, collision, tileAnims: hasSea ? SEA_ANIM : [] };
}
