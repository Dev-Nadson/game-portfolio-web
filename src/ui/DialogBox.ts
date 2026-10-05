import Phaser from "phaser";
import { COLORS, GAME } from "../config";
import type { Content, DialogLink } from "../types";
import { resizePanel, textStyle, woodPanel } from "./text";

const BOX = { w: 1040, h: 240, bottom: 24 };
const PAD = { x: 38, y: 30 };

/**
 * Balão de diálogo no estilo Stardew: moldura de madeira, nome numa
 * etiqueta em cima, texto letra a letra e seta de "continua".
 * Expõe só open/advance/close/isOpen para o resto do jogo.
 */
export class DialogBox {
  private readonly root: Phaser.GameObjects.Container;
  private readonly tag: Phaser.GameObjects.NineSlice;
  private readonly title: Phaser.GameObjects.Text;
  private readonly body: Phaser.GameObjects.Text;
  private readonly pageLabel: Phaser.GameObjects.Text;
  private readonly arrow: Phaser.GameObjects.Image;
  private links: Phaser.GameObjects.Text[] = [];

  private content: Content | null = null;
  private page = 0;
  private full = "";
  private shown = 0;
  private onClose: (() => void) | null = null;

  constructor(private readonly scene: Phaser.Scene) {
    const x = (GAME.width - BOX.w) / 2;
    const y = GAME.height - BOX.h - BOX.bottom;

    const box = woodPanel(scene, "ui-dialog", x, y, BOX.w, BOX.h);
    this.tag = woodPanel(scene, "ui-tag", x + 20, y - 44, 200, 54);
    this.title = scene.add.text(x + 42, y - 32, "", textStyle(26, { color: COLORS.ink }));
    this.body = scene.add.text(
      x + PAD.x,
      y + PAD.y,
      "",
      textStyle(27, { wordWrap: { width: BOX.w - PAD.x * 2 }, lineSpacing: 8 })
    );
    this.pageLabel = scene.add
      .text(x + BOX.w - 40, y + BOX.h - 26, "", textStyle(18, { color: COLORS.inkSoft }))
      .setOrigin(1, 1);
    this.arrow = scene.add
      .image(x + BOX.w - 50, y + BOX.h - 58, "ui-arrow")
      .setScale(GAME.zoom)
      .setOrigin(0.5);
    scene.tweens.add({ targets: this.arrow, y: this.arrow.y + 8, duration: 380, yoyo: true, repeat: -1 });

    this.root = scene.add
      .container(0, 0, [box, this.tag, this.title, this.body, this.pageLabel, this.arrow])
      .setDepth(100)
      .setVisible(false);
  }

  isOpen(): boolean {
    return this.content !== null;
  }

  open(content: Content, onClose?: () => void): void {
    this.content = content;
    this.onClose = onClose ?? null;
    this.title.setText(content.title);
    resizePanel(this.tag, this.title.width + 44, 54);
    this.root.setVisible(true);
    this.showPage(0);
  }

  /** E/Espaço/Enter: completa o texto, vai para a próxima página ou fecha. */
  advance(): void {
    if (!this.content) return;
    if (this.shown < this.full.length) {
      this.shown = this.full.length;
      this.render();
    } else if (this.page < this.content.pages.length - 1) {
      this.showPage(this.page + 1);
    } else {
      this.close();
    }
  }

  close(): void {
    if (!this.content) return;
    this.content = null;
    this.clearLinks();
    this.root.setVisible(false);
    const cb = this.onClose;
    this.onClose = null;
    cb?.();
  }

  /** Abre o link N (1..4) da página atual, se houver. */
  openLink(n: number): void {
    const link = this.currentLinks()[n - 1];
    if (link && this.shown >= this.full.length) window.open(link.url, "_blank", "noopener");
  }

  update(dtMs: number): void {
    if (!this.content || this.shown >= this.full.length) return;
    this.shown = Math.min(this.full.length, this.shown + (GAME.typeSpeed * dtMs) / 1000);
    this.render();
  }

  private currentLinks(): DialogLink[] {
    return this.content?.pages[this.page]?.links ?? [];
  }

  private showPage(i: number): void {
    if (!this.content) return;
    this.page = i;
    this.clearLinks();
    // quebra as linhas já com o texto inteiro, para nada "pular" enquanto digita
    this.full = this.body.getWrappedText(this.content.pages[i].text).join("\n");
    this.shown = 0;
    const total = this.content.pages.length;
    this.pageLabel.setText(total > 1 ? `${i + 1}/${total}` : "");
    this.render();
  }

  private render(): void {
    const done = this.shown >= this.full.length;
    this.body.setText(this.full.slice(0, Math.floor(this.shown)));
    this.arrow.setVisible(done);
    if (done && this.links.length === 0 && this.currentLinks().length > 0) this.renderLinks();
  }

  private renderLinks(): void {
    let y = this.body.y + this.body.height + 12;
    this.currentLinks().forEach((link, i) => {
      const t = this.scene.add
        .text(this.body.x + 12, y, `[${i + 1}] ${link.label}`, textStyle(26, { color: COLORS.highlight }))
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => t.setColor(COLORS.inkSoft))
        .on("pointerout", () => t.setColor(COLORS.highlight))
        .on("pointerdown", (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
          e.stopPropagation();
          window.open(link.url, "_blank", "noopener");
        });
      this.root.add(t);
      this.links.push(t);
      y += 34;
    });
  }

  private clearLinks(): void {
    this.links.forEach((l) => l.destroy());
    this.links = [];
  }
}
