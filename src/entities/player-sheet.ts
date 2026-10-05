/**
 * Layout da spritesheet do jogador, compartilhado entre o gerador de
 * sprites (roda no Node) e o jogo — por isso não importa o Phaser.
 *
 * Linhas: baixo, esquerda, direita, cima.
 * Coluna 0: parado. Colunas 1–6: ciclo de caminhada
 * (contato, descida, passagem — e o mesmo com a outra perna).
 */
export const PLAYER_FRAME = { w: 16, h: 24 } as const;
export const PLAYER_ROWS = ["down", "left", "right", "up"] as const;
export const WALK_FRAMES = 6;
export const PLAYER_COLS = 1 + WALK_FRAMES;
export const WALK_FPS = 11;

export const idleFrame = (row: number): number => row * PLAYER_COLS;

export const walkFrames = (row: number): number[] =>
  Array.from({ length: WALK_FRAMES }, (_, i) => row * PLAYER_COLS + 1 + i);
