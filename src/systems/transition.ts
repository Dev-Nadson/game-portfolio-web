import type Phaser from "phaser";

const FADE_MS = 260;

/** Escurece a tela, troca de cena e clareia na chegada. */
export function goTo(scene: Phaser.Scene, key: string, data: object): void {
  const cam = scene.cameras.main;
  cam.fadeOut(FADE_MS, 0, 0, 0);
  cam.once("camerafadeoutcomplete", () => scene.scene.start(key, data));
}

export function fadeIn(scene: Phaser.Scene): void {
  scene.cameras.main.fadeIn(FADE_MS, 0, 0, 0);
}
