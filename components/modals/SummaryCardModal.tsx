"use client";

import React from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

export default function SummaryCardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeData } = useAppContext();

  if (!activeData) return null;

  const isPlayer = !!activeData.playerName;
  const isDead = activeData.isDead;
  
  const magentaColor = "var(--accent-primary)";
  const badgeGreen = { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" };
  const badgeRed = { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" };
  const badgeRedSolid = { background: "#ef4444", color: "#ffffff", border: "1px solid #ef4444" };
  
  let factionBadge = null;
  const currentFaction = isPlayer ? 'ally' : activeData.faction;
  if (currentFaction === 'ally') factionBadge = { label: "ALIADO", style: badgeGreen };
  else if (currentFaction === 'enemy') factionBadge = { label: "INIMIGO", style: badgeRed };
  else factionBadge = { label: "NEUTRO", style: { background: "rgba(255, 255, 255, 0.1)", color: "#aaa", border: "1px solid rgba(255,255,255,0.2)" }};

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="summary-card-modal">
      <div className={`modal-content ${isDead ? "dead-modal-content" : ""}`} style={{ maxWidth: isPlayer ? "800px" : "480px", width: "100%", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: 0, overflow: "hidden" }}>
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
        
        <header style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              Visualização Resumida
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              Ficha do {isPlayer ? "Jogador" : "NPC"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", padding: "4px" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="custom-scrollbar" style={{ padding: "24px", maxHeight: "75vh", overflowY: "auto" }}>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px", alignItems: "center" }}>
            
            <div style={{ position: "relative", width: "110px", height: "110px", flexShrink: 0 }}>
              {activeData.image ? (
                <img 
                  src={activeData.image} 
                  alt="Avatar" 
                  style={{ 
                    width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.1)"
                  }} 
                />
              ) : (
                <div style={{ 
                  width: "100%", height: "100%", borderRadius: "16px", background: "rgba(255,255,255,0.05)", 
                  border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2.5rem", fontWeight: "bold", color: "rgba(255,255,255,0.2)"
                }}>
                  {activeData.name ? activeData.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{activeData.name}</h3>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: magentaColor }}>
                {activeData.title || activeData.classLevel || (isPlayer ? "Sem classe" : "Sem título")}
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
                {activeData.race || "Raça não definida"}
              </div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {factionBadge && (
                  <span style={{ 
                    ...factionBadge.style, 
                    fontSize: "0.55rem", fontWeight: 800, padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.05em" 
                  }}>
                    {factionBadge.label}
                  </span>
                )}
                {isDead && (
                  <span style={{ 
                    ...badgeRedSolid, 
                    fontSize: "0.55rem", fontWeight: 800, padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.05em" 
                  }}>
                    MORTO
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "24px" }}></div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {!isPlayer && (
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Traços de Personalidade</h4>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {activeData.traits || 'Não definidos'}
                </div>
              </div>
            )}

            {!isPlayer && (
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Motivações</h4>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {activeData.mot || 'Não definidas'}
                </div>
              </div>
            )}

            {!isPlayer && (
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Itens Visíveis</h4>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {activeData.itemsVis || 'Nenhum'}
                </div>
              </div>
            )}

            {isPlayer && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Atributos e Estatísticas</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {[
                      { lbl: 'FOR', val: activeData.str }, { lbl: 'DES', val: activeData.dex }, { lbl: 'CON', val: activeData.con },
                      { lbl: 'INT', val: activeData.int }, { lbl: 'SAB', val: activeData.wis }, { lbl: 'CAR', val: activeData.cha }
                    ].map(attr => {
                      const mod = Math.floor((parseInt((attr.val || 10).toString()) - 10) / 2);
                      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                      return (
                        <div key={attr.lbl} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>{attr.lbl}</div>
                          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", margin: "4px 0" }}>{attr.val || 10}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700 }}>{modStr}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Pontos de Vida</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#10b981", marginTop: "4px" }}>{activeData.hpCurrent || 0} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {activeData.hpMax || 0}</span></div>
                  </div>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>CA</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>{activeData.ac || '--'}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Desloc</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>{activeData.speed || '--'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px" }}>
                    <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Salvaguardas</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {Array.isArray(activeData.saves) && activeData.saves.map((save: string, i: number) => (
                        <span key={i} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", color: "#fff", fontWeight: 600 }}>{save}</span>
                      ))}
                      {(!Array.isArray(activeData.saves) || activeData.saves.length === 0) && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nenhuma</span>}
                    </div>
                  </div>

                  <div style={{ flex: 2, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px" }}>
                    <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Perícias</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {Array.isArray(activeData.skills) && activeData.skills.map((skill: string, i: number) => (
                        <span key={i} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", color: "var(--accent-primary)", fontWeight: 600 }}>{skill}</span>
                      ))}
                      {(!Array.isArray(activeData.skills) || activeData.skills.length === 0) && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nenhuma</span>}
                    </div>
                  </div>
                </div>

                {activeData.attacks && activeData.attacks.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Ataques Rápidos</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {activeData.attacks.map((atk: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "10px 14px", alignItems: "center" }}>
                          <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>{atk.name || 'Ataque'}</div>
                          <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{atk.bonus || '--'}</span>
                            <span style={{ color: "var(--text-muted)" }}>{atk.dmg || '--'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Jogador(a)</h4>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {activeData.playerName || 'Não definido'}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Modal>
  );
}
