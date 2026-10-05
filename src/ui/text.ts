import Phaser from "phaser";
import { COLORS, GAME } from "../config";

/**
 * Resolução dos textos da interface. Acompanha o zoom da câmera da UI
 * (1 ou 2) para o texto não sair "esticado" em telas grandes.
 */
let resolution = 1;

/** Estilo de texto padrão da interface (fonte pixel). */
export function textStyle(
  size: number,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {}
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: `"${GAME.font}", monospace`,
    fontSize: `${size}px`,
    color: COLORS.ink,
    resolution,
    ...extra,
  };
}

/** Troca a resolução dos textos novos e de todos os já criados na cena. */
export function setTextResolution(scene: Phaser.Scene, value: number): void {
  if (value === resolution) return;
  resolution = value;
  const visit = (obj: Phaser.GameObjects.GameObject) => {
    if (obj instanceof Phaser.GameObjects.Text) obj.setResolution(value);
    else if (obj instanceof Phaser.GameObjects.Container) obj.list.forEach(visit);
  };
  scene.children.list.forEach(visit);
}

/** Moldura de madeira 9-slice escalada para o pixel da interface (3x). */
export function woodPanel(
  scene: Phaser.Scene,
  texture: "ui-dialog" | "ui-tag",
  x: number,
  y: number,
  width: number,
  height: number
): Phaser.GameObjects.NineSlice {
  const s = GAME.uiPx;
  return scene.add
    .nineslice(x, y, texture, undefined, Math.round(width / s), Math.round(height / s), 6, 6, 6, 6)
    .setOrigin(0)
    .setScale(s);
}

export function resizePanel(panel: Phaser.GameObjects.NineSlice, width: number, height: number): void {
  panel.setSize(Math.round(width / GAME.uiPx), Math.round(height / GAME.uiPx));
}
