import Phaser from "phaser";
import { COLORS } from "../config";
import type { Content } from "../types";
import { PROFILE } from "../data/profile";
import { DialogBox } from "../ui/DialogBox";
import { Prompt } from "../ui/Prompt";
import { resizePanel, setTextResolution, textStyle, woodPanel } from "../ui/text";
import { events, progress } from "../systems/progress";

/** Tempo mínimo entre fechar um balão e poder abrir outro com a mesma tecla. */
const REOPEN_GUARD_MS = 180;
/** Abaixo desta largura (coordenadas da UI) a linha de ajuda some. */
const HELP_MIN_WIDTH = 1000;
const TITLE_PANEL = { w: 860, h: 300 } as const;

/**
 * Camada de interface que roda por cima das outras cenas: título, HUD
 * (local + progresso), prompt "[E]" e balão de diálogo.
 *
 * A UI é montada em "coordenadas da UI" (viewW x viewH). Em telas muito
 * grandes a câmera dela usa zoom 2 — sempre inteiro, para as molduras em
 * pixel art não ficarem com pixels de tamanhos diferentes.
 */
export class UIScene extends Phaser.Scene {
  private dialog!: DialogBox;
  private prompt!: Prompt;
  private hud!: Phaser.GameObjects.Container;
  private locationTag!: Phaser.GameObjects.NineSlice;
  private locationText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private help!: Phaser.GameObjects.Text;
  private title: Phaser.GameObjects.Container | null = null;
  private zoom = 1;
  private viewW = 0;
  private viewH = 0;
  private onStart: (() => void) | null = null;
  private lastClosedAt = -Infinity;

  constructor() {
    super("UI");
  }

