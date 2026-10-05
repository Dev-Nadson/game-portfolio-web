import type { InteriorId } from "../types";
import { INTERIORS } from "../maps/interiors";
import { goTo } from "../systems/transition";
import { WorldScene } from "./WorldScene";

export interface InteriorData {
  id: InteriorId;
}

/** Uma única cena para os três prédios; o mapa vem de `data.id`. */
export class InteriorScene extends WorldScene {
  private id: InteriorId = "catsuc";

  constructor() {
    super("Interior");
  }

  protected resolve(data: InteriorData) {
    this.id = data.id;
    return { def: INTERIORS[data.id], spawn: "entry" };
  }

  protected onDoor(): void {
    // interiores não têm portas internas
  }

  protected onExit(): void {
    goTo(this, "Village", { spawn: `from-${this.id}` });
  }
}
