import type { SpriteKey } from "./assets/sprites.gen";

export type Facing = "down" | "left" | "right" | "up";

export interface DialogLink {
  label: string;
  url: string;
}

/** Uma "página" do balão de diálogo — avança com E/Espaço/Enter. */
export interface DialogPage {
  text: string;
  links?: DialogLink[];
}

/**
 * Conteúdo de um objeto interativo. Os textos do currículo vivem em
 * src/data e são ligados aos objetos do mapa por aqui.
 */
export interface Content {
  id: string;
  /** título do balão e rótulo do prompt "[E] ..." */
  title: string;
  pages: DialogPage[];
  /** não conta no progresso "descobertos" (ex.: cada planta da horta) */
  optional?: boolean;
}

export type InteriorId = "catsuc" | "neurokids" | "school";
export type SceneKey = "Village" | "Interior";

export interface PropDef {
  /** sprite gerado ou "kenney" (usa `frame` do tileset do Kenney) */
  sprite: SpriteKey | "kenney";
  frame?: number;
  /** posição do centro-inferior do sprite, em tiles (aceita frações) */
  x: number;
  y: number;
  /**
   * Colisor em px do mundo, alinhado ao centro-inferior do sprite.
   * `false` = atravessável. Omitido = base do sprite.
   */
  body?: { w: number; h: number; dy?: number } | false;
  /** "floor" fica sob tudo (tapetes); "auto" ordena por Y (padrão) */
  layer?: "floor" | "auto";
  content?: Content;
  /** frames da spritesheet para animar em loop */
  anim?: { frames: number[]; fps: number };
  flipX?: boolean;
}

export interface DoorDef {
  /** tile(s) da porta na última linha do prédio */
  x: number;
  y: number;
  w: number;
  target: InteriorId;
}

export interface ExitDef {
  x: number;
  y: number;
  w: number;
}

export interface Spawn {
  x: number;
  y: number;
  facing: Facing;
}

export interface MapDef {
  key: string;
  /** nome exibido no canto da tela */
  name: string;
  width: number;
  height: number;
  ground: number[][];
  /** segunda camada de tiles (cercas etc.), -1 = vazio */
  overlay: number[][];
  collision: boolean[][];
  /** pares de tiles trocados em loop no chão (animação do mar) */
  tileAnims?: [number, number][];
  props: PropDef[];
  doors: DoorDef[];
  exits: ExitDef[];
  spawns: Record<string, Spawn>;
}
