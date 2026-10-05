/**
 * Configurações globais do jogo.
 * Centralizar aqui evita "números mágicos" espalhados pelo código.
 */
export const GAME = {
  /**
   * Área de mundo (px da arte) que a câmera tenta mostrar. O canvas ocupa
   * a janela inteira e o zoom é o inteiro que mais se aproxima disso
   * (ver src/systems/camera.ts) — pixels sempre do mesmo tamanho.
   */
  view: { w: 480, h: 270 },
  /** tamanho de 1 pixel da arte nas molduras e ícones da interface */
  uiPx: 3,
  tile: 16,
  playerSpeed: 78, // pixels do mundo por segundo
  runMultiplier: 1.7,
  /** distância máxima (px do mundo) entre o "olhar" do jogador e o objeto */
  interactRange: 14,
  /** caracteres por segundo no efeito de máquina de escrever */
  typeSpeed: 55,
  font: "Pixelify Sans",
  background: "#1a1c2c",
} as const;

export const COLORS = {
  ink: "#3f2631",
  inkSoft: "#763b36",
  paper: "#ffe7c2",
  highlight: "#e38628",
  white: "#ffffff",
  gold: "#fdbe53",
} as const;
