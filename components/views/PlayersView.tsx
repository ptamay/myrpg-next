"use client";

import { useAppContext } from "@/contexts/AppContext";
import PlayerCard from "./PlayerCard";

export default function PlayersView() {
  const { dadosGlobais, setModals, setActiveData } = useAppContext();

  return (
    <div className="npc-view-container">
      <div className="sticky-npc-header">
        <header className="npc-header glass-panel">
          <div className="npc-header-info">
            <h1 className="view-title">Personagens da Campanha</h1>
            <p className="view-subtitle">Cadastre os jogadores ou importe a ficha em PDF.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button className="btn primary-btn" onClick={() => { setActiveData(null); setModals((prev: any) => ({ ...prev, playerForm: true })); }}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Novo Jogador</span>
            </button>
          </div>
        </header>
      </div>

      <div className="npc-cards-wrapper scrollable-area">
        <div className="npc-cards-grid">
          {(!dadosGlobais.players || dadosGlobais.players.length === 0) ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>Nenhum personagem de jogador cadastrado ainda.</p>
            </div>
          ) : (
            dadosGlobais.players.map((player: any) => (
              <PlayerCard key={player.id} player={player} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
