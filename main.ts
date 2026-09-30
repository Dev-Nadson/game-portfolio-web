import kaboom from "kaboom";
import { GAME_CONFIG } from "./config";
import { createGameScene } from "./game";

const k = kaboom({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  background: GAME_CONFIG.backgroundColor,
  canvas: document.querySelector("#game") as HTMLCanvasElement,
});

createGameScene(k);
k.go("game");