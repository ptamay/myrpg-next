"use client";

import React from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

export default function SummaryCardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeData } = useAppContext();

  if (!activeData) return null;

  const isPlayer = !!activeData.playerName;
  const isDead = activeData.isDead;
  
  const magentaColor = "#d946ef";
  const badgeGreen = { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" };
  const badgeRed = { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" };
  const badgeRedSolid = { background: "#ef4444", color: "#ffffff", border: "1px solid #ef4444" };
  
  let factionBadge = null;
  if (!isPlayer) {
    if (activeData.faction === 'ally') factionBadge = { label: "ALIADO", style: badgeGreen };
    else if (activeData.faction === 'enemy') factionBadge = { label: "INIMIGO", style: badgeRed };
    else factionBadge = { label: "NEUTRO", style: { background: "rgba(255, 255, 255, 0.1)", color: "#aaa", border: "1px solid rgba(255,255,255,0.2)" }};
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="summary-card-modal">
      <div className="modal-content" style={{ maxWidth: "480px", background: "#09090b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: 0, overflow: "hidden" }}>
        
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
                    border: "1px solid rgba(255,255,255,0.1)",
                    filter: isDead ? "grayscale(100%) brightness(0.6)" : "none",
                    transition: "filter 0.3s ease"
                  }} 
                />
              ) : (
                <div style={{ 
                  width: "100%", height: "100%", borderRadius: "16px", background: "rgba(255,255,255,0.05)", 
                  border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2.5rem", fontWeight: "bold", color: "rgba(255,255,255,0.2)",
                  filter: isDead ? "grayscale(100%) brightness(0.6)" : "none"
                }}>
                  {activeData.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {isDead && (
                <div style={{ 
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.3)", borderRadius: "16px"
                }}>
                  <svg viewBox="0 0 24 24" width="70" height="70" fill="rgba(255,255,255,0.7)" xmlns="http://www.w3.org/2000/svg" style={{ dropShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}>
                    <path d="M12 2C7.58 2 4 5.58 4 10C4 12.04 4.77 13.9 6 15.3V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V15.3C19.23 13.9 20 12.04 20 10C20 5.58 16.42 2 12 2ZM9 11C7.9 11 7 10.1 7 9C7 7.9 7.9 7 9 7C10.1 7 11 7.9 11 9C11 10.1 10.1 11 9 11ZM15 11C13.9 11 13 10.1 13 9C13 7.9 13.9 7 15 7C16.1 7 17 7.9 17 9C17 10.1 16.1 11 15 11ZM14 18H10V15H14V18Z"/>
                  </svg>
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
              <>
                <div>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: magentaColor, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>Jogador</h4>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {activeData.playerName || 'Não definido'}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </Modal>
  );
}
