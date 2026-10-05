import Phaser from "phaser";
import { GAME } from "../config";

/**
 * Zoom inteiro que mostra mais ou menos GAME.view de mundo: 3 em 720p,
 * 4 em 1080p, 5 em 1440p. Inteiro = todo pixel da arte do mesmo tamanho.
 */
export function worldZoom(screenW: number, screenH: number): number {
  const ideal = Math.min(screenW / GAME.view.w, screenH / GAME.view.h);
  return Phaser.Math.Clamp(Math.round(ideal), 2, 8);
}

/**
 * Ajusta zoom e limites da câmera ao tamanho atual da tela. Em cada eixo,
 * se o mundo for menor que a vista, o limite vira a própria vista com o
 * mundo no meio — sozinho, o Phaser encostaria o mundo no canto superior
 * esquerdo (caso dos interiores em telas grandes).
 */
export function fitCamera(cam: Phaser.Cameras.Scene2D.Camera, worldW: number, worldH: number): void {
  const zoom = worldZoom(cam.width, cam.height);
  cam.setZoom(zoom);
  const viewW = cam.width / zoom;
  const viewH = cam.height / zoom;
  const x = worldW < viewW ? Math.floor((worldW - viewW) / 2) : 0;
  const y = worldH < viewH ? Math.floor((worldH - viewH) / 2) : 0;
  cam.setBounds(x, y, Math.max(worldW, Math.ceil(viewW)), Math.max(worldH, Math.ceil(viewH)));
}

/**
 * Escuta o redimensionamento da janela enquanto a cena estiver ativa.
 * As cenas do mundo reiniciam a cada porta, então o listener é removido
 * no shutdown para não acumular.
 */
export function onResize(scene: Phaser.Scene, fn: (width: number, height: number) => void): void {
  const handler = (size: Phaser.Structs.Size) => fn(size.width, size.height);
  scene.scale.on(Phaser.Scale.Events.RESIZE, handler);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off(Phaser.Scale.Events.RESIZE, handler));
}
