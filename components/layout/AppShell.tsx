"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardView from "../views/DashboardView";
import NpcsView from "../views/NpcsView";
import SettingsView from "../views/SettingsView";
import FoodView from "../views/FoodView";
import PlayersView from "../views/PlayersView";
import MapsView from "../views/MapsView";
import CronicasView from "../views/CronicasView";
import BackgroundEffects from "./BackgroundEffects";
import ModalsContainer from "../modals/ModalsContainer";
import { useAppContext } from "@/contexts/AppContext";
import { blocosDeTempo } from "@/lib/gameData";

export default function AppShell() {
  const [activeView, setActiveView] = useState("view-dashboard");
  const { diaAtual, indiceBlocoAtivo, jornadaPorDia } = useAppContext();

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

  return (
    <>
      <BackgroundEffects weatherEffect={getActiveWeather()} />
      <div className={`app-shell ${getThemeClass()}`}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="content-area">
          <div style={{ display: activeView === "view-dashboard" ? "block" : "none", height: "100%" }}>
            <DashboardView />
          </div>
          <div style={{ display: activeView === "view-npcs" ? "block" : "none", height: "100%" }}>
            <NpcsView />
          </div>
          <div style={{ display: activeView === "view-settings" ? "block" : "none", height: "100%" }}>
            <SettingsView />
          </div>
          <div style={{ display: activeView === "view-food" ? "block" : "none", height: "100%" }}>
            <FoodView />
          </div>
          <div style={{ display: activeView === "view-players" ? "block" : "none", height: "100%" }}>
            <PlayersView />
          </div>
          <div style={{ display: activeView === "view-maps" ? "block" : "none", height: "100%" }}>
            <MapsView />
          </div>
          <div style={{ display: activeView === "view-cronicas" ? "block" : "none", height: "100%" }}>
            <CronicasView />
          </div>
        </div>
        <ModalsContainer />
      </div>
    </>
  );
}
