import type Phaser from "phaser";
import type { Content } from "../types";

/** Objeto do mundo que abre um balão ao apertar E. */
export interface Interactable {
  content: Content;
  sprite: Phaser.GameObjects.Sprite;
  /** área "tocável", em px do mundo */
  rect: Phaser.Geom.Rectangle;
  sparkle?: Phaser.GameObjects.Sprite;
}

function distToRect(x: number, y: number, r: Phaser.Geom.Rectangle): number {
  const dx = Math.max(r.left - x, 0, x - r.right);
  const dy = Math.max(r.top - y, 0, y - r.bottom);
  return Math.hypot(dx, dy);
}

/** O interativo mais perto do ponto para onde o jogador está olhando. */
export function findTarget(
  items: Interactable[],
  probe: { x: number; y: number },
  range: number
): Interactable | null {
  let best: Interactable | null = null;
  let bestDist = range;
  for (const item of items) {
    const d = distToRect(probe.x, probe.y, item.rect);
    if (d <= bestDist) {
      best = item;
      bestDist = d;
    }
  }
  return best;
}
