import type { Content } from "../types";

/**
 * Catsuc — Presencial. O escritório tem três zonas, da esquerda para
 * a direita, contando a progressão: Suporte → Júnior → Pleno.
 */

export const CATSUC_DOOR: Content = {
  id: "catsuc-door",
  title: "Catsuc",
  pages: [{ text: "Escritório da Catsuc (presencial). De Técnico de Suporte a Fullstack Pleno em um ano." }],
};

// ── Técnico de Suporte em TI · Julho 2025 – Fevereiro 2026 ──

export const SUPPORT_PLAQUE: Content = {
  id: "catsuc-support",
  title: "Técnico de Suporte em TI",
  pages: [{ text: "Julho 2025 – Fevereiro 2026\n\nOnde tudo começou: servidores Linux, rede e muita automação." }],
};

export const CLI_TERMINAL: Content = {
  id: "catsuc-cli",
  title: "CLI de automação em Python",
  pages: [
    { text: "Automatizei mais de 18 processos operacionais com uma CLI em Python (Typer, Paramiko, Pydantic)." },
    { text: "Resultado: mais de 120 horas economizadas por mês — tarefas de 6 horas passaram a levar 30 minutos." },
  ],
};

export const SERVER_RACKS: Content = {
  id: "catsuc-vms",
  title: "300+ máquinas virtuais",
  pages: [
    {
      text: "Mantive mais de 300 máquinas virtuais Linux com disponibilidade acima de 97%, administrando proxy reverso e rede com Nginx e VyOS.",
    },
  ],
};

export const BACKUPS: Content = {
  id: "catsuc-backup",
  title: "Backups e incidentes",
  pages: [
    { text: "Criei rotinas automatizadas de backup para mais de 30 sistemas Linux e ambientes Docker." },
    { text: "E atuei no diagnóstico de incidentes em produção com systemctl, journalctl, netstat e análise de logs." },
  ],
};

// ── Desenvolvedor Fullstack Júnior · Fevereiro 2026 – Julho 2026 ──

export const JUNIOR_PLAQUE: Content = {
  id: "catsuc-junior",
  title: "Desenvolvedor Fullstack Júnior",
  pages: [{ text: "Fevereiro 2026 – Julho 2026\n\nA virada para o desenvolvimento: APIs, cache, componentes e testes." }],
};

export const ENDPOINTS_DESK: Content = {
  id: "catsuc-endpoints",
  title: "40+ endpoints multi-tenant",
  pages: [
    {
      text: "Desenvolvi mais de 40 endpoints REST multi-tenant com Fastify, TypeScript e Zod, com isolamento entre tenants.",
    },
    { text: "Eles atendem mais de 10.000 requisições por dia." },
  ],
};

export const REDIS_FRIDGE: Content = {
  id: "catsuc-redis",
  title: "A geladeira do cache",
  pages: [
    {
      text: "Reduzi a carga sobre o PostgreSQL com cache em Redis em mais de 30 funcionalidades, melhorando o tempo de resposta da aplicação.",
    },
  ],
};

export const COMPONENTS_SHELF: Content = {
  id: "catsuc-components",
  title: "Biblioteca de componentes",
  pages: [
    {
      text: "Contribuí para uma biblioteca de mais de 25 componentes React com Radix UI e TailwindCSS, reduzindo duplicação em mais de 15 telas.",
    },
  ],
};

export const TEST_BOARD: Content = {
  id: "catsuc-tests",
  title: "Cobertura de testes: 12% -> 67%",
  pages: [
    {
      text: "Elevei a cobertura de testes de 12% para 67% com testes unitários, de integração e end-to-end (Vitest, Jest e Supertest).",
    },
  ],
};

// ── Desenvolvedor Fullstack Pleno · Julho 2026 – Atual ──

export const PLENO_PLAQUE: Content = {
  id: "catsuc-pleno",
  title: "Desenvolvedor Fullstack Pleno",
  pages: [
    { text: "Julho 2026 – Atual" },
    {
      text: "Atuo como principal desenvolvedor de uma aplicação Node.js, Fastify e PostgreSQL, conduzindo a investigação de problemas, a definição de soluções, implementação e evolução técnica do projeto.",
    },
  ],
};

export const S3_STREAMING: Content = {
  id: "catsuc-s3",
  title: "Upload por streaming",
  pages: [
    {
      text: "Implementei upload e download por streaming (Fastify Multipart -> AWS S3) de arquivos grandes, com uso de memória constante.",
    },
  ],
};

export const QUEUES: Content = {
  id: "catsuc-queues",
  title: "Filas com BullMQ",
  pages: [
    {
      text: "Estruturei processamento assíncrono com BullMQ e Redis, com workers, jobs agendados e retry para executar operações em background.",
    },
  ],
};

export const AUTH_VAULT: Content = {
  id: "catsuc-auth",
  title: "JWT + RBAC",
  pages: [
    {
      text: "Implementei autenticação JWT em cookies HttpOnly e RBAC com atualização de permissões em sessões ativas, sem exigir novo login.",
    },
  ],
};

export const DEPLOY_ROCKET: Content = {
  id: "catsuc-deploy",
  title: "Do código ao deploy",
  pages: [
    {
      text: "Realizo o ciclo completo de entrega das aplicações, do desenvolvimento ao deploy com Docker, Nginx, GitHub Actions, VPS e AWS.",
    },
  ],
};

export const GRAFANA_TV: Content = {
  id: "catsuc-grafana",
  title: "Observabilidade",
  pages: [
    {
      text: "Configurei dashboards, métricas e alertas no Grafana e atuo na investigação de incidentes em produção por métricas e logs.",
    },
  ],
};
