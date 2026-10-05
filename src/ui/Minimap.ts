import Phaser from "phaser";
import { COLORS, GAME } from "../config";
import type { Landmark, MapDef, PropDef } from "../types";
import { hash } from "../maps/terrain";
import { Img } from "../shared/img";
import { resizePanel, textStyle, woodPanel } from "./text";

/**
 * Minimapa e mapa grande em pixel art. O mapa é desenhado em tempo de
 * execução com as mesmas primitivas dos sprites (`Img`): o terreno é uma
 * miniatura do chão real reduzida a uma paleta curta, e árvores, montanhas,
 * prédios etc. viram ícones. Os pixels da arte aparecem em 3x (ou 2x no
 * mapa grande em telas menores), como o resto da interface.
 */

/** Mini: 1 pixel de arte por tile, mostrado em 3x (66x52 → 198x156). */
const MINI = { art: 1, scale: 3 };
/** Mapa grande: 4 pixels de arte por tile (66x52 → 264x208). */
const BIG_ART = 4;
/** Margem entre a moldura de madeira e o mini. */
const FRAME = 14;
/** Abaixo disto (coordenadas da UI) o minimapa some. */
const MIN_VIEW = { w: 700, h: 480 };

const INK = "#3f2631";

/** Paleta do terreno: cada pixel do mapa vira a cor mais próxima daqui. */
const TERRAIN = ["#84c669", "#eaa56c", "#f4d58d", "#3d8fd1", "#8e8a9b", "#763b36", "#bd6c4a"].map((css) => ({
  css,
  rgb: [parseInt(css.slice(1, 3), 16), parseInt(css.slice(3, 5), 16), parseInt(css.slice(5, 7), 16)],
}));
const GRASS = TERRAIN[0].css;

const TREE_COLORS: Record<string, string> = {
  "tree-oak": "#3f8f45",
  "tree-oak-autumn": "#e38628",
  "tree-apple": "#3a8a40",
  "tree-orange": "#5fae4f",
  "tree-cherry": "#ec7dab",
  "tree-birch": "#8fce6a",
  "tree-oak-old": "#2f7a43",
  "tree-pine": "#2f7a43",
  "tree-pine-dark": "#1d5536",
  "tree-palm": "#479f4a",
};

const BUILDINGS: Record<string, { wall: string; roof: string; w: number; h: number }> = {
  "building-catsuc": { wall: "#5a74ff", roof: "#c0cbdc", w: 8, h: 4 },
  "building-neurokids": { wall: "#bfead9", roof: "#f28462", w: 7, h: 4 },
  "building-school": { wall: "#fec99c", roof: "#c34b35", w: 8, h: 4.5 },
  "building-wizard": { wall: "#8b9bb4", roof: "#8f5bc9", w: 2.5, h: 4 },
};

const FLOWER_COLORS: Record<string, string> = {
  tulip: "#ff8ac2",
  daisy: "#ffffff",
  lavender: "#c496f0",
  buttercup: "#fdbe53",
  poppy: "#e84537",
};

/** Escurece (−) ou clareia (+) uma cor "#rrggbb". */
function shade(css: string, amount: number): string {
  const v = [1, 3, 5].map((i) => parseInt(css.slice(i, i + 2), 16));
  const f = (c: number) => Math.round(amount > 0 ? c + (255 - c) * amount : c * (1 + amount));
  return "#" + v.map((c) => f(c).toString(16).padStart(2, "0")).join("");
}

