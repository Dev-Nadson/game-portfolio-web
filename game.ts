import type { KaboomCtx } from "kaboom";
import { GAME_CONFIG } from "./config";
import { createWalls } from "./walls";
import { createPlayer, handlePlayerMovement } from "./player";
import {
  createStationEntities,
  findNearestStation,
} from "./stations";
import { createDialog } from "./dialog";
import type { Station } from "./types";

export function createGameScene(k: KaboomCtx): void {
  k.scene("game", () => {
    createWalls(k);
    const player = createPlayer(k);
    const stations = createStationEntities(k);
    const dialog = createDialog(k);

    const promptLabel = k.add([
      k.text("", { size: 16 }),
      k.pos(GAME_CONFIG.width / 2, GAME_CONFIG.height - 20),
      k.anchor("center"),
      k.fixed(),
      k.z(50),
    ]);

    let nearStation: Station | null = null;

    k.onUpdate(() => {
      // Trava o movimento enquanto o balão está aberto,
      // pra não "atravessar" a estação sem querer.
      if (!dialog.isOpen()) {
        handlePlayerMovement(k, player);
      }

      nearStation = findNearestStation(
        player,
        stations,
        GAME_CONFIG.interactionDistance
      );

      if (dialog.isOpen()) {
        promptLabel.text = "";
      } else if (nearStation) {
        promptLabel.text = `[E] ${nearStation.label}`;
      } else {
        promptLabel.text = "";
      }
    });

    k.onKeyPress("e", () => {
      if (dialog.isOpen()) {
        dialog.close();
      } else if (nearStation) {
        dialog.open(nearStation.title, nearStation.lines);
      }
    });

    k.onKeyPress("escape", () => {
      dialog.close();
    });
  });
}
