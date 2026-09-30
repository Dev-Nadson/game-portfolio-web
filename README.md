# Currículo Interativo — Nadson Alex

Jogo top-down 2D feito com Kaboom.js + TypeScript, funcionando como currículo
interativo.

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Controles

- **WASD** ou **setas**: mover o personagem
- **E**: interagir com a estação próxima / fechar o balão
- **ESC**: fechar o balão

## Estrutura

```
src/
  config.ts          -> constantes do jogo (tamanho da tela, velocidade...)
  types.ts            -> tipos (Station)
  data/stations.ts     -> conteúdo do currículo (edite aqui pra mudar textos)
  entities/
    player.ts           -> criação e movimento do jogador
    walls.ts             -> paredes/delimitadores da tela
    stations.ts          -> criação das estações e cálculo de proximidade
  ui/dialog.ts          -> balão de interação (abrir/fechar)
  scenes/game.ts         -> monta a cena e liga tudo
  main.ts                -> inicializa o Kaboom
```

## Próximos passos sugeridos

- Trocar os retângulos por sprites (`k.loadSprite`) quando tiver arte pronta
- Adicionar uma pequena animação de flutuação nos ícones das estações
- Adicionar som ambiente/efeitos (`k.loadSound`)
- Adicionar uma tela inicial com o nome e um botão "Começar"

## Observação

O código foi escrito contra a API do Kaboom.js (pacote `kaboom` no npm).
Se você estiver numa versão diferente da listada no `package.json`, alguns
nomes de métodos podem variar levemente — a estrutura geral (componentes,
cenas, `onUpdate`, `onKeyPress`) se mantém a mesma.
