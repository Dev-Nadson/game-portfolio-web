/**
 * Configurações globais do jogo.
 * Centralizar aqui evita "números mágicos" espalhados pelo código.
 */
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: [17, 19, 24] as [number, number, number],
  playerSpeed: 220, // pixels por segundo
  wallThickness: 24,
  interactionDistance: 70, // distância máxima para ativar uma estação
} as const;
