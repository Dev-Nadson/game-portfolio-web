/**
 * Configurações globais do jogo.
 * Centralizar aqui evita "números mágicos" espalhados pelo código.
 */
export const GAME = {
  width: 1280,
  height: 720,
  /** zoom da câmera do mundo: 1 pixel da arte = 3 pixels na tela */
  zoom: 3,
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
