import type { KaboomCtx, GameObj } from "kaboom";
import { GAME_CONFIG } from "./config";

const PLAYER_SIZE = 32;

export function createPlayer(k: KaboomCtx): GameObj {
  return k.add([
    k.rect(PLAYER_SIZE, PLAYER_SIZE),
    k.pos(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2),
    k.anchor("center"),
    k.color(90, 200, 255),
    k.outline(2, k.rgb(255, 255, 255)),
    k.area(),
    k.body(),
    "player",
  ]);
}

/**
 * Lê o teclado (WASD + setas) e move o jogador em até 4 direções,
 * normalizando o vetor para que o movimento na diagonal não seja
 * mais rápido que o movimento reto.
 */
export function handlePlayerMovement(k: KaboomCtx, player: GameObj): void {
  const dir = k.vec2(0, 0);

  if (k.isKeyDown("left") || k.isKeyDown("a")) dir.x -= 1;
  if (k.isKeyDown("right") || k.isKeyDown("d")) dir.x += 1;
  if (k.isKeyDown("up") || k.isKeyDown("w")) dir.y -= 1;
  if (k.isKeyDown("down") || k.isKeyDown("s")) dir.y += 1;

  if (dir.x !== 0 || dir.y !== 0) {
    player.move(dir.unit().scale(GAME_CONFIG.playerSpeed));
  }

  // Trava de segurança: garante que o jogador nunca saia da tela,
  // mesmo que a colisão com as paredes falhe por algum motivo.
  const half = PLAYER_SIZE / 2;
  player.pos.x = k.clamp(player.pos.x, half, GAME_CONFIG.width - half);
  player.pos.y = k.clamp(player.pos.y, half, GAME_CONFIG.height - half);
}
