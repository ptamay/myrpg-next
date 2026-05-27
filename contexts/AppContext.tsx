"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { blocosDeTempo, personagens } from "@/lib/gameData";

export interface GlobalData {
  npcs: any[];
  players: any[];
  plotPoints: any[];
  food: { water: number; food: number; people: number };
  maps: any[];
}

interface AppContextData {
  diaAtual: number;
  setDiaAtual: (dia: number) => void;
  indiceBlocoAtivo: number;
  setIndiceBlocoAtivo: (index: number) => void;
  dadosGlobais: GlobalData;
  setDadosGlobais: React.Dispatch<React.SetStateAction<GlobalData>>;
  jornadaPorDia: Record<number, any>;
  setJornadaPorDia: React.Dispatch<React.SetStateAction<Record<number, any>>>;
  salvarEstadoLocal: () => void;
  modals: {
    npcForm: boolean;
    npcDetail: boolean;
    playerForm: boolean;
    playerManage: boolean;
    passDay: boolean;
    globalEvent: boolean;
    crop: boolean;
    mainQuest: boolean;
    mainQuestDetail: boolean;
    sideQuest: boolean;
    sideQuestDetail: boolean;
    importNpcText: boolean;
    importNpcOptions: boolean;
    summaryCard: boolean;
  };
  setModals: React.Dispatch<React.SetStateAction<any>>;
  activeData: any; // Data for detail modals
  setActiveData: React.Dispatch<React.SetStateAction<any>>;
}

const defaultGlobalData: GlobalData = {
  npcs: [],
  players: [],
  plotPoints: [],
  food: { water: 0, food: 0, people: 0 },
  maps: [],
};

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [diaAtual, setDiaAtual] = useLocalStorage("myrpg_dia_atual", 1);
  const [indiceBlocoAtivo, setIndiceBlocoAtivo] = useLocalStorage("myrpg_bloco_ativo", 0);
  const [dadosGlobais, setDadosGlobais] = useLocalStorage<GlobalData>("myrpg_dados_globais", defaultGlobalData);
  const [jornadaPorDia, setJornadaPorDia] = useLocalStorage<Record<number, any>>("myrpg_jornada_por_dia", {});

  const [mounted, setMounted] = useState(false);
  
  const [modals, setModals] = useState({
    npcForm: false,
    npcDetail: false,
    playerForm: false,
    playerManage: false,
    passDay: false,
    globalEvent: false,
    crop: false,
    mainQuest: false,
    mainQuestDetail: false,
    sideQuest: false,
    sideQuestDetail: false,
    importNpcText: false,
    importNpcOptions: false,
    summaryCard: false,
  });
  const [activeData, setActiveData] = useState<any>(null);

  // Inicialização similar ao app.js
  useEffect(() => {
    setMounted(true);
    
    setJornadaPorDia((prev) => {
      // Se já houver dados para o dia 1, consideramos que a jornada já foi inicializada
      if (prev[1] && prev[1].blocos) return prev;
      
      const { getInitialJornada } = require("@/lib/dataHelpers");
      return getInitialJornada();
    });
  }, [setJornadaPorDia]);

  const salvarEstadoLocal = () => {
    // Como estamos usando useLocalStorage, as chamadas para os setters 
    // (setDiaAtual, setDadosGlobais, etc) já salvam automaticamente.
    // Esta função existe para compatibilidade de conceito com o código antigo
    // caso precisemos forçar uma sincronização ou lidar com IndexedDB aqui.
  };

  if (!mounted) return null; // Prevent hydration errors

  return (
    <AppContext.Provider
      value={{
        diaAtual,
        setDiaAtual,
        indiceBlocoAtivo,
        setIndiceBlocoAtivo,
        dadosGlobais,
        setDadosGlobais,
        jornadaPorDia,
        setJornadaPorDia,
        salvarEstadoLocal,
        modals,
        setModals,
        activeData,
        setActiveData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
