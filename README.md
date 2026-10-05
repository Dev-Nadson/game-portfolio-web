# Currículo Interativo — Nadson Alex

Jogo top-down em pixel art, no estilo Stardew Valley, que funciona como
currículo: você anda por uma vila e descobre a carreira do Nadson.

- **Torre Catsuc** (NO): três zonas contando a progressão Suporte → Júnior → Pleno
- **Clínica NeuroKids** (NE): API NestJS, frontend, RBAC, auditoria e o pipeline de RAG
- **Escola UNIFAVIP** (SE): graduação, PROUNI, ênfases e certificação Rocketseat
- **Horta da stack** (SO): cada canteiro é uma categoria, cada planta uma tecnologia
- **Praça** (centro): boas-vindas, resumo, contato (com links) e idiomas
- **Em breve:** farol na praia (projetos pessoais e futuros), caverna na serra
  (hobbies e fora do código) e a torre do mago a leste

![Vila](docs/screenshot-village.png)

![Escritório da Catsuc](docs/screenshot-catsuc.png)

Feito com **Phaser 3 + TypeScript + Vite**.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando             | O que faz                                             |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | servidor de desenvolvimento                           |
| `npm run build`     | typecheck + build estático em `dist/`                 |
| `npm run preview`   | serve o `dist/` localmente                            |
| `npm run sprites`   | regenera toda a pixel art (veja "Sprites" abaixo)     |
| `npm run typecheck` | só o typecheck                                        |

Abra com `?debug` na URL para ver os colisores.

## Controles

- **WASD** ou **setas**: andar · **Shift**: correr
- **E**, **Espaço** ou **Enter**: interagir / avançar o diálogo
- **Esc**: fechar o diálogo · **1–4**: abrir os links do contato

As estrelinhas marcam o que ainda não foi visto. O progresso
("Descobertos X/Y") fica salvo no navegador.

## Estrutura

```
index.html
public/assets/
  tilesets/world.png          tileset combinado (gerado): Kenney + tiles próprios
  tilesets/kenney-tiny-town/  pack original do Kenney (CC0)
  sprites/*.png               pixel art própria (gerada — não editar à mão)
  fonts/                      Pixelify Sans (OFL)
scripts/
  generate-sprites.ts         `npm run sprites`
  sprites/                    desenho de cada sprite em código
    draw.ts                   primitivas: retângulo, elipse, matriz ASCII, fonte 3x5, contorno
    palette.ts                paleta (extraída do Kenney para combinar)
    player.ts  nature.ts  landscape.ts  buildings.ts  brand.ts
    objects.ts  crops.ts  furniture.ts  tiles.ts  ui.ts
src/
  main.ts                     cria o Phaser.Game
  config.ts                   área de mundo visível, velocidade, alcance de interação
  types.ts                    MapDef, PropDef, Content...
  assets/sprites.gen.ts       manifesto dos sprites (gerado)
  data/                       TODO o texto do currículo
    profile.ts  catsuc.ts  neurokids.ts  education.ts  stack.ts
    extras.ts                 farol, caverna e torre do mago (texto provisório)
  maps/
    tileset.ts                índices dos tiles (Kenney + próprios)
    terrain.ts                grade de terreno + autotile (caminho, água, areia, mar, pedra, cerca, parede)
    village.ts                mapa da vila
    interiors.ts              os três interiores
  scenes/
    BootScene.ts              carrega assets e animações
    TitleScene.ts             tela inicial com a vila ao fundo
    WorldScene.ts             base das cenas exploráveis (jogador, câmera, interação, portas)
    VillageScene.ts  InteriorScene.ts
    UIScene.ts                HUD, prompt [E], diálogo e título (por cima de tudo)
  entities/Player.ts
  entities/player-sheet.ts    layout da spritesheet do jogador (usado também pelo gerador)
  systems/                    camera, map-render, interaction, progress, transition
  ui/                         DialogBox, Prompt, helpers de texto e moldura
docs/                         screenshots e prévia do tileset com índices
```

## Como editar

**Textos do currículo:** só em `src/data/`. Cada objeto do mapa aponta para
um `Content` (`title` + `pages`); cada página é um balão.

**Mapa:** `src/maps/village.ts` descreve o terreno com retângulos
(`grid.rect("path", x, y, w, h)`) e coloca objetos com `place(...)`. Posições em
tiles, no centro-inferior do sprite. Caminhos, água, areia, mar e pedra precisam
ter pelo menos 2 tiles de largura para o autotile funcionar. A cor da margem
fica gravada no tile: areia e pedra têm borda de grama e o mar tem borda de
areia, então deixe 2 tiles de areia entre a grama e o mar e uma faixa de grama
entre a pedra e a areia. As árvores avulsas usam `tree(x, y)`, que sorteia o
tipo pela posição e pela zona da vila (`TREE_ZONES`).

**Tela:** o jogo ocupa a janela inteira. O zoom do mundo é sempre inteiro e
escolhido para mostrar cerca de 480x270 px de mundo (`src/systems/camera.ts`);
a interface usa zoom 2 só em telas bem grandes.

**Sprites:** cada sprite é desenhado em código em `scripts/sprites/`, seja
como matriz de caracteres (o personagem, a logo da Catsuc) ou com primitivas
(prédios, montanhas, móveis). Edite e rode `npm run sprites`. Para um tile
novo, adicione o nome em `src/maps/tileset.ts` e desenhe em
`scripts/sprites/tiles.ts`; um terreno com borda novo entra em `EDGED` e ganha
as 13 peças do autotile pelo pintor `edgedSet`.
A prévia com os índices de todos os tiles está em `docs/tileset-indices.png`.

## Deploy (Vercel / Netlify)

É um site estático:

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Créditos

- Terreno, cercas e alguns objetos: [Tiny Town](https://kenney.nl/assets/tiny-town)
  por Kenney — CC0.
- Fonte: [Pixelify Sans](https://github.com/eifetx/Pixelify-Sans) — SIL Open Font License.
- Personagem, prédios, natureza, praia, serra, móveis e interface: pixel art
  própria, gerada por `scripts/generate-sprites.ts`. A logo da Catsuc foi
  redesenhada em pixel art a partir do SVG oficial.
