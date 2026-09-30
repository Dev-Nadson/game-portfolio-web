import type { KaboomCtx, GameObj } from "kaboom";
import type { Station } from "./types";

const STATION_SIZE = 40;

export interface StationEntity {
  data: Station;
  obj: GameObj;
}

/**
 * Todo o conteúdo do currículo fica centralizado aqui.
 * Para atualizar os textos do jogo, edite só este arquivo —
 * não é preciso mexer na lógica das entidades ou da cena.
 */
export const STATIONS: Station[] = [
  {
    id: "sobre",
    tag: "station-sobre",
    label: "Sobre",
    color: [88, 165, 255],
    pos: { x: 150, y: 130 },
    title: "Sobre Nadson",
    lines: [
      "Desenvolvedor Fullstack em Node.js, React e TypeScript.",
      "Entrou na CATSUC LABS como Técnico de Suporte e chegou a",
      "Pleno em 1 ano: 18+ processos automatizados em Python,",
      "APIs com 10.000+ requisições/dia e cobertura de testes",
      "elevada de 12% para 67%.",
    ],
  },
  {
    id: "experiencia",
    tag: "station-experiencia",
    label: "Experiência",
    color: [255, 191, 105],
    pos: { x: 650, y: 130 },
    title: "Experiência - CATSUC LABS",
    lines: [
      "Fullstack Pleno (jul/2026 - atual)",
      "Principal dev de app em Node.js, Fastify e PostgreSQL. Fluxo",
      "de arquivos com S3, filas com BullMQ/Redis, JWT em cookies",
      "HttpOnly + RBAC dinâmico, deploy com Docker/Nginx/CI,",
      "dashboards no Grafana para 300+ VMs.",
      "",
      "Fullstack Júnior (fev-jul/2026)",
      "40+ endpoints REST multi-tenant, cache em Redis em 30+",
      "funcionalidades, 25+ componentes React reutilizáveis.",
      "",
      "Técnico de Suporte (jul/2025-fev/2026)",
      "CLI em Python (Typer/Paramiko), manutenção de 300+ VMs",
      "Linux e automação de rede/backup.",
    ],
  },
  {
    id: "habilidades",
    tag: "station-habilidades",
    label: "Habilidades",
    color: [140, 230, 160],
    pos: { x: 150, y: 470 },
    title: "Stack Técnica",
    lines: [
      "Backend: Node.js, Fastify, NestJS, Express, TypeScript, Zod,",
      "Prisma, Knex.js",
      "Dados: PostgreSQL, MySQL, SQLite, Redis (ioredis), BullMQ",
      "Frontend: React, Next.js, TanStack Query, Zustand, Tailwind,",
      "Shadcn UI, Radix UI, React Hook Form",
      "DevOps: Docker, Nginx, VyOS, AWS, GitHub Actions, Grafana",
      "Testes: Vitest, Jest, Supertest",
    ],
  },
  {
    id: "formacao",
    tag: "station-formacao",
    label: "Formação",
    color: [200, 140, 255],
    pos: { x: 650, y: 470 },
    title: "Formação Acadêmica",
    lines: [
      "Bacharelado em Ciência da Computação",
      "UNIFAVIP WYDEN - fev/2025 a dez/2029",
      "Bolsista PROUNI integral",
      "",
      "Certificação Fullstack de 380h - Rocketseat",
    ],
  },
  {
    id: "contato",
    tag: "station-contato",
    label: "Contato",
    color: [255, 130, 130],
    pos: { x: 400, y: 150 },
    title: "Contato",
    lines: [
      "(81) 98978-5231",
      "nadson.pros@gmail.com",
      "linkedin.com/in/dev-nadson",
      "github.com/Dev-Nadson",
    ],
  },
];

export function createStationEntities(k: KaboomCtx): StationEntity[] {
  return STATIONS.map((data) => {
    const obj = k.add([
      k.rect(STATION_SIZE, STATION_SIZE, { radius: 6 }),
      k.pos(data.pos.x, data.pos.y),
      k.anchor("center"),
      k.color(...data.color),
      k.outline(2, k.rgb(255, 255, 255)),
      k.area(),
      data.tag,
    ]);

    obj.add([
      k.text(data.label, { size: 12 }),
      k.anchor("center"),
      k.pos(0, STATION_SIZE / 2 + 12),
      k.color(255, 255, 255),
    ]);

    return { data, obj };
  });
}

export function findNearestStation(
  player: GameObj,
  stations: StationEntity[],
  maxDistance: number
): Station | null {
  let nearest: Station | null = null;
  let nearestDist = Infinity;

  for (const station of stations) {
    const dist = player.pos.dist(station.obj.pos);
    if (dist < maxDistance && dist < nearestDist) {
      nearest = station.data;
      nearestDist = dist;
    }
  }

  return nearest;
}
