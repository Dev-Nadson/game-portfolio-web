import Phaser from "phaser";
import { COLORS, GAME } from "../config";
import type { MapDef, PropDef } from "../types";
import { hash } from "../maps/terrain";
import { resizePanel, textStyle, woodPanel } from "./text";

/** Pixels por tile no minimapa (66x52 tiles → 198x156). */
const MINI_PX = 3;
/** Margem entre a moldura de madeira e o mapa. */
const FRAME = 14;
/** Abaixo disto (coordenadas da UI) o minimapa some. */
const MIN_VIEW = { w: 700, h: 480 };

/** Cor da copa de cada árvore no mapa. */
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

/** Prédios como ícones: parede, telhado e tamanho da base (tiles). */
const BUILDINGS: Record<string, { wall: string; roof: string; w: number; h: number }> = {
  "building-catsuc": { wall: "#5a74ff", roof: "#c0cbdc", w: 8, h: 4 },
  "building-neurokids": { wall: "#bfead9", roof: "#f28462", w: 7, h: 4 },
  "building-school": { wall: "#fec99c", roof: "#c34b35", w: 8, h: 4.5 },
  "building-wizard": { wall: "#8b9bb4", roof: "#8f5bc9", w: 2.6, h: 4 },
};

/** Pontinhos de cor das flores do campo (só no mapa grande). */
const FLOWER_COLORS: Record<string, string> = {
  tulip: "#ff8ac2",
  daisy: "#ffffff",
  lavender: "#c496f0",
  buttercup: "#fdbe53",
  poppy: "#e84537",
};

const hex = (c: string) => Phaser.Display.Color.HexStringToColor(c).color;

/** Clareia (+) ou escurece (−) uma cor CSS "#rrggbb" ou "rgb(...)". */
function tint(color: string, amount: number): string {
  const c = Phaser.Display.Color.ValueToColor(color);
  const f = (v: number) => Math.round(Phaser.Math.Clamp(amount > 0 ? v + (255 - v) * amount : v * (1 + amount), 0, 255));
  return `rgb(${f(c.red)},${f(c.green)},${f(c.blue)})`;
}

/**
 * Cor média de cada tile do tileset, lida uma vez de um canvas. Tiles de
 * borda (água com margem de grama etc.) viram a mistura das duas cores, o
 * que deixa as bordas do mapa naturalmente suaves.
 */
function tilePalette(scene: Phaser.Scene): (index: number) => { css: string; water: boolean } | null {
  const src = scene.textures.get("world").getSourceImage() as CanvasImageSource & { width: number; height: number };
  const canvas = document.createElement("canvas");
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, src.width, src.height).data;
  const cols = Math.floor(src.width / GAME.tile);
  const cache = new Map<number, { css: string; water: boolean } | null>();
  return (index) => {
    if (cache.has(index)) return cache.get(index)!;
    const tx = (index % cols) * GAME.tile;
    const ty = Math.floor(index / cols) * GAME.tile;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let y = ty; y < ty + GAME.tile; y++) {
      for (let x = tx; x < tx + GAME.tile; x++) {
        const i = (y * src.width + x) * 4;
        if (data[i + 3] < 128) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
    }
    const out = n === 0 ? null : { css: `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`, water: b / n > r / n + 40 && b / n > g / n };
    cache.set(index, out);
    return out;
  };
}

