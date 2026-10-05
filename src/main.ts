import Phaser from "phaser";
import { GAME } from "./config";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { VillageScene } from "./scenes/VillageScene";
import { InteriorScene } from "./scenes/InteriorScene";
import { UIScene } from "./scenes/UIScene";

async function start(): Promise<void> {
  // o Phaser desenha texto em canvas: a fonte precisa estar pronta antes
  try {
    await document.fonts.load(`24px "${GAME.font}"`);
  } catch {
    // segue com a fonte reserva
  }

  const debug = new URLSearchParams(location.search).has("debug");

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: GAME.background,
    pixelArt: true,
    roundPixels: true,
    physics: { default: "arcade", arcade: { debug } },
    // o canvas ocupa a janela inteira; o zoom de cada cena é recalculado no resize
    scale: { mode: Phaser.Scale.RESIZE },
    // a ordem define a pintura: UI por último, por cima de tudo
    scene: [BootScene, TitleScene, VillageScene, InteriorScene, UIScene],
  });

  // atalho para testes automatizados e depuração no console (só em dev)
  if (import.meta.env.DEV) Object.assign(window, { __game: game });
}

void start();
