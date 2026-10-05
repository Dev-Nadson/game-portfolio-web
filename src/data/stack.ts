import type { Content } from "../types";

/**
 * Horta da stack técnica: cada canteiro é uma categoria e cada planta
 * uma tecnologia. `note` diz onde ela aparece no currículo.
 */

export type CropKind = "backend" | "frontend" | "data" | "ai" | "devops";

export interface Tech {
  name: string;
  note: string;
}

export interface StackCategory {
  kind: CropKind;
  title: string;
  techs: Tech[];
}

export const STACK: StackCategory[] = [
  {
    kind: "backend",
    title: "Backend",
    techs: [
      { name: "Node.js", note: "Base das APIs na Catsuc e na NeuroKids." },
      { name: "NestJS", note: "API da NeuroKids: mais de 110 rotas em mais de 25 módulos." },
      { name: "Fastify", note: "Catsuc: 40+ endpoints multi-tenant e upload por streaming." },
      { name: "Express", note: "Parte do repertório de backend em Node.js." },
      { name: "TypeScript", note: "Em todo o código, do backend ao frontend." },
      { name: "Prisma ORM", note: "NeuroKids: 20 tabelas em PostgreSQL." },
      { name: "Knex.js", note: "Query builder SQL do repertório de backend." },
      { name: "Zod", note: "Validação dos endpoints Fastify e dos formulários React." },
      { name: "APIs REST", note: "40+ endpoints na Catsuc e 110+ rotas na NeuroKids." },
    ],
  },
  {
    kind: "frontend",
    title: "Frontend",
    techs: [
      { name: "React", note: "Biblioteca de 25+ componentes na Catsuc e telas da NeuroKids." },
      { name: "Next.js", note: "20+ telas responsivas da NeuroKids." },
      { name: "Vite", note: "Build rápido de frontend — inclusive deste jogo." },
      { name: "TanStack Query", note: "Busca e cache de dados no frontend da NeuroKids." },
      { name: "Zustand", note: "Estado global das telas da NeuroKids." },
      { name: "TailwindCSS", note: "Estilo da biblioteca de componentes da Catsuc." },
      { name: "Shadcn UI", note: "Interface da plataforma NeuroKids." },
      { name: "Radix UI", note: "Base acessível dos componentes da Catsuc." },
      { name: "React Hook Form", note: "Formulários da NeuroKids, validados com Zod." },
    ],
  },
  {
    kind: "data",
    title: "Dados e Filas",
    techs: [
      { name: "PostgreSQL", note: "Banco principal na Catsuc e na NeuroKids." },
      { name: "pgvector", note: "Embeddings do RAG clínico com índice HNSW." },
      { name: "MySQL", note: "Parte do repertório de bancos relacionais." },
      { name: "Redis", note: "Cache em 30+ funcionalidades e filas do BullMQ." },
      { name: "BullMQ", note: "Workers, jobs agendados e retry na Catsuc." },
    ],
  },
  {
    kind: "ai",
    title: "IA",
    techs: [
      { name: "OpenAI API", note: "Embeddings e structured outputs (JSON schema estrito)." },
      { name: "RAG", note: "Pipeline de documentos clínicos da NeuroKids." },
      { name: "Busca híbrida", note: "Recuperação de documentos combinando estratégias de busca." },
      { name: "Claude Code", note: "Desenvolvimento assistido por IA com specs e workplans." },
    ],
  },
  {
    kind: "devops",
    title: "DevOps e Testes",
    techs: [
      { name: "Docker", note: "Deploy das aplicações e backup de ambientes Docker." },
      { name: "Nginx", note: "Proxy reverso nas VMs e no deploy." },
      { name: "Linux", note: "300+ VMs com disponibilidade acima de 97%." },
      { name: "AWS", note: "S3 com streaming e deploy das aplicações." },
      { name: "Cloudflare R2", note: "Armazenamento de objetos compatível com S3." },
      { name: "GitHub Actions", note: "Pipelines de entrega até o deploy." },
      { name: "Grafana", note: "Dashboards, métricas e alertas em produção." },
      { name: "Vitest", note: "Testes unitários, de integração e e2e: cobertura de 12% para 67%." },
      { name: "Jest", note: "Testes unitários, de integração e e2e: cobertura de 12% para 67%." },
      { name: "Supertest", note: "Testes das APIs HTTP: parte da cobertura de 12% para 67%." },
      { name: "Python", note: "CLI com 18+ automações (120 h/mês economizadas)." },
    ],
  },
];

export function categoryContent(cat: StackCategory): Content {
  return {
    id: `stack-${cat.kind}`,
    title: `Canteiro: ${cat.title}`,
    pages: [{ text: cat.techs.map((t) => t.name).join(" • ") }],
  };
}

export function techContent(cat: StackCategory, tech: Tech): Content {
  return {
    id: `tech-${cat.kind}-${tech.name}`,
    title: tech.name,
    pages: [{ text: tech.note }],
    optional: true,
  };
}