/** Desenha um prop do mapa como ícone, na escala `px` (pixels por tile). */
function drawProp(ctx: CanvasRenderingContext2D, scene: Phaser.Scene, p: PropDef, px: number, detail: boolean): void {
  const cx = p.x * px;
  const base = p.y * px;
  const outline = COLORS.ink;
  ctx.lineWidth = 1;

  if (p.sprite === "plaza-floor") {
    // praça redonda com o anel de pedra e a rosa-dos-ventos
    const cy = (p.y - 5) * px;
    ctx.fillStyle = "#a9afbf";
    ctx.beginPath();
    ctx.arc(cx, cy, 5 * px, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c3c7d3";
    ctx.beginPath();
    ctx.arc(cx, cy, 4.3 * px, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e6e8ee";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.2 * px, 0, Math.PI * 2);
    ctx.fill();
    if (detail) {
      ctx.fillStyle = "#8e93a6";
      const r = 1.9 * px;
      const k = 0.35 * px;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + k, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - k, cy);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx, cy - k);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + k);
      ctx.fill();
    }
    return;
  }

  if (p.sprite.startsWith("mountain-")) {
    // pico estilizado: lado iluminado, lado na sombra e neve no topo
    const f = scene.textures.getFrame(p.sprite);
    const w = (f.width / GAME.tile) * px * 0.95;
    const h = (f.height / GAME.tile) * px * 0.78;
    const peak = cx - w * 0.06;
    const top = base - h;
    const left = cx - w / 2;
    const right = cx + w / 2;
    ctx.fillStyle = "#a9a4b8";
    ctx.beginPath();
    ctx.moveTo(left, base);
    ctx.lineTo(peak, top);
    ctx.lineTo(peak, base);
    ctx.fill();
    ctx.fillStyle = "#6a6578";
    ctx.beginPath();
    ctx.moveTo(peak, top);
    ctx.lineTo(right, base);
    ctx.lineTo(peak, base);
    ctx.fill();
    if (f.height >= 64) {
      const sh = h * 0.3;
      const sw = (sh / h) * (peak - left);
      const se = (sh / h) * (right - peak);
      ctx.fillStyle = "#f2f7ff";
      ctx.beginPath();
      ctx.moveTo(peak, top);
      ctx.lineTo(peak - sw, top + sh);
      ctx.lineTo(peak, top + sh * 0.8);
      ctx.fill();
      ctx.fillStyle = "#c6d3ea";
      ctx.beginPath();
      ctx.moveTo(peak, top);
      ctx.lineTo(peak + se, top + sh);
      ctx.lineTo(peak, top + sh * 0.8);
      ctx.fill();
    }
    ctx.strokeStyle = outline;
    ctx.beginPath();
    ctx.moveTo(left, base);
    ctx.lineTo(peak, top);
    ctx.lineTo(right, base);
    ctx.stroke();
    return;
  }

  if (p.sprite.startsWith("foothill-")) {
    const f = scene.textures.getFrame(p.sprite);
    const rx = (f.width / GAME.tile) * px * 0.45;
    const ry = (f.height / GAME.tile) * px * 0.5;
    ctx.fillStyle = "#8bd17a";
    ctx.strokeStyle = "#479f4a";
    ctx.beginPath();
    ctx.ellipse(cx, base, rx, ry, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (p.sprite in TREE_COLORS) {
    const color = TREE_COLORS[p.sprite];
    const big = p.sprite === "tree-oak-old" ? 1.5 : 1;
    const r = Math.max(1.6, px * 0.6 * big);
    const cy = base - px * 1.2 * big;
    if (detail) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.2, base - px * 0.2, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#763b36";
      ctx.fillRect(Math.round(cx - px * 0.1), Math.round(cy), Math.max(1, Math.round(px * 0.2)), Math.round(px * 0.9 * big));
    }
    ctx.fillStyle = tint(color, -0.35);
    ctx.beginPath();
    ctx.arc(cx, cy, r + (detail ? 1 : 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    if (detail) {
      ctx.fillStyle = tint(color, 0.3);
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (p.sprite in BUILDINGS) {
    // ícone de prédio: parede, telhado, porta e contorno
    const b = BUILDINGS[p.sprite];
    const w = Math.round(b.w * px);
    const h = Math.round(b.h * px);
    const x = Math.round(cx - w / 2);
    const y = Math.round(base - h);
    ctx.fillStyle = outline;
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = b.wall;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = b.roof;
    ctx.fillRect(x, y, w, Math.round(h * 0.45));
    ctx.fillStyle = tint(b.roof, 0.35);
    ctx.fillRect(x, y, w, Math.max(1, Math.round(px * 0.25)));
    ctx.fillStyle = outline;
    const dw = Math.max(1, Math.round(px * 0.6));
    ctx.fillRect(Math.round(cx - dw / 2), base - Math.round(h * 0.3), dw, Math.round(h * 0.3));
    return;
  }

  if (p.sprite === "lighthouse") {
    // torre listrada com a luz no topo
    const w = Math.max(3, Math.round(px * 1.2));
    const h = Math.round(px * 4.5);
    const x = Math.round(cx - w / 2);
    const y = Math.round(base - h);
    ctx.fillStyle = outline;
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    for (let i = 0; i < h; i++) {
      ctx.fillStyle = Math.floor(i / Math.max(2, px * 0.8)) % 2 ? "#ffffff" : "#e84537";
      ctx.fillRect(x, y + i, w, 1);
    }
    ctx.fillStyle = "#fdbe53";
    ctx.fillRect(x, y, w, Math.max(1, Math.round(px * 0.6)));
    return;
  }

  if (detail && p.sprite.startsWith("flower-")) {
    const kind = p.sprite.replace("flower-", "").replace("-b", "");
    ctx.fillStyle = FLOWER_COLORS[kind] ?? "#ffffff";
    const s = Math.max(1, Math.round(px / 6));
    ctx.fillRect(Math.round(cx), Math.round(base - px * 0.4), s, s);
  }
}

/**
 * Desenha (uma vez por mapa e escala) a textura do mapa: terreno com a cor
 * média de cada tile, ondinhas na água e os props como ícones.
 */
function buildTexture(scene: Phaser.Scene, def: MapDef, px: number): string {
  const key = `minimap-${def.key}-${px}`;
  if (scene.textures.exists(key)) return key;
  const color = tilePalette(scene);
  const tex = scene.textures.createCanvas(key, def.width * px, def.height * px)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const detail = px >= 6;
  for (const layer of [def.ground, def.overlay]) {
    layer.forEach((row, y) =>
      row.forEach((index, x) => {
        const c = index >= 0 ? color(index) : null;
        if (!c) return;
        ctx.fillStyle = c.css;
        ctx.fillRect(x * px, y * px, px, px);
        if (detail && c.water && hash(x, y, 5) < 0.14) {
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(x * px + Math.round(px * 0.2), y * px + Math.round(px * 0.5), Math.round(px * 0.5), Math.max(1, Math.round(px / 8)));
        }
      })
    );
  }
  const props = [...def.props].sort((a, b) => a.y - b.y);
  for (const p of props) drawProp(ctx, scene, p, px, detail);
  tex.refresh();
  return key;
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
  private bigPx = MINI_PX * 2;

  private readonly mini: Phaser.GameObjects.Container;
  private readonly miniPanel: Phaser.GameObjects.NineSlice;
  private readonly miniImage: Phaser.GameObjects.Image;
  private readonly miniPins: Phaser.GameObjects.Graphics;
  private readonly miniMarker: Phaser.GameObjects.Container;

  private readonly big: Phaser.GameObjects.Container;
  private readonly shade: Phaser.GameObjects.Rectangle;
  private readonly bigPanel: Phaser.GameObjects.NineSlice;
  private readonly bigImage: Phaser.GameObjects.Image;
  private readonly bigPins: Phaser.GameObjects.Graphics;
  private readonly bigMarker: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.miniPanel = woodPanel(scene, "ui-tag", 0, 0, 120, 120);
    this.miniImage = scene.add.image(FRAME, FRAME, "__DEFAULT").setOrigin(0);
    this.miniPins = scene.add.graphics();
    this.miniMarker = this.marker(scene, 3);
    this.miniImage.setInteractive({ useHandCursor: true }).on(
      "pointerdown",
      (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        this.toggle();
      }
    );
    this.mini = scene.add
      .container(0, 0, [this.miniPanel, this.miniImage, this.miniPins, this.miniMarker])
      .setDepth(85)
      .setVisible(false);

    this.shade = scene.add.rectangle(0, 0, 1, 1, 0x1a1c2c, 0.55).setOrigin(0);
    this.bigPanel = woodPanel(scene, "ui-dialog", 0, 0, 200, 200);
    this.bigImage = scene.add.image(0, 0, "__DEFAULT").setOrigin(0);
    this.bigPins = scene.add.graphics();
    this.bigMarker = this.marker(scene, 5);
    this.title = scene.add.text(0, 0, "Mapa da vila", textStyle(28)).setOrigin(0.5, 0);
    this.hint = scene.add
      .text(0, 0, "M ou Esc para fechar", textStyle(18, { color: COLORS.inkSoft }))
      .setOrigin(0.5, 1);
    this.big = scene.add
      .container(0, 0, [this.shade, this.bigPanel, this.bigImage, this.bigPins, this.title, this.hint, this.bigMarker])
      .setDepth(150)
      .setVisible(false);
  }

  /** Marcador "você está aqui": bolinha vermelha com borda branca e um anel pulsando. */
  private marker(scene: Phaser.Scene, r: number): Phaser.GameObjects.Container {
    const ring = scene.add.circle(0, 0, r + 1).setStrokeStyle(2, 0xffffff);
    const dot = scene.add.circle(0, 0, r, hex("#e84537")).setStrokeStyle(2, 0xffffff);
    scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 1100, repeat: -1 });
    return scene.add.container(0, 0, [ring, dot]);
  }

  /** Mapa atual (o minimapa só existe em mapas com landmarks). */
  setMap(def: MapDef | null): void {
    this.def = def?.landmarks ? def : null;
    if (!this.def) {
      this.close();
      this.refresh();
      return;
    }
    this.miniImage.setTexture(buildTexture(this.scene, this.def, MINI_PX));
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
    const w = this.def.width * MINI_PX;
    const h = this.def.height * MINI_PX;

    // mini: canto superior direito
    resizePanel(this.miniPanel, w + FRAME * 2, h + FRAME * 2);
    this.mini.setPosition(viewW - w - FRAME * 2 - 16, top);
    this.drawPins(this.miniPins, FRAME, FRAME, MINI_PX, false);

    // grande: desenhado na escala em que aparece (sem ampliar pixels)
    const scale = Phaser.Math.Clamp(Math.floor(Math.min((viewW - 120) / w, (viewH - 170) / h)), 1, 4);
    this.bigPx = MINI_PX * scale;
    this.bigImage.setTexture(buildTexture(this.scene, this.def, this.bigPx));
    const bw = this.def.width * this.bigPx;
    const bh = this.def.height * this.bigPx;
    const pw = bw + 64;
    const ph = bh + 110;
    const px = Math.round((viewW - pw) / 2);
    const py = Math.round((viewH - ph) / 2);
    this.shade.setSize(viewW, viewH);
    this.bigPanel.setPosition(px, py);
    resizePanel(this.bigPanel, pw, ph);
    this.bigImage.setPosition(px + 32, py + 64);
    this.title.setPosition(viewW / 2, py + 22);
    this.hint.setPosition(viewW / 2, py + ph - 14);
    this.drawPins(this.bigPins, px + 32, py + 64, this.bigPx, true);
    this.placeMarkers();
    this.refresh();
  }

  private refresh(): void {
    const fits = this.viewW >= MIN_VIEW.w && this.viewH >= MIN_VIEW.h;
    this.mini.setVisible(Boolean(this.def) && this.visible && !this.open && fits);
    this.big.setVisible(Boolean(this.def) && this.visible && this.open);
  }

  /**
   * Alfinetes em gota na cor de cada lugar. No mapa grande, o nome vai numa
   * etiqueta de papel ao lado — virada para dentro perto da borda direita —,
   * mais a moldura do mapa e uma rosa-dos-ventos.
   */
  private drawPins(g: Phaser.GameObjects.Graphics, ox: number, oy: number, px: number, named: boolean): void {
    g.clear();
    if (!this.def) return;
    const mapW = this.def.width * px;
    const mapH = this.def.height * px;
    if (named) {
      this.labels.forEach((l) => l.destroy());
      this.labels = [];
      g.lineStyle(2, hex(COLORS.inkSoft)).strokeRect(ox - 1, oy - 1, mapW + 2, mapH + 2);
      this.compass(g, ox + mapW - 26, oy + mapH - 30);
    } else {
      g.lineStyle(1, hex(COLORS.ink)).strokeRect(ox - 0.5, oy - 0.5, mapW + 1, mapH + 1);
    }
    const r = named ? 5 : 2;
    for (const lm of this.def.landmarks ?? []) {
      const x = Math.round(ox + lm.x * px);
      const y = Math.round(oy + lm.y * px);
      // gota: cabeça redonda e ponta embaixo, no ponto exato do lugar
      g.fillStyle(hex(COLORS.ink));
      g.fillCircle(x, y - r * 2, r + 1.5);
      g.fillTriangle(x - r, y - r * 1.6, x + r, y - r * 1.6, x, y + 1);
      g.fillStyle(hex(lm.color));
      g.fillCircle(x, y - r * 2, r);
      g.fillTriangle(x - r + 1.5, y - r * 1.6, x + r - 1.5, y - r * 1.6, x, y - 1);
      g.fillStyle(0xffffff);
      g.fillCircle(x, y - r * 2, Math.max(1, r * 0.4));
      if (named) {
        const label = this.scene.add.text(0, y - r * 2, lm.name, {
          ...textStyle(15, { color: COLORS.ink, backgroundColor: COLORS.paper }),
          padding: { x: 4, y: 1 },
        });
        const right = x + r + 4 + label.width > ox + mapW;
        label.setOrigin(right ? 1 : 0, 0.5).setX(right ? x - r - 4 : x + r + 4);
        this.big.addAt(label, this.big.list.length - 1);
        this.labels.push(label);
      }
    }
  }

  /** Rosa-dos-ventos simples com o N, no canto do mapa grande. */
  private compass(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    const r = 14;
    const k = 4;
    g.fillStyle(hex(COLORS.paper), 0.85).fillCircle(x, y, r + 4);
    g.lineStyle(2, hex(COLORS.ink)).strokeCircle(x, y, r + 4);
    g.fillStyle(hex("#e84537")).fillTriangle(x - k, y, x + k, y, x, y - r);
    g.fillStyle(hex(COLORS.ink)).fillTriangle(x - k, y, x + k, y, x, y + r);
    g.fillStyle(hex(COLORS.inkSoft)).fillTriangle(x, y - k, x, y + k, x - r, y).fillTriangle(x, y - k, x, y + k, x + r, y);
    const n = this.scene.add.text(x, y - r - 5, "N", textStyle(14, { color: COLORS.ink })).setOrigin(0.5, 1);
    this.big.addAt(n, this.big.list.length - 1);
    this.labels.push(n);
  }

  private placeMarkers(): void {
    this.miniMarker.setPosition(Math.round(FRAME + this.player.x * MINI_PX), Math.round(FRAME + this.player.y * MINI_PX));
    this.bigMarker.setPosition(
      Math.round(this.bigImage.x + this.player.x * this.bigPx),
      Math.round(this.bigImage.y + this.player.y * this.bigPx)
    );
  }
}
