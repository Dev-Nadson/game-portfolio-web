import Phaser from "phaser";
import { COLORS, GAME } from "../config";
import type { Content } from "../types";
import { PROFILE } from "../data/profile";
import { DialogBox } from "../ui/DialogBox";
import { Prompt } from "../ui/Prompt";
import { resizePanel, textStyle, woodPanel } from "../ui/text";
import { events, progress } from "../systems/progress";

/** Tempo mínimo entre fechar um balão e poder abrir outro com a mesma tecla. */
const REOPEN_GUARD_MS = 180;

/**
 * Camada de interface que roda por cima das outras cenas, sem zoom:
 * título, HUD (local + progresso), prompt "[E]" e balão de diálogo.
 */
export class UIScene extends Phaser.Scene {
  private dialog!: DialogBox;
  private prompt!: Prompt;
  private hud!: Phaser.GameObjects.Container;
  private locationTag!: Phaser.GameObjects.NineSlice;
  private locationText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private title: Phaser.GameObjects.Container | null = null;
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

  showPrompt(label: string, screenX: number, screenY: number): void {
    this.prompt.show(label, screenX, screenY);
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
    const help = this.add
      .text(
        GAME.width - 18,
        18,
        "WASD/setas: andar  ·  Shift: correr  ·  E: interagir",
        textStyle(18, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 5 })
      )
      .setOrigin(1, 0);
    this.hud = this.add
      .container(0, 0, [this.locationTag, this.locationText, this.progressText, help])
      .setDepth(80)
      .setVisible(false);
  }

  private updateProgress(): void {
    const n = progress.count();
    const done = n >= progress.total ? "  — tudo descoberto!" : "";
    this.progressText.setText(`Descobertos: ${n}/${progress.total}${done}`);
  }

  private buildTitle(): Phaser.GameObjects.Container {
    const cx = GAME.width / 2;
    const shade = this.add.rectangle(0, 0, GAME.width, GAME.height, 0x1a1c2c, 0.35).setOrigin(0);
    const panelW = 860;
    const panelH = 300;
    const panel = woodPanel(this, "ui-dialog", cx - panelW / 2, 150, panelW, panelH);
    const name = this.add
      .text(cx, 225, PROFILE.name.toUpperCase(), textStyle(58, { color: COLORS.highlight, stroke: COLORS.ink, strokeThickness: 8 }))
      .setOrigin(0.5);
    const role = this.add.text(cx, 300, PROFILE.role, textStyle(26)).setOrigin(0.5);
    const tagline = this.add
      .text(cx, 360, "Currículo interativo — explore a vila e descubra a carreira.", textStyle(22, { color: COLORS.inkSoft }))
      .setOrigin(0.5);
    const press = this.add
      .text(cx, 530, "Pressione ENTER para começar", textStyle(34, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 7 }))
      .setOrigin(0.5);
    this.tweens.add({ targets: press, alpha: 0.25, duration: 650, yoyo: true, repeat: -1 });
    const controls = this.add
      .text(
        cx,
        600,
        "WASD ou setas para andar  ·  E para interagir  ·  Esc para fechar",
        textStyle(20, { color: COLORS.paper, stroke: COLORS.ink, strokeThickness: 5 })
      )
      .setOrigin(0.5);
    return this.add.container(0, 0, [shade, panel, name, role, tagline, press, controls]).setDepth(200);
  }
}
