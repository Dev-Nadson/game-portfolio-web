import Phaser from "phaser";
import { COLORS, GAME } from "../config";
import { SPRITES } from "../assets/sprites.gen";
import { createPlayerAnims } from "../entities/Player";
import { textStyle } from "../ui/text";

/** Carrega todos os assets, cria as animações e abre a tela inicial. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    const label = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Carregando...", textStyle(32, { color: COLORS.paper }))
      .setOrigin(0.5);
    this.load.on("progress", (p: number) => label.setText(`Carregando... ${Math.round(p * 100)}%`));

    this.load.image("world", "assets/tilesets/world.png");
    this.load.spritesheet("kenney", "assets/tilesets/kenney-tiny-town/tilemap_packed.png", {
      frameWidth: GAME.tile,
      frameHeight: GAME.tile,
    });
    for (const s of SPRITES) {
      if ("frameWidth" in s) {
        this.load.spritesheet(s.key, s.file, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
      } else {
        this.load.image(s.key, s.file);
      }
    }
  }

  create(): void {
    createPlayerAnims(this);
    this.anims.create({
      key: "sparkle",
      frames: this.anims.generateFrameNumbers("sparkle", { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.launch("UI");
    this.scene.start("Title");
  }
}
