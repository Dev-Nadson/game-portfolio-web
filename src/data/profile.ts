import type { Content } from "../types";

/** Conteúdo da praça: boas-vindas, resumo, contato e idiomas. */

export const PROFILE = {
  name: "Nadson Alex da Silva",
  role: "Desenvolvedor Fullstack | Node.js, React, TypeScript e IA",
};

export const WELCOME: Content = {
  id: "welcome",
  title: "Bem-vindo(a) à vila!",
  pages: [
    {
      text: `Este é o currículo interativo de ${PROFILE.name} — Desenvolvedor Fullstack em Node.js, React, TypeScript e IA.`,
    },
    {
      text: "Cada prédio é uma etapa da carreira, a horta guarda a stack técnica e a praça tem o resumo e o contato.",
    },
    {
      text: "WASD ou setas: andar  •  Shift: correr\nE, Espaço ou Enter: interagir  •  Esc: fechar\n\nAs estrelinhas marcam o que você ainda não viu.",
    },
  ],
};

export const ABOUT: Content = {
  id: "about",
  title: "Sobre",
  pages: [
    {
      text: "Desenvolvedor Fullstack em Node.js, React e TypeScript. Entrei na Catsuc como Técnico de Suporte e cheguei a Pleno em um ano, com entregas mensuráveis:",
    },
    {
      text: "• 18+ processos automatizados em Python (120 h/mês)\n• APIs com 10.000+ requisições/dia\n• Cobertura de testes de 12% para 67%",
    },
    {
      text: "Hoje sou responsável técnico pela NeuroKids, onde projetei a API, o frontend e o pipeline de IA (RAG) de uma plataforma clínica.",
    },
  ],
};

export const CONTACT: Content = {
  id: "contact",
  title: "Contato",
  pages: [
    {
      text: "Vamos conversar? Aperte o número ou clique no link:",
      links: [
        { label: "(81) 98978-5231", url: "https://wa.me/5581989785231" },
        { label: "nadson.pros@gmail.com", url: "mailto:nadson.pros@gmail.com" },
        { label: "linkedin.com/in/dev-nadson", url: "https://linkedin.com/in/dev-nadson" },
        { label: "github.com/Dev-Nadson", url: "https://github.com/Dev-Nadson" },
      ],
    },
  ],
};

export const LANGUAGES: Content = {
  id: "languages",
  title: "Idiomas",
  pages: [
    {
      text: "Português: nativo.\nInglês: leitura técnica intermediária, conversação em evolução.",
    },
  ],
};
