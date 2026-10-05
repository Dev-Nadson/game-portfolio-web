import type { Content } from "../types";

/**
 * Pontos novos da vila, ainda sem texto definitivo. Ficam `optional`
 * (fora do contador "descobertos" e sem estrelinha) até o conteúdo
 * chegar: aí é só escrever as páginas e apagar o `optional`.
 */

export const LIGHTHOUSE: Content = {
  id: "lighthouse",
  title: "Farol",
  optional: true,
  pages: [{ text: "Projetos pessoais e futuros.\n\nEm breve: o farol ainda está sendo aceso." }],
};

export const CAVE: Content = {
  id: "cave",
  title: "Caverna",
  optional: true,
  pages: [{ text: "Hobbies e um pouco de quem eu sou fora do código.\n\nEm breve: a caverna ainda está sendo explorada." }],
};

export const WIZARD_TOWER: Content = {
  id: "wizard-tower",
  title: "Torre do Mago",
  optional: true,
  pages: [{ text: "Uma torre misteriosa... Em breve, algo mágico por aqui." }],
};
