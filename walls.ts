import type { KaboomCtx } from "kaboom";
import { GAME_CONFIG } from "./config";

/**
 * Cria 4 paredes estáticas ao redor da tela para que o jogador
 * colida com elas em vez de sair da área visível.
 */
export function createWalls(k: KaboomCtx): void {
  const { width, height, wallThickness: t } = GAME_CONFIG;

  const wall = (x: number, y: number, w: number, h: number) =>
    k.add([
      k.rect(w, h),
      k.pos(x, y),
      k.color(45, 48, 58),
      k.area(),
      k.body({ isStatic: true }),
      "wall",
    ]);

  wall(0, 0, width, t); // topo
  wall(0, height - t, width, t); // base
  wall(0, 0, t, height); // esquerda
  wall(width - t, 0, t, height); // direita
}
