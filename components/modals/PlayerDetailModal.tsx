"use client";

import React, { useState } from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

export default function PlayerDetailModal({ isOpen, onClose, player }: { isOpen: boolean; onClose: () => void; player: any }) {
  const { setModals, setActiveData } = useAppContext();
  const [activeTab, setActiveTab] = useState("stats");

  if (!player) return null;

  const isDead = player.isDead;
  
  const handleEdit = () => {
    setActiveData(player);
    onClose();
    setModals((prev: any) => ({ ...prev, playerForm: true }));
  };

  const hpPct = player.hpMax > 0 ? Math.max(0, Math.min(100, ((player.hpCurrent || 0) / player.hpMax) * 100)) : 0;

  const calcMod = (val: number | string) => {
    const m = Math.floor((parseInt((val || 10).toString()) - 10) / 2);
    return m >= 0 ? `+${m}` : m;
  };

  const attrList = [
    { key: "FOR", label: "Força", val: player.str || 10 },
    { key: "DES", label: "Destreza", val: player.dex || 10 },
    { key: "CON", label: "Constituição", val: player.con || 10 },
    { key: "INT", label: "Inteligência", val: player.int || 10 },
    { key: "SAB", label: "Sabedoria", val: player.wis || 10 },
    { key: "CAR", label: "Carisma", val: player.cha || 10 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="player-detail-modal">
      <div className={`modal-content ${isDead ? "dead-modal-content" : ""}`} style={{ maxWidth: "850px", width: "100%", background: "#09090b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        {isDead && (
          <div className="modal-skull-overlay">
            <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10a8 8 0 1 1 16 0c0 3.18-1.83 6-4.66 7.4L15 22H9l-.34-4.6C5.83 16 4 13.18 4 10z" />
              <path d="M10 14h4" />
              <circle cx="8.5" cy="10" r="1" fill="currentColor" />
              <circle cx="15.5" cy="10" r="1" fill="currentColor" />
            </svg>
          </div>
        )}
        
        <header style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: `2px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)" }}>
              {player.image ? (
                <img src={player.image} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isDead ? "grayscale(100%)" : "none" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold", color: "var(--text-muted)" }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{player.name}</h2>
                {player.inspiration && <span title="Inspiração" style={{ fontSize: "1.2rem" }}>🌟</span>}
              </div>
              <div style={{ fontSize: "1rem", color: "var(--accent-primary)", fontWeight: 700, marginTop: "4px" }}>
                {player.classLevel || 'Sem classe'} <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>•</span> {player.race || 'Sem raça'}
              </div>
              {player.playerName && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Jogador: <strong>{player.playerName}</strong>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleEdit} className="btn secondary-btn" style={{ padding: "8px 16px", borderRadius: "8px" }}>
              Editar Ficha
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", padding: "8px" }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </header>
 
        <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
          <button onClick={() => setActiveTab("stats")} style={{ padding: "12px 20px", background: "transparent", border: "none", color: activeTab === "stats" ? "#fff" : "var(--text-muted)", borderBottom: activeTab === "stats" ? "2px solid var(--accent-primary)" : "2px solid transparent", fontWeight: 700, cursor: "pointer" }}>Atributos & Status</button>
          <button onClick={() => setActiveTab("combat")} style={{ padding: "12px 20px", background: "transparent", border: "none", color: activeTab === "combat" ? "#fff" : "var(--text-muted)", borderBottom: activeTab === "combat" ? "2px solid var(--accent-primary)" : "2px solid transparent", fontWeight: 700, cursor: "pointer" }}>Combate & Magias</button>
          <button onClick={() => setActiveTab("bio")} style={{ padding: "12px 20px", background: "transparent", border: "none", color: activeTab === "bio" ? "#fff" : "var(--text-muted)", borderBottom: activeTab === "bio" ? "2px solid var(--accent-primary)" : "2px solid transparent", fontWeight: 700, cursor: "pointer" }}>Inventário & Bio</button>
        </div>
 
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {activeTab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
                {attrList.map(a => (
                  <div key={a.key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.label}</span>
                    <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", margin: "4px 0" }}>{calcMod(a.val)}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "10px" }}>{a.val}</span>
                  </div>
                ))}
              </div>
 
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: `1px solid rgba(255, 255, 255, 0.05)`, borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Pontos de Vida</span>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                    {player.hpCurrent || 0} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {player.hpMax || 0}</span>
                  </div>
                </div>
                
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: `1px solid rgba(255, 255, 255, 0.05)`, borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Classe de Armadura</span>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                    {player.ac || 10}
                  </div>
                </div>
 
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: `1px solid rgba(255, 255, 255, 0.05)`, borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Proficiência</span>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                    +{player.profBonus || 2}
                  </div>
                </div>
 
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: `1px solid rgba(255, 255, 255, 0.05)`, borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Deslocamento</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: "4px 0", textAlign: "center" }}>
                    {player.speed || "9m"}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", marginBottom: "12px" }}>Salvaguardas</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {Array.isArray(player.saves) && player.saves.length > 0 ? player.saves.map((s: string) => (
                       <span key={s} style={{ background: "rgba(255, 255, 255, 0.05)", color: "#e2e8f0", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", border: "1px solid rgba(255, 255, 255, 0.08)" }}>{s}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nenhuma salvaguarda selecionada.</span>}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", marginBottom: "12px" }}>Perícias</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {Array.isArray(player.skills) && player.skills.length > 0 ? player.skills.map((s: string) => (
                       <span key={s} style={{ background: "rgba(255, 255, 255, 0.05)", color: "#e2e8f0", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", border: "1px solid rgba(255, 255, 255, 0.08)" }}>{s}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nenhuma perícia selecionada.</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "combat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", marginBottom: "12px" }}>Ataques e Habilidades</h3>
                <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {Array.isArray(player.attacks) ? (
                    player.attacks.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {player.attacks.map((atk: any, idx: number) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "8px 12px", alignItems: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>{atk.name || 'Ataque'}</div>
                            <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem" }}>
                              <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{atk.bonus || '--'}</span>
                              <span style={{ color: "var(--text-muted)" }}>{atk.dmg || '--'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : "Nenhum ataque ou habilidade cadastrada."
                  ) : (
                    player.attacks || "Nenhum ataque ou habilidade cadastrada."
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "bio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", marginBottom: "12px" }}>Inventário</h3>
                <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {player.inventory || "Inventário vazio."}
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", marginBottom: "12px" }}>Background / Anotações</h3>
                <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {player.notes || "Sem anotações."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
