"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import BackgroundEffects from "./BackgroundEffects";
import ModalsContainer from "../modals/ModalsContainer";
import { useAppContext } from "@/contexts/AppContext";
import { blocosDeTempo } from "@/lib/gameData";
import { useAuth } from "@/contexts/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { diaAtual, indiceBlocoAtivo, jornadaPorDia } = useAppContext();
  const { loading } = useAuth();

  const getActiveWeather = () => {
    const dayData = jornadaPorDia[diaAtual];
    if (dayData?.blocos) {
      const bData = dayData.blocos[indiceBlocoAtivo];
      return bData?.weatherEffect || "clear";
    }
    return "clear";
  };

  const getThemeClass = () => {
    const bloco = blocosDeTempo[indiceBlocoAtivo];
    if (!bloco) return "";
    return `theme-${bloco.tema} theme-${bloco.tema === "diurnal" ? "diurna" : "noturna"} theme-block-${bloco.id}`;
  };

  useEffect(() => {
    const classesToRemove = [
      "theme-diurnal", "theme-diurna", "theme-nocturnal", "theme-noturna",
      "theme-block-1", "theme-block-2", "theme-block-3", "theme-block-4", "theme-block-5", "theme-block-6"
    ];
    document.body.classList.remove(...classesToRemove);
    const newClasses = getThemeClass().split(" ").filter(Boolean);
    if (newClasses.length > 0) {
      document.body.classList.add(...newClasses);
    }
  }, [indiceBlocoAtivo]);

  if (loading) return null;

  return (
    <>
      <BackgroundEffects weatherEffect={getActiveWeather()} />
      <div className={`app-shell ${getThemeClass()}`}>
        <Sidebar />
        <div className="content-area">
          {children}
        </div>
        <ModalsContainer />
      </div>
    </>
  );
}
