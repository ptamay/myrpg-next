"use client";

import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useSystemDialog } from "@/contexts/SystemDialogContext";
import { useUserSession } from "@/contexts/UserSessionContext";

import { SAVES_MAP, SKILLS_MAP } from "@/lib/dndConstants";

interface PlayerCardProps {
  player: any;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { dadosGlobais, setDadosGlobais, setModals, setActiveData, salvarEstadoLocal } = useAppContext();
  const { showConfirm } = useSystemDialog();
  const { isGM } = useUserSession();
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [attacksExpanded, setAttacksExpanded] = useState(false);

  const calcMod = (val: number | string) => {
    const m = Math.floor((parseInt((val || 10).toString()) - 10) / 2);
    return m >= 0 ? `+${m}` : m;
  };

  const openDetail = () => {
    setActiveData(player);
    setModals((prev: any) => ({ ...prev, playerForm: true }));
  };

  const openDetailView = () => {
    setActiveData(player);
    setModals((prev: any) => ({ ...prev, playerDetail: true }));
  };

  const removePlayer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGM) return;
    if (await showConfirm({ title: "Remover Jogador", message: `Tem certeza que deseja excluir o jogador ${player.name}?`, type: "danger" })) {
      const newPlayers = dadosGlobais.players.filter((p: any) => p.id !== player.id);
      setDadosGlobais({ ...dadosGlobais, players: newPlayers });
      setTimeout(salvarEstadoLocal, 100);
    }
  };

  const hpPct = player.hpMax > 0 ? Math.max(0, Math.min(100, ((player.hpCurrent !== undefined ? player.hpCurrent : player.hpMax) / player.hpMax) * 100)) : 0;
  
  let hpColor = "#4ade80"; // Saudável (soft green)
  let hpStatusText = "Saudável";

  if (hpPct <= 50) {
    hpColor = "#f87171"; // Perigo (soft red)
    hpStatusText = "Perigo";
  } else if (hpPct <= 75) {
    hpColor = "#fbbf24"; // Ok (soft orange/amber)
    hpStatusText = "Ok";
  }

  const profBonus = player.profBonus || "2";

  const parsedSaves = Array.isArray(player.saves) ? player.saves : (typeof player.saves === 'string' && player.saves ? player.saves.split(',').map((s: string) => s.trim()) : []);
  const parsedSkills = Array.isArray(player.skills) ? player.skills : (typeof player.skills === 'string' && player.skills ? player.skills.split(',').map((s: string) => s.trim()) : []);

  return (
    <div className={`npc-card glass-panel combat-expanded ${player.isDead ? "is-dead" : ""}`} onClick={openDetailView} style={{ cursor: "pointer" }}>
      {player.isDead && <div className="status-dead-overlay">💀</div>}
      
      <div className="npc-card-header">
        {player.image ? (
          <img src={player.image} className="npc-card-avatar" alt={player.name} />
        ) : (
          <div className="npc-card-placeholder">{player.name.charAt(0).toUpperCase()}</div>
        )}
        <div className="npc-card-title-area" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="npc-card-name" style={{ margin: 0, fontSize: player.name?.length > 15 ? "1.05rem" : "1.25rem", fontWeight: 800 }}>
              {player.name}
            </span>
            {player.inspiration && <span className="inspiration-badge" title="Inspiração">🌟</span>}
          </div>
          <div className="npc-card-title">
            {player.playerClass || player.classLevel || 'Sem classe'} {player.playerLevel ? `Nv. ${player.playerLevel}` : ''}
            <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
            <span style={{ color: hpColor, fontWeight: 700 }}>{hpStatusText}</span>
          </div>
          <div className="npc-card-meta">
            <span>{player.race || '---'}</span>
            {player.playerName && (
              <>
                <span>•</span>
                <span>Jogador: {player.playerName}</span>
              </>
            )}
          </div>
        </div>
        <div className="npc-card-actions">
          {isGM && (
            <>
              <button className="npc-card-action" onClick={(e) => { e.stopPropagation(); openDetail(); }} title="Editar">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button className="npc-card-action text-danger" onClick={removePlayer} title="Excluir">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="npc-card-combat-details">
        <div className="npc-card-attrs">
          <div className="attr-m"><span className="attr-lbl">FOR</span><span className="attr-mod">{calcMod(player.str)}</span><span className="attr-val">{player.str || 10}</span></div>
          <div className="attr-m"><span className="attr-lbl">DES</span><span className="attr-mod">{calcMod(player.dex)}</span><span className="attr-val">{player.dex || 10}</span></div>
          <div className="attr-m"><span className="attr-lbl">CON</span><span className="attr-mod">{calcMod(player.con)}</span><span className="attr-val">{player.con || 10}</span></div>
          <div className="attr-m"><span className="attr-lbl">INT</span><span className="attr-mod">{calcMod(player.int)}</span><span className="attr-val">{player.int || 10}</span></div>
          <div className="attr-m"><span className="attr-lbl">SAB</span><span className="attr-mod">{calcMod(player.wis)}</span><span className="attr-val">{player.wis || 10}</span></div>
          <div className="attr-m"><span className="attr-lbl">CAR</span><span className="attr-mod">{calcMod(player.cha)}</span><span className="attr-val">{player.cha || 10}</span></div>
        </div>
        
        <div className="npc-card-stats">
          <div className="stat-mini" title="Classe de Armadura" style={{ cursor: "default" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span className="base-val">{player.ac || '--'}</span>
          </div>
          <div className="stat-mini" title="Iniciativa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
            {player.init || '--'}
          </div>
          <div className="stat-mini" title="Deslocamento">💨 {player.speed || '--'}</div>
          <div className="stat-mini" title="Percepção Passiva">👁️ {player.perc || '--'}</div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "1rem", alignItems: "center", width: "100%", padding: "0 1.5rem 1rem" }}>
          <div className="npc-card-hp-area" style={{ flex: 2.2, display: "flex", flexDirection: "column", padding: 0 }}>
            <div className="hp-header" style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>PONTOS DE VIDA</span>
              <div className="hp-values-group">
                <span className="hp-total-display">{player.hpCurrent || 0}</span>
                <span className="hp-max-val">/ {player.hpMax || 0}</span>
              </div>
            </div>
            <div className="hp-bar-bg" style={{ height: "6px" }}>
              <div className="hp-bar-fill" style={{ width: `${hpPct}%`, backgroundColor: hpColor }}></div>
            </div>
          </div>
          
          <div className="player-card-hd-badge" style={{ flex: "0 0 85px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4px 6px", height: "38px", boxSizing: "border-box" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: 1, display: "block" }}>Dado Vida</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px", lineHeight: 1, display: "block" }}>{player.hdTotal || '1d10'}</span>
          </div>
        </div>

        {player.attacks && player.attacks.length > 0 && (
          <>
            <div className={`player-skills-trigger ${attacksExpanded ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setAttacksExpanded(!attacksExpanded); }}>
              <span>Ataques e Conjurações</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: attacksExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            
            <div className={`player-skills-collapse ${attacksExpanded ? "active" : ""}`} onClick={(e) => e.stopPropagation()} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: attacksExpanded ? "12px" : "0 12px" }}>
              <div className="player-attacks-list" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {player.attacks.map((a: any, i: number) => (
                  <div key={i} className="player-atk-row" style={{ display: "flex", alignItems: "center", fontSize: "0.8rem", padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.02)" }}>
                    <span className="atk-name" style={{ width: "45%", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.name ? a.name.charAt(0).toUpperCase() + a.name.slice(1) : ''}
                    </span>
                    <span className="atk-bonus" style={{ width: "20%", textAlign: "center", color: "var(--accent-primary)", fontWeight: 700 }}>
                      {a.bonus || '--'}
                    </span>
                    <span className="atk-dmg" style={{ width: "35%", textAlign: "right", color: "var(--text-secondary)" }}>
                      {a.dmg || '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className={`player-skills-trigger ${skillsExpanded ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setSkillsExpanded(!skillsExpanded); }}>
          <span>Perícias & Salvaguardas</span>
          <svg className="chevron-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        
        <div className={`player-skills-collapse ${skillsExpanded ? "active" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="prof-bonus-badge-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#e2b43b", letterSpacing: "0.05em" }}>BÔNUS DE PROFICIÊNCIA</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#e2b43b" }}>+{profBonus}</span>
          </div>
          
          <div className="skills-section-container" style={{ marginBottom: "16px" }}>
            <span className="skills-section-title" style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "#8a8a8a", letterSpacing: "0.05em", marginBottom: "8px", display: "block" }}>Salvaguardas</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "16px", rowGap: "8px" }}>
              {SAVES_MAP.map((sv) => {
                const baseVal = parseInt((player[sv.attr] || 10).toString());
                const mod = Math.floor((baseVal - 10) / 2);
                const isProf = parsedSaves.some((s: string) => s.toLowerCase().trim() === sv.key.toLowerCase().trim());
                const total = mod + (isProf ? parseInt(profBonus) : 0);
                const totalStr = total >= 0 ? `+${total}` : `${total}`;
                return (
                  <div key={sv.key} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: isProf ? "#fff" : "#a1a1aa" }}>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      border: isProf ? "2px solid #e2b43b" : "1.5px solid rgba(255,255,255,0.3)",
                      background: isProf ? "#e2b43b" : "transparent",
                      flexShrink: 0
                    }}></div>
                    <span style={{ width: "24px", fontWeight: isProf ? 800 : 500, color: isProf ? "#e2b43b" : "inherit", textAlign: "right", flexShrink: 0 }}>{totalStr}</span>
                    <span style={{ fontWeight: isProf ? 800 : 600, textTransform: "uppercase" }}>{sv.key}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="skills-section-container">
            <span className="skills-section-title" style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "#8a8a8a", letterSpacing: "0.05em", marginBottom: "8px", display: "block" }}>Perícias</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "16px", rowGap: "8px" }}>
              {SKILLS_MAP.map((sk) => {
                const baseVal = parseInt((player[sk.attr] || 10).toString());
                const mod = Math.floor((baseVal - 10) / 2);
                const isProf = parsedSkills.some((s: string) => s.toLowerCase().trim() === sk.label.toLowerCase().trim() || s.toLowerCase().trim() === sk.name.toLowerCase().trim());
                const total = mod + (isProf ? parseInt(profBonus) : 0);
                const totalStr = total >= 0 ? `+${total}` : `${total}`;
                
                const attrIndex = sk.label.indexOf(" (");
                const displayName = attrIndex !== -1 ? sk.label.substring(0, attrIndex) : sk.label;
                const displayAttr = attrIndex !== -1 ? sk.label.substring(attrIndex).trim() : "";

                return (
                  <div key={sk.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: isProf ? "#fff" : "#a1a1aa", minWidth: 0 }}>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      border: isProf ? "2px solid #e2b43b" : "1.5px solid rgba(255,255,255,0.3)",
                      background: isProf ? "#e2b43b" : "transparent",
                      flexShrink: 0
                    }}></div>
                    <span style={{ width: "24px", fontWeight: isProf ? 800 : 500, color: isProf ? "#e2b43b" : "inherit", textAlign: "right", flexShrink: 0 }}>{totalStr}</span>
                    <span style={{ 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap", 
                      fontWeight: isProf ? 700 : 500 
                    }}>
                      <strong style={{ fontWeight: isProf ? 800 : 600, color: isProf ? "#fff" : "inherit" }}>{displayName}</strong>
                      {" "}
                      <span style={{ color: "#71717a", fontSize: "0.65rem", fontWeight: 400 }}>{displayAttr}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