function nearest(r: number, g: number, b: number): string {
  let best = TERRAIN[0];
  let bestD = Infinity;
  for (const t of TERRAIN) {
    const d = (t.rgb[0] - r) ** 2 + (t.rgb[1] - g) ** 2 + (t.rgb[2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best.css;
}

/** Lê o tileset uma vez e devolve a cor média de um bloco de um tile. */
function tileSampler(scene: Phaser.Scene) {
  const src = scene.textures.get("world").getSourceImage() as CanvasImageSource & { width: number; height: number };
  const canvas = document.createElement("canvas");
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, src.width, src.height).data;
  const cols = Math.floor(src.width / GAME.tile);
  /** média dos pixels opacos do bloco (bx, by) de lado `size` dentro do tile; null se quase vazio */
  return (index: number, bx: number, by: number, size: number): [number, number, number] | null => {
    const tx = (index % cols) * GAME.tile + bx * size;
    const ty = Math.floor(index / cols) * GAME.tile + by * size;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let y = ty; y < ty + size; y++) {
      for (let x = tx; x < tx + size; x++) {
        const i = (y * src.width + x) * 4;
        if (data[i + 3] < 128) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
    }
    return n * 2 < size * size ? null : [r / n, g / n, b / n];
  };
}

/** Desenha numa imagem temporária, contorna e cola — para ícones com contorno próprio. */
function stamp(img: Img, x: number, y: number, w: number, h: number, draw: (t: Img) => void, outline = INK): void {
  const t = new Img(w + 2, h + 2);
  draw(t);
  t.outline(outline);
  img.blit(t, Math.round(x) - 1, Math.round(y) - 1);
}

/** Pico de montanha em pixels: lado iluminado, lado na sombra e neve. */
function mountain(img: Img, cx: number, base: number, w: number, h: number, snow: boolean): void {
  w = Math.max(3, Math.round(w));
  h = Math.max(2, Math.round(h));
  const peak = Math.round(w * 0.45);
  stamp(img, cx - w / 2, base - h, w, h, (t) => {
    for (let yy = 0; yy < h; yy++) {
      const k = (yy + 1) / h;
      const l = Math.round(peak - peak * k);
      const r = Math.round(peak + (w - 1 - peak) * k);
      const capped = snow && yy < Math.ceil(h * 0.3);
      t.hline(1 + l, 1 + peak, 1 + yy, capped ? "#f2f7ff" : "#a9a4b8");
      if (r > peak) t.hline(2 + peak, 1 + r, 1 + yy, capped ? "#c6d3ea" : "#6a6578");
    }
  });
}

function drawProp(img: Img, scene: Phaser.Scene, p: PropDef, S: number): void {
  const x = p.x * S;
  const y = p.y * S;
  const detail = S >= 4;

  if (p.sprite === "plaza-floor") {
    const cy = (p.y - 5) * S;
    const r = 5 * S;
    img.circle(x, cy, r, "#7d8396").circle(x, cy, r - 1, "#a9afbf");
    if (detail) {
      img.circle(x, cy, r * 0.8, "#c3c7d3").circle(x, cy, r * 0.45, "#e6e8ee");
      img.vline(Math.round(x), Math.round(cy - 6), Math.round(cy + 6), "#8e93a6");
      img.hline(Math.round(x - 6), Math.round(x + 6), Math.round(cy), "#8e93a6");
      img.set(x, cy - 6, "#e84537");
    } else img.set(x, cy, "#e6e8ee");
    return;
  }
  if (p.sprite.startsWith("mountain-")) {
    const f = scene.textures.getFrame(p.sprite);
    mountain(img, x, y, (f.width / GAME.tile) * S * 0.95, (f.height / GAME.tile) * S * 0.75, f.height >= 64);
    return;
  }
  if (p.sprite.startsWith("foothill-") && detail) {
    const f = scene.textures.getFrame(p.sprite);
    const w = Math.round((f.width / GAME.tile) * S * 0.85);
    const h = Math.round((f.height / GAME.tile) * S * 0.45);
    stamp(
      img,
      x - w / 2,
      y - h,
      w,
      h,
      (t) => {
        for (let xx = 0; xx < w; xx++) {
          const u = (xx - (w - 1) / 2) / (w / 2);
          const top = Math.round(h - h * (1 - u * u));
          t.vline(1 + xx, 1 + top, h, xx < w / 2 ? "#8bd17a" : "#7cc46a");
        }
      },
      "#479f4a"
    );
    return;
  }
  if (p.sprite in TREE_COLORS) {
    const color = TREE_COLORS[p.sprite];
    if (!detail) {
      img.set(x, y - 1, shade(color, -0.25));
      return;
    }
    const big = p.sprite === "tree-oak-old";
    const r = big ? 3 : 2;
    const cx = Math.round(x);
    const cy = Math.round(y - (big ? 7 : 5));
    img.set(cx, cy + r + 1, "#763b36");
    img.circle(cx, cy, r + 1, shade(color, -0.45)).circle(cx, cy, r, color);
    img.set(cx - 1, cy - 1, shade(color, 0.35));
    return;
  }
  if (p.sprite in BUILDINGS) {
    const b = BUILDINGS[p.sprite];
    const w = Math.max(2, Math.round(b.w * S));
    const h = Math.max(2, Math.round(b.h * S));
    stamp(img, x - w / 2, y - h - (detail ? 1 : 0), w, h, (t) => {
      t.rect(1, 1, w, h, b.wall);
      t.rect(1, 1, w, Math.ceil(h * 0.45), b.roof);
      if (detail) {
        t.hline(1, w, 1, shade(b.roof, 0.35));
        t.rect(1 + Math.floor(w / 2) - 1, h - 1, 2, 2, INK);
      }
    });
    return;
  }
  if (p.sprite === "lighthouse") {
    const w = detail ? 3 : 1;
    const h = detail ? 9 : 2;
    stamp(img, x - w / 2, y - h, w, h, (t) => {
      for (let i = 0; i < h; i++) t.hline(1, w, 1 + i, i === 0 ? "#fdbe53" : Math.floor((i - 1) / 2) % 2 ? "#ffffff" : "#e84537");
    });
    return;
  }
  if (p.sprite === "waterfall" && detail) {
    img.rect(Math.round(x) - 1, Math.round(y - 4.8 * S), 2, Math.round(3 * S), "#76c8f0");
    img.hline(Math.round(x) - 2, Math.round(x) + 1, Math.round(y - 1.8 * S), "#ffffff");
    return;
  }
  if (p.sprite.startsWith("flower-") && detail) {
    const kind = p.sprite.replace("flower-", "").replace("-b", "");
    img.set(x, y - 1, FLOWER_COLORS[kind] ?? "#ffffff");
  }
}

/** Alfinete em gota com a ponta no ponto exato do lugar. */
function pin(img: Img, lm: Landmark, S: number): void {
  const x = Math.round(lm.x * S);
  const y = Math.round(lm.y * S);
  if (S < 4) {
    img.rect(x - 1, y - 1, 3, 3, INK).set(x, y, lm.color);
    return;
  }
  img.ascii(x - 2, y - 6, [".ooo.", "occco", "ocwco", "occco", ".oco.", "..o.."], {
    o: INK,
    c: lm.color,
    w: "#ffffff",
  });
}

/** Rosa-dos-ventos no canto do mapa grande. */
function compass(img: Img, x: number, y: number): void {
  img.circle(x, y, 7, INK).circle(x, y, 6, "#ffe7c2");
  img.ascii(x - 4, y - 4, ["....r....", "...rrr...", "....r....", ".g..o..g.", "gggo.oggg", ".g..o..g.", "....k....", "...kkk...", "....k...."], {
    r: "#e84537",
    g: "#8e93a6",
    k: INK,
    o: "#c0cbdc",
  });
  img.text(x - 1, y - 14, "N", INK);
}

/** O mapa inteiro em pixel art, `S` pixels de arte por tile. */
function drawMap(scene: Phaser.Scene, def: MapDef, S: number): Img {
  const W = def.width * S;
  const H = def.height * S;
  const img = new Img(W, H);
  const sample = tileSampler(scene);
  const block = GAME.tile / S;
  // terreno: cada pixel da arte é a média de um bloco do tile, na cor da paleta mais próxima
  for (let ty = 0; ty < def.height; ty++) {
    for (let tx = 0; tx < def.width; tx++) {
      for (let by = 0; by < S; by++) {
        for (let bx = 0; bx < S; bx++) {
          const px = tx * S + bx;
          const py = ty * S + by;
          const g = sample(def.ground[ty][tx], bx, by, block);
          let c = g ? nearest(...g) : GRASS;
          if (c === GRASS && hash(px, py, 3) < 0.07) c = "#77b85e";
          img.set(px, py, c);
          const o = def.overlay[ty][tx];
          if (o >= 0 && sample(o, bx, by, block)) img.set(px, py, "#9a5a3c");
        }
      }
    }
  }
  // espuma na beira da água e ondinhas (água = "#3d8fd1" da paleta)
  const isWater = (px: number, py: number) => {
    const i = (py * W + px) * 4;
    return img.inside(px, py) && img.data[i] === 0x3d && img.data[i + 1] === 0x8f && img.data[i + 2] === 0xd1;
  };
  const coast: [number, number][] = [];
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++) {
      if (!isWater(px, py)) continue;
      const land = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => img.inside(px + dx, py + dy) && !isWater(px + dx, py + dy));
      if (land) coast.push([px, py]);
      else if (S >= 4 && hash(px, py, 9) < 0.025) img.hline(px, px + 1, py, "#76c8f0");
    }
  for (const [px, py] of coast) img.set(px, py, "#76c8f0");

  for (const p of [...def.props].sort((a, b) => a.y - b.y)) drawProp(img, scene, p, S);
  for (const lm of def.landmarks ?? []) pin(img, lm, S);
  if (S >= 4) {
    compass(img, W - 11, H - 10);
    img.frame(0, 0, W, H, INK);
  }
  return img;
}

