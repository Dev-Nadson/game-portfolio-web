import Phaser from "phaser";
import { GAME } from "../config";
import { TITLE_TOUR, VILLAGE } from "../maps/village";
import { renderMap } from "../systems/map-render";
import { fitCamera, onResize } from "../systems/camera";
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
    cam.setRoundPixels(true);
    fitCamera(cam, world.widthPx, world.heightPx);
    onResize(this, () => fitCamera(cam, world.widthPx, world.heightPx));

    // passeio lento entre os pontos da vila (paradas em tiles)
    const stops = TITLE_TOUR.map(([x, y]) => ({ x: x * GAME.tile, y: y * GAME.tile }));
    cam.centerOn(stops[0].x, stops[0].y);
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
