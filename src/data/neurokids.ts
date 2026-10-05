import type { Content } from "../types";

/** NeuroKids — Engenheiro de Software Pleno · Remoto · Maio 2026 – Atual. */

export const NEUROKIDS_DOOR: Content = {
  id: "neurokids-door",
  title: "NeuroKids",
  pages: [{ text: "Clínica NeuroKids (remoto). Aqui sou o responsável técnico pelo produto." }],
};

export const RECEPTION: Content = {
  id: "neurokids-role",
  title: "Engenheiro de Software Pleno",
  pages: [
    { text: "NeuroKids · Remoto · Maio 2026 – Atual" },
    {
      text: "Responsável técnico pelo produto: defini arquitetura e stack e projetei uma API REST multi-tenant em NestJS com mais de 110 rotas em mais de 25 módulos, documentada com Swagger.",
    },
  ],
};

export const SCREENS_WALL: Content = {
  id: "neurokids-frontend",
  title: "20+ telas responsivas",
  pages: [
    {
      text: "Desenvolvi mais de 20 telas responsivas em Next.js, React, TypeScript e Shadcn/UI, com React Query, Zustand, React Hook Form e Zod.",
    },
  ],
};

export const RBAC_CABINET: Content = {
  id: "neurokids-rbac",
  title: "Dados isolados por clínica",
  pages: [
    {
      text: "Implementei RBAC com Guards e Decorators personalizados, isolando os dados de cada clínica e o acesso de cada profissional aos pacientes.",
    },
    { text: "Tudo sobre 20 tabelas em Prisma e PostgreSQL." },
  ],
};

export const AUDIT_LOG: Content = {
  id: "neurokids-audit",
  title: "Trilha de auditoria",
  pages: [
    {
      text: "Criei uma trilha de auditoria para toda escrita da API via Decorator, com estado antes e depois nos dados de saúde.",
    },
  ],
};

export const RAG_MACHINE: Content = {
  id: "neurokids-rag",
  title: "Pipeline de RAG clínico",
  pages: [
    { text: "Construí um pipeline de RAG para documentos clínicos:" },
    {
      text: "1. Extração de PDFs\n2. Classificação por LLM (OpenAI, JSON schema estrito)\n3. Chunking por seção\n4. Embeddings no pgvector com índice HNSW",
    },
  ],
};

export const AI_ASSISTED: Content = {
  id: "neurokids-ai-dev",
  title: "Desenvolvimento assistido por IA",
  pages: [
    {
      text: "Adotei desenvolvimento assistido por IA com Claude Code, guiado por regras de projeto versionadas, specs e workplans escritos antes de cada feature e uma wiki técnica da arquitetura.",
    },
  ],
};