/** Converte uma `Img` em textura do Phaser (uma vez por chave). */
function toTexture(scene: Phaser.Scene, key: string, make: () => Img): string {
  if (scene.textures.exists(key)) return key;
  const img = make();
  const tex = scene.textures.createCanvas(key, img.w, img.h)!;
  tex.getContext().putImageData(new ImageData(new Uint8ClampedArray(img.data), img.w, img.h), 0, 0);
  tex.refresh();
  return key;
}

/** Marcador "você está aqui": bolinha vermelha com contorno branco. */
function youMarker(big: boolean): Img {
  const img = new Img(big ? 7 : 5, big ? 7 : 5);
  if (big) img.circle(3, 3, 2, "#e84537").set(2, 2, "#ff9a8a");
  else img.ascii(1, 1, [".r.", "rrr", ".r."], { r: "#e84537" });
  return img.outline("#ffffff");
}

/**
 * Minimapa no canto superior direito e mapa grande (tecla M ou clique no
 * mini), com os lugares do `MapDef.landmarks`. Só aparece em mapas que
 * têm landmarks (a vila); nos interiores some.
 */
export class Minimap {
  private def: MapDef | null = null;
  private visible = true;
  private open = false;
  private player = { x: 0, y: 0 };
  private viewW = 0;
  private viewH = 0;
  private top = 0;
  private bigScale = 2;

