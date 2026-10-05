import Phaser from "phaser";
import { GAME } from "../config";
import { resizePanel, textStyle, woodPanel } from "./text";

const H = 48;

/** Etiqueta "[E] Nome do objeto" que flutua sobre o objeto mais próximo. */
export class Prompt {
  private readonly root: Phaser.GameObjects.Container;
  private readonly panel: Phaser.GameObjects.NineSlice;
  private readonly label: Phaser.GameObjects.Text;
  private readonly key: Phaser.GameObjects.Image;
  private width = 0;

  constructor(scene: Phaser.Scene) {
    this.panel = woodPanel(scene, "ui-tag", 0, 0, 120, H);
    this.key = scene.add.image(14, H / 2, "ui-key-e").setOrigin(0, 0.5).setScale(GAME.zoom);
    this.label = scene.add.text(62, H / 2 + 1, "", textStyle(22)).setOrigin(0, 0.5);
    this.root = scene.add.container(0, 0, [this.panel, this.key, this.label]).setDepth(90).setVisible(false);
  }

  show(text: string, screenX: number, screenY: number): void {
    if (this.label.text !== text) {
      this.label.setText(text);
      this.width = this.label.x + this.label.width + 20;
      resizePanel(this.panel, this.width, H);
    }
    const x = Phaser.Math.Clamp(screenX - this.width / 2, 8, GAME.width - this.width - 8);
    const y = Phaser.Math.Clamp(screenY - H - 6, 8, GAME.height - H - 8);
    this.root.setPosition(Math.round(x), Math.round(y)).setVisible(true);
  }

  hide(): void {
    this.root.setVisible(false);
  }
}

