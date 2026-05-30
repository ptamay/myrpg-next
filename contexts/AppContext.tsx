"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useGameSync } from "@/hooks/useGameSync";
import { blocosDeTempo, personagens } from "@/lib/gameData";

export interface GlobalData {
  npcs: any[];
  players: any[];
  plotPoints: any[];
  food: { water: number; food: number; people: number };
  maps: any[];
}

// ... keeping AppContextData exact same

interface AppContextData {
  diaAtual: number;
  setDiaAtual: (dia: number | ((prev: number) => number)) => void;
  indiceBlocoAtivo: number;
  setIndiceBlocoAtivo: (index: number | ((prev: number) => number)) => void;
  dadosGlobais: GlobalData;
  setDadosGlobais: (val: GlobalData | ((prev: GlobalData) => GlobalData)) => void;
  jornadaPorDia: Record<number, any>;
  setJornadaPorDia: (val: Record<number, any> | ((prev: Record<number, any>) => Record<number, any>)) => void;
  salvarEstadoLocal: () => void;
  modals: {
    npcForm: boolean;
    npcDetail: boolean;
    playerForm: boolean;
    playerManage: boolean;
    playerDetail: boolean;
    passDay: boolean;
    globalEvent: boolean;
    globalEventDetail: boolean;
    crop: boolean;
    mainQuest: boolean;
    mainQuestDetail: boolean;
    sideQuest: boolean;
    sideQuestDetail: boolean;
    importNpcText: boolean;
    importNpcOptions: boolean;
    summaryCard: boolean;
    sessionPlayer: boolean;
    personalNote: boolean;
    personalNoteDetail: boolean;
  };
  setModals: React.Dispatch<React.SetStateAction<any>>;
  activeData: any; // Data for detail modals
  setActiveData: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const {
    diaAtual, setDiaAtual,
    indiceBlocoAtivo, setIndiceBlocoAtivo,
    dadosGlobais, setDadosGlobais,
    jornadaPorDia, setJornadaPorDia,
    loading: syncLoading
  } = useGameSync();

  const [mounted, setMounted] = useState(false);
  
  const [modals, setModals] = useState({
    npcForm: false,
    npcDetail: false,
    playerForm: false,
    playerManage: false,
    playerDetail: false,
    passDay: false,
    globalEvent: false,
    globalEventDetail: false,
    crop: false,
    mainQuest: false,
    mainQuestDetail: false,
    sideQuest: false,
    sideQuestDetail: false,
    importNpcText: false,
    importNpcOptions: false,
    summaryCard: false,
    sessionPlayer: false,
    personalNote: false,
    personalNoteDetail: false,
  });
  const [activeData, setActiveData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!syncLoading) {
      setJornadaPorDia((prev) => {
        // Se já houver dados para o dia 1, consideramos que a jornada já foi inicializada
        if (prev[1] && prev[1].blocos) return prev;
        
        const { getInitialJornada } = require("@/lib/dataHelpers");
        return getInitialJornada();
      });
    }
  }, [syncLoading, setJornadaPorDia]);

  const salvarEstadoLocal = () => {
    // Agora o salvamento ocorre automaticamente nos wrappers de setX do useGameSync
  };

  if (!mounted) return null; // Prevent hydration errors
  
  if (syncLoading) {
    return (
      <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem'}}>
        <div className="spinner" style={{width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        <p style={{color: 'var(--text-secondary)'}}>Sincronizando campanha...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