  private readonly mini: Phaser.GameObjects.Container;
  private readonly miniPanel: Phaser.GameObjects.NineSlice;
  private readonly miniImage: Phaser.GameObjects.Image;
  private readonly miniMarker: Phaser.GameObjects.Image;

  private readonly big: Phaser.GameObjects.Container;
  private readonly shade: Phaser.GameObjects.Rectangle;
  private readonly bigPanel: Phaser.GameObjects.NineSlice;
  private readonly bigImage: Phaser.GameObjects.Image;
  private readonly bigMarker: Phaser.GameObjects.Image;
  private readonly title: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    toTexture(scene, "map-you", () => youMarker(false));
    toTexture(scene, "map-you-big", () => youMarker(true));

    this.miniPanel = woodPanel(scene, "ui-tag", 0, 0, 120, 120);
    this.miniImage = scene.add.image(FRAME, FRAME, "__DEFAULT").setOrigin(0).setScale(MINI.scale);
    this.miniMarker = scene.add.image(0, 0, "map-you").setScale(MINI.scale);
    this.miniImage.setInteractive({ useHandCursor: true }).on(
      "pointerdown",
      (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        this.toggle();
      }
    );
    this.mini = scene.add
      .container(0, 0, [this.miniPanel, this.miniImage, this.miniMarker])
      .setDepth(85)
      .setVisible(false);

