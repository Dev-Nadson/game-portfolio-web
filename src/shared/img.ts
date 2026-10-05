/**
 * Imagem RGBA em memória com primitivas de pixel art, sem dependências do
 * Node: usada pelo gerador de sprites (scripts/) e pelo jogo, que desenha o
 * minimapa em tempo de execução com as mesmas ferramentas.
 */
type RGBA = [number, number, number, number];

function parse(color: string): RGBA {
  const hex = color.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
    hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255,
  ];
}

/**
 * Imagem RGBA em memória com primitivas de pixel art.
 * Coordenadas fora da imagem são ignoradas em silêncio, o que deixa
 * os desenhos procedurais mais simples (sem clamps espalhados).
 */
export class Img {
  readonly data: Uint8Array;

  constructor(
    readonly w: number,
    readonly h: number
  ) {
    this.data = new Uint8Array(w * h * 4);
  }

  private idx(x: number, y: number): number {
    return (y * this.w + x) * 4;
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  set(x: number, y: number, color: string): this {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return this;
    const [r, g, b, a] = parse(color);
    const i = this.idx(x, y);
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
    return this;
  }

  clear(x: number, y: number): this {
    if (!this.inside(x, y)) return this;
    this.data[this.idx(x, y) + 3] = 0;
    return this;
  }

  alpha(x: number, y: number): number {
    return this.inside(x, y) ? this.data[this.idx(x, y) + 3] : 0;
  }

  rect(x: number, y: number, w: number, h: number, color: string): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, color);
    return this;
  }

  /** Borda de 1px dentro do retângulo. */
  frame(x: number, y: number, w: number, h: number, color: string): this {
    this.hline(x, x + w - 1, y, color);
    this.hline(x, x + w - 1, y + h - 1, color);
    this.vline(x, y, y + h - 1, color);
    this.vline(x + w - 1, y, y + h - 1, color);
    return this;
  }

  hline(x1: number, x2: number, y: number, color: string): this {
    for (let x = x1; x <= x2; x++) this.set(x, y, color);
    return this;
  }

  vline(x: number, y1: number, y2: number, color: string): this {
    for (let y = y1; y <= y2; y++) this.set(x, y, color);
    return this;
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string): this {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, color: string): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1) this.set(x, y, color);
      }
    }
    return this;
  }

  /** Elipse só nos pixels transparentes — sombras no chão, depois do contorno. */
  shadow(cx: number, cy: number, rx: number, ry: number, color = "#00000038"): this {
    const behind = new Img(this.w, this.h).ellipse(cx, cy, rx, ry, color);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++)
        if (this.alpha(x, y) === 0 && behind.alpha(x, y) > 0) this.set(x, y, color);
    return this;
  }

  circle(cx: number, cy: number, r: number, color: string): this {
    return this.ellipse(cx, cy, r, r, color);
  }

  /** Xadrez de 2 cores, usado como "dither" para sombras e texturas. */
  checker(x: number, y: number, w: number, h: number, a: string, b: string): this {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) this.set(i, j, (i + j) % 2 === 0 ? a : b);
    return this;
  }

  /**
   * Desenha uma matriz de caracteres. Cada caractere é procurado em
   * `palette`; "." e espaço são transparentes. Espaços entre grupos
   * são ignorados, então dá para escrever "...h hHHh hhhh h..." e
   * conferir a largura de olho.
   */
  ascii(x: number, y: number, rows: string[], palette: Record<string, string>): this {
    rows.forEach((raw, j) => {
      const row = raw.replace(/ /g, "");
      [...row].forEach((ch, i) => {
        if (ch === ".") return;
        const color = palette[ch];
        if (!color) throw new Error(`Caractere sem cor na paleta: "${ch}"`);
        this.set(x + i, y + j, color);
      });
    });
    return this;
  }

  /** Escreve texto com a fonte 3x5 embutida. Retorna a largura usada. */
  text(x: number, y: number, str: string, color: string, scale = 1): number {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const glyph = FONT_3X5[ch];
      if (!glyph) {
        cx += 2 * scale;
        continue;
      }
      glyph.forEach((row, j) =>
        [...row].forEach((c, i) => {
          if (c === "#") this.rect(cx + i * scale, y + j * scale, scale, scale, color);
        })
      );
      cx += (glyph[0].length + 1) * scale;
    }
    return cx - x - scale;
  }

  /** Texto centralizado horizontalmente em `cx`. */
  textCenter(cx: number, y: number, str: string, color: string, scale = 1): this {
    this.text(cx - Math.floor(textWidth(str, scale) / 2), y, str, color, scale);
    return this;
  }

  /**
   * Contorno automático: pinta de `color` todo pixel transparente que
   * encosta (4 vizinhos) num pixel opaco. É o que dá o traço escuro
   * característico do estilo Kenney/Stardew sem desenhar à mão.
   */
  outline(color: string): this {
    const marks: [number, number][] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y) > 0) continue;
        if (
          this.alpha(x - 1, y) > 0 ||
          this.alpha(x + 1, y) > 0 ||
          this.alpha(x, y - 1) > 0 ||
          this.alpha(x, y + 1) > 0
        ) {
          marks.push([x, y]);
        }
      }
    }
    for (const [x, y] of marks) this.set(x, y, color);
    return this;
  }

  blit(src: Img, dx: number, dy: number): this {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const si = (y * src.w + x) * 4;
        if (src.data[si + 3] === 0 || !this.inside(dx + x, dy + y)) continue;
        const di = this.idx(dx + x, dy + y);
        this.data.set(src.data.subarray(si, si + 4), di);
      }
    }
    return this;
  }

  flipX(): Img {
    const out = new Img(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const si = this.idx(x, y);
        out.data.set(this.data.subarray(si, si + 4), out.idx(this.w - 1 - x, y));
      }
    }
    return out;
  }

  clone(): Img {
    const out = new Img(this.w, this.h);
    out.data.set(this.data);
    return out;
  }
}

