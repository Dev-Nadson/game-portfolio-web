/**
 * Representa uma "estação" do currículo interativo:
 * um objeto no mapa que, ao ser acessado, mostra uma seção do currículo.
 */
export interface Station {
  id: string;
  /** tag usada pelo Kaboom para identificar o objeto na cena */
  tag: string;
  /** rótulo curto exibido embaixo do ícone e no prompt de interação */
  label: string;
  /** cor do bloco que representa a estação (placeholder até ter sprite) */
  color: [number, number, number];
  pos: { x: number; y: number };
  /** título exibido no topo do balão de diálogo */
  title: string;
  /** linhas de texto exibidas dentro do balão de diálogo */
  lines: string[];
}
