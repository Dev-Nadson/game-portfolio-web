import Phaser from "phaser";
import { GAME } from "../config";
import { VILLAGE } from "../maps/village";
import { renderMap } from "../systems/map-render";
import { fadeIn, goTo } from "../systems/transition";
import type { UIScene } from "./UIScene";

/**
 * Tela inicial: a vila ao fundo com a câmera passeando devagar,
 * e o título desenhado pela UIScene por cima.
 */
export class TitleScene extends Phaser.Scene {
  private starting = false;

  constructor() {
    super("Title");
  }

  create(): void {
    this.starting = false;
    const world = renderMap(this, VILLAGE);
    const cam = this.cameras.main;
    cam.setZoom(GAME.zoom).setRoundPixels(true).setBounds(0, 0, world.widthPx, world.heightPx);
    cam.centerOn(world.widthPx * 0.2, world.heightPx * 0.3);

    // passeio lento entre os pontos da vila
    const stops = [
      [0.2, 0.3],
      [0.8, 0.3],
      [0.78, 0.72],
      [0.25, 0.75],
    ].map(([x, y]) => ({ x: world.widthPx * x, y: world.heightPx * y }));
    const target = { x: stops[0].x, y: stops[0].y };
    this.tweens.chain({
      targets: target,
      loop: -1,
      tweens: [...stops.slice(1), stops[0]].map((p) => ({
        x: p.x,
        y: p.y,
        duration: 9000,
        ease: "Sine.easeInOut",
      })),
    });
    this.events.on("update", () => cam.centerOn(target.x, target.y));

    const ui = this.scene.get("UI") as UIScene;
    ui.showTitle(() => this.start());
    fadeIn(this);
  }

  private start(): void {
    if (this.starting) return;
    this.starting = true;
    goTo(this, "Village", { spawn: "start" });
  }
}