    this.shade = scene.add.rectangle(0, 0, 1, 1, 0x1a1c2c, 0.55).setOrigin(0);
    this.bigPanel = woodPanel(scene, "ui-dialog", 0, 0, 200, 200);
    this.bigImage = scene.add.image(0, 0, "__DEFAULT").setOrigin(0);
    this.bigMarker = scene.add.image(0, 0, "map-you-big");
    this.title = scene.add.text(0, 0, "Mapa da vila", textStyle(28)).setOrigin(0.5, 0);
    this.hint = scene.add
      .text(0, 0, "M ou Esc para fechar", textStyle(18, { color: COLORS.inkSoft }))
      .setOrigin(0.5, 1);
    this.big = scene.add
      .container(0, 0, [this.shade, this.bigPanel, this.bigImage, this.title, this.hint, this.bigMarker])
      .setDepth(150)
      .setVisible(false);
    // o "você está aqui" pisca
    scene.tweens.add({ targets: [this.miniMarker, this.bigMarker], alpha: 0.25, duration: 450, yoyo: true, repeat: -1 });
  }

  /** Mapa atual (o minimapa só existe em mapas com landmarks). */
  setMap(def: MapDef | null): void {
    this.def = def?.landmarks ? def : null;
    if (!this.def) {
      this.close();
      this.refresh();
      return;
    }
    const d = this.def;
    this.miniImage.setTexture(toTexture(this.scene, `map-${d.key}-mini`, () => drawMap(this.scene, d, MINI.art)));
    this.bigImage.setTexture(toTexture(this.scene, `map-${d.key}-big`, () => drawMap(this.scene, d, BIG_ART)));
    this.layout(this.viewW, this.viewH, this.top);
  }

  /** Posição do jogador em px do mundo. */
  track(x: number, y: number): void {
    this.player = { x: x / GAME.tile, y: y / GAME.tile };
    this.placeMarkers();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) this.close();
    this.refresh();
  }

  isOpen(): boolean {
    return this.open;
  }

  toggle(): void {
    if (this.open) this.close();
    else if (this.def && this.visible) {
      this.open = true;
      this.refresh();
    }
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.refresh();
  }

  /** Reposiciona mini e mapa grande; `top` = y livre abaixo da linha de ajuda. */
  layout(viewW: number, viewH: number, top: number): void {
    this.viewW = viewW;
    this.viewH = viewH;
    this.top = top;
    if (!this.def) return;

    // mini: canto superior direito
    const mw = this.def.width * MINI.art * MINI.scale;
    const mh = this.def.height * MINI.art * MINI.scale;
    resizePanel(this.miniPanel, mw + FRAME * 2, mh + FRAME * 2);
    this.mini.setPosition(viewW - mw - FRAME * 2 - 16, top);

    // grande: maior escala inteira que couber (3x quando dá, como a interface)
    const aw = this.def.width * BIG_ART;
    const ah = this.def.height * BIG_ART;
    this.bigScale = Phaser.Math.Clamp(Math.floor(Math.min((viewW - 120) / aw, (viewH - 170) / ah)), 1, 3);
    const bw = aw * this.bigScale;
    const bh = ah * this.bigScale;
    const pw = bw + 64;
    const ph = bh + 110;
    const px = Math.round((viewW - pw) / 2);
    const py = Math.round((viewH - ph) / 2);
    this.shade.setSize(viewW, viewH);
    this.bigPanel.setPosition(px, py);
    resizePanel(this.bigPanel, pw, ph);
    this.bigImage.setPosition(px + 32, py + 64).setScale(this.bigScale);
    this.bigMarker.setScale(this.bigScale);
    this.title.setPosition(viewW / 2, py + 22);
    this.hint.setPosition(viewW / 2, py + ph - 14);
    this.placeLabels();
    this.placeMarkers();
    this.refresh();
  }

  private refresh(): void {
    const fits = this.viewW >= MIN_VIEW.w && this.viewH >= MIN_VIEW.h;
    this.mini.setVisible(Boolean(this.def) && this.visible && !this.open && fits);
    this.big.setVisible(Boolean(this.def) && this.visible && this.open);
  }

  /** Nome de cada lugar numa etiqueta de papel ao lado do alfinete (virada para dentro perto da borda). */
  private placeLabels(): void {
    this.labels.forEach((l) => l.destroy());
    this.labels = [];
    const k = this.bigScale;
    const ox = this.bigImage.x;
    const oy = this.bigImage.y;
    const right = ox + (this.def?.width ?? 0) * BIG_ART * k;
    for (const lm of this.def?.landmarks ?? []) {
      const x = ox + lm.x * BIG_ART * k;
      const y = oy + (lm.y * BIG_ART - 4) * k;
      const label = this.scene.add.text(0, Math.round(y), lm.name, {
        ...textStyle(15, { color: COLORS.ink, backgroundColor: COLORS.paper }),
        padding: { x: 4, y: 1 },
      });
      const flip = x + 4 * k + label.width > right;
      label.setOrigin(flip ? 1 : 0, 0.5).setX(Math.round(flip ? x - 4 * k : x + 4 * k));
      this.big.addAt(label, this.big.list.length - 1);
      this.labels.push(label);
    }
  }

  private placeMarkers(): void {
    const ms = MINI.art * MINI.scale;
    this.miniMarker.setPosition(Math.round(FRAME + this.player.x * ms), Math.round(FRAME + this.player.y * ms));
    const bs = BIG_ART * this.bigScale;
    this.bigMarker.setPosition(Math.round(this.bigImage.x + this.player.x * bs), Math.round(this.bigImage.y + this.player.y * bs));
  }
}
