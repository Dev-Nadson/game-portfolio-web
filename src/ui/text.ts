import type Phaser from "phaser";
import { COLORS, GAME } from "../config";

/** Estilo de texto padrão da interface (fonte pixel). */
export function textStyle(
  size: number,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {}
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: `"${GAME.font}", monospace`,
    fontSize: `${size}px`,
    color: COLORS.ink,
    ...extra,
  };
}

/** Moldura de madeira 9-slice escalada para o mesmo pixel do mundo (3x). */
export function woodPanel(
  scene: Phaser.Scene,
  texture: "ui-dialog" | "ui-tag",
  x: number,
  y: number,
  width: number,
  height: number
): Phaser.GameObjects.NineSlice {
  const s = GAME.zoom;
  return scene.add
    .nineslice(x, y, texture, undefined, Math.round(width / s), Math.round(height / s), 6, 6, 6, 6)
    .setOrigin(0)
    .setScale(s);
}

export function resizePanel(panel: Phaser.GameObjects.NineSlice, width: number, height: number): void {
  panel.setSize(Math.round(width / GAME.zoom), Math.round(height / GAME.zoom));
}