  create(): void {
    this.dialog = new DialogBox(this);
    this.prompt = new Prompt(this);
    this.buildHud();

    const kb = this.input.keyboard!;
    for (const key of ["E", "SPACE", "ENTER"]) kb.on(`keydown-${key}`, () => this.onConfirm());
    kb.on("keydown-ESC", () => this.dialog.close());
    ["ONE", "TWO", "THREE", "FOUR"].forEach((key, i) => kb.on(`keydown-${key}`, () => this.dialog.openLink(i + 1)));
    this.input.on("pointerdown", () => this.onConfirm());

    events.on("progress", () => this.updateProgress());
    this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, () => this.layout());
  }

  update(_time: number, delta: number): void {
    this.dialog.update(delta);
  }

  // ── API usada pelas cenas do mundo ──

  get busy(): boolean {
    return this.dialog.isOpen() || this.title !== null;
  }

  canInteract(): boolean {
    return !this.busy && this.game.loop.time - this.lastClosedAt > REOPEN_GUARD_MS;
  }

  openDialog(content: Content): void {
    this.dialog.open(content, () => (this.lastClosedAt = this.game.loop.time));
  }

  /** `screenX`/`screenY` em pixels do canvas. */
  showPrompt(label: string, screenX: number, screenY: number): void {
    this.prompt.show(label, screenX / this.zoom, screenY / this.zoom, this.viewW, this.viewH);
  }

  hidePrompt(): void {
    this.prompt.hide();
  }

  /** Chamado por cada cena explorável ao entrar: atualiza e mostra o HUD. */
  enterWorld(locationName: string): void {
    this.locationText.setText(locationName);
    resizePanel(this.locationTag, this.locationText.width + 44, 52);
    this.updateProgress();
    this.hud.setVisible(true);
  }

  showTitle(onStart: () => void): void {
    this.onStart = onStart;
    this.hud.setVisible(false);
    this.prompt.hide();
    this.title?.destroy();
    this.title = this.buildTitle();
  }

  // ── internos ──

  /** Recalcula zoom e reposiciona tudo; roda no início e a cada resize. */
  private layout(): void {
    const { width, height } = this.scale;
    this.zoom = width >= 2400 && height >= 1300 ? 2 : 1;
    this.viewW = Math.floor(width / this.zoom);
    this.viewH = Math.floor(height / this.zoom);
    this.cameras.main.setZoom(this.zoom).centerOn(width / (2 * this.zoom), height / (2 * this.zoom));
    setTextResolution(this, this.zoom);

    this.help.setPosition(this.viewW - 18, 18).setVisible(this.viewW >= HELP_MIN_WIDTH);
    this.dialog.layout(this.viewW, this.viewH);
    if (this.title) this.layoutTitle(this.title);
  }

  private onConfirm(): void {
    if (this.title) {
      const start = this.onStart;
      this.onStart = null;
      this.tweens.add({
        targets: this.title,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          this.title?.destroy();
          this.title = null;
        },
      });
      start?.();
      return;
    }
    if (this.dialog.isOpen()) this.dialog.advance();
  }

  private buildHud(): void {
    this.locationTag = woodPanel(this, "ui-tag", 16, 16, 200, 52);
    this.locationText = this.add.text(38, 42, "", textStyle(24)).setOrigin(0, 0.5);
    this.progressText = this.add
      .text(22, 80, "", textStyle(20, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 5 }))
      .setOrigin(0, 0);
    this.help = this.add
      .text(
        0,
        18,
        "WASD/setas: andar  ·  Shift: correr  ·  E: interagir",
        textStyle(18, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 5 })
      )
      .setOrigin(1, 0);
    this.hud = this.add
      .container(0, 0, [this.locationTag, this.locationText, this.progressText, this.help])
      .setDepth(80)
      .setVisible(false);
  }

  private updateProgress(): void {
    const n = progress.count();
    const done = n >= progress.total ? "  — tudo descoberto!" : "";
    this.progressText.setText(`Descobertos: ${n}/${progress.total}${done}`);
  }

  private buildTitle(): Phaser.GameObjects.Container {
    const shade = this.add.rectangle(0, 0, 1, 1, 0x1a1c2c, 0.35).setOrigin(0);
    const panel = woodPanel(this, "ui-dialog", 0, 0, TITLE_PANEL.w, TITLE_PANEL.h);
    const name = this.add
      .text(0, 0, PROFILE.name.toUpperCase(), textStyle(58, { color: COLORS.highlight, stroke: COLORS.ink, strokeThickness: 8 }))
      .setOrigin(0.5);
    const role = this.add.text(0, 0, PROFILE.role, textStyle(26)).setOrigin(0.5);
    const tagline = this.add
      .text(0, 0, "Currículo interativo — explore a vila e descubra a carreira.", textStyle(22, { color: COLORS.inkSoft }))
      .setOrigin(0.5);
    const press = this.add
      .text(0, 0, "Pressione ENTER para começar", textStyle(34, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 7 }))
      .setOrigin(0.5);
    this.tweens.add({ targets: press, alpha: 0.25, duration: 650, yoyo: true, repeat: -1 });
    const controls = this.add
      .text(
        0,
        0,
        "WASD ou setas para andar  ·  E para interagir  ·  Esc para fechar",
        textStyle(20, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 5 })
      )
      .setOrigin(0.5);
    const title = this.add.container(0, 0, [shade, panel, name, role, tagline, press, controls]).setDepth(200);
    this.layoutTitle(title);
    return title;
  }

  /** Painel centralizado na tela; os textos ficam a distâncias fixas do centro. */
  private layoutTitle(title: Phaser.GameObjects.Container): void {
    const [shade, panel, name, role, tagline, press, controls] = title.list as [
      Phaser.GameObjects.Rectangle,
      Phaser.GameObjects.NineSlice,
      ...Phaser.GameObjects.Text[],
    ];
    const cx = Math.round(this.viewW / 2);
    const cy = Math.round(this.viewH / 2);
    const panelW = Math.min(TITLE_PANEL.w, this.viewW - 32);
    shade.setSize(this.viewW, this.viewH);
    resizePanel(panel, panelW, TITLE_PANEL.h);
    panel.setPosition(Math.round(cx - panelW / 2), cy - 210);
    name.setPosition(cx, cy - 135);
    role.setPosition(cx, cy - 60);
    tagline.setPosition(cx, cy).setWordWrapWidth(panelW - 48).setAlign("center");
    press.setPosition(cx, cy + 170);
    controls.setPosition(cx, cy + 240).setWordWrapWidth(this.viewW - 32).setAlign("center");
  }
}
