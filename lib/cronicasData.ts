import { DiaryEntry, Mural } from "@/types/cronicas";

export const mockDiarioEntries: DiaryEntry[] = [
  {
    id: "d1",
    sessionNumber: 14,
    sessionTitle: "A Fuga do Templo",
    authorId: "player-1",
    authorName: "Aris",
    content: "Descobrimos uma passagem secreta no sul do templo. A chave enferrujada do Borin pode abrir algo importante lá dentro.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2min atrás
    likes: [],
  },
  {
    id: "d2",
    sessionNumber: 14,
    sessionTitle: "A Fuga do Templo",
    authorId: "player-2",
    authorName: "Borin",
    content: "Achei uma chave enferrujada perto do altar central.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h atrás
    likes: [],
  },
  {
    id: "d3",
    sessionNumber: 13,
    sessionTitle: "O Mercado das Sombras",
    authorId: "gm",
    authorName: "Mestre",
    content: "Os aventureiros chegaram ao mercado e encontraram pistas sobre o Culto da Serpente operando nas docas.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
    likes: [],
  },
];

export const mockMural: Mural = {
  id: "m1",
  name: "Investigação: O Culto",
  cards: [
    {
      id: "c1", muralId: "m1", type: "nota",
      title: "O Culto da Serpente",
      content: "Um culto que conecta uma amirto da serpente.",
      position: { x: 60, y: 80 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c2", muralId: "m1", type: "retrato",
      title: "Retrato do Líder: Malakor",
      position: { x: 320, y: 60 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c3", muralId: "m1", type: "nota",
      title: "Localização: Templo Arruinado",
      position: { x: 200, y: 240 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c4", muralId: "m1", type: "artefato",
      title: "Artefato: O Olho de Jade",
      position: { x: 60, y: 360 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c5", muralId: "m1", type: "teoria",
      title: "Eles querem a Joia do Rei",
      content: "Eles querem a joia do rei — usarão ela no ritual.",
      position: { x: 320, y: 340 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
  ],
  connections: [
    { id: "conn1", muralId: "m1", fromCardId: "c1", toCardId: "c2" },
    { id: "conn2", muralId: "m1", fromCardId: "c1", toCardId: "c3" },
    { id: "conn3", muralId: "m1", fromCardId: "c1", toCardId: "c4" },
    { id: "conn4", muralId: "m1", fromCardId: "c3", toCardId: "c5" },
    { id: "conn5", muralId: "m1", fromCardId: "c2", toCardId: "c3" },
  ],
  createdAt: new Date().toISOString(),
};