/** Aleatório determinístico: o mesmo seed sempre gera o mesmo sprite. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** Junta frames de mesmo tamanho numa spritesheet em grade. */
export function sheet(frames: Img[], cols: number): Img {
  const fw = frames[0].w;
  const fh = frames[0].h;
  const rows = Math.ceil(frames.length / cols);
  const out = new Img(fw * cols, fh * rows);
  frames.forEach((f, i) => out.blit(f, (i % cols) * fw, Math.floor(i / cols) * fh));
  return out;
}

export function textWidth(str: string, scale = 1): number {
  let w = 0;
  for (const ch of str.toUpperCase()) w += ((FONT_3X5[ch]?.[0].length ?? 1) + 1) * scale;
  return w - scale;
}

/** Fonte bitmap 3x5 para placas e letreiros desenhados no próprio sprite. */
const FONT_3X5: Record<string, string[]> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  Q: [".#.", "#.#", "#.#", "##.", ".##"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  W: ["#.#", "#.#", "###", "###", "#.#"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["##.", "..#", ".#.", "#..", "###"],
  "3": ["##.", "..#", ".#.", "..#", "##."],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "##.", "..#", "##."],
  "6": [".##", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "##."],
  "%": ["#.#", "..#", ".#.", "#..", "#.#"],
  ">": ["#..", ".#.", "..#", ".#.", "#.."],
  "_": ["...", "...", "...", "...", "###"],
  "-": ["...", "...", "###", "...", "..."],
  "+": ["...", ".#.", "###", ".#.", "..."],
  ".": [".", ".", ".", ".", "#"],
  ":": [".", "#", ".", "#", "."],
  "/": ["..#", "..#", ".#.", "#..", "#.."],
};

/** Um sprite solto ou uma spritesheet com tamanho de frame. */
export type SpriteOut = Img | { img: Img; frame: { w: number; h: number } };
