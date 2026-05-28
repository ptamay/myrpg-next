"use client";

import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";

const SAVES_MAP = [
  { key: "FOR", attr: "str" },
  { key: "DES", attr: "dex" },
  { key: "CON", attr: "con" },
  { key: "INT", attr: "int" },
  { key: "SAB", attr: "wis" },
  { key: "CAR", attr: "cha" }
];

const SKILLS_MAP = [
  { name: "Acrobacia", attr: "dex", label: "Acrobacia (Des)" },
  { name: "Arcanismo", attr: "int", label: "Arcanismo (Int)" },
  { name: "Atletismo", attr: "str", label: "Atletismo (For)" },
  { name: "Atuação", attr: "cha", label: "Atuação (Car)" },
  { name: "Enganação", attr: "cha", label: "Enganação (Car)" },
  { name: "Furtividade", attr: "dex", label: "Furtividade (Des)" },
  { name: "História", attr: "int", label: "História (Int)" },
  { name: "Intimidação", attr: "cha", label: "Intimidação (Car)" },
  { name: "Intuição", attr: "wis", label: "Intuição (Sab)" },
  { name: "Investigação", attr: "int", label: "Investigação (Int)" },
  { name: "Lidar c/ Animais", attr: "wis", label: "Lidar c/ Animais (Sab)" },
  { name: "Medicina", attr: "wis", label: "Medicina (Sab)" },
  { name: "Natureza", attr: "int", label: "Natureza (Int)" },
  { name: "Percepção", attr: "wis", label: "Percepção (Sab)" },
  { name: "Persuasão", attr: "cha", label: "Persuasão (Car)" },
  { name: "Prestidigitação", attr: "dex", label: "Prestidigitação (Des)" },
  { name: "Religião", attr: "int", label: "Religião (Int)" },
  { name: "Sobrevivência", attr: "wis", label: "Sobrevivência (Sab)" }
];

interface PlayerCardProps {
  player: any;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { dadosGlobais, setDadosGlobais, setModals, setActiveData, salvarEstadoLocal } = useAppContext();
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

  const removePlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja excluir o jogador ${player.name}?`)) {
      const newPlayers = dadosGlobais.players.filter((p: any) => p.id !== player.id);
      setDadosGlobais({ ...dadosGlobais, players: newPlayers });
      setTimeout(salvarEstadoLocal, 100);
    }
  };

  const hpPct = player.hpMax > 0 ? Math.max(0, Math.min(100, ((player.hpCurrent || 0) / player.hpMax) * 100)) : 0;
  let hpColorClass = "";
  if (hpPct <= 25) hpColorClass = "danger";
  else if (hpPct <= 50) hpColorClass = "warning";

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
        <div className="npc-card-title-area">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="npc-card-name" style={{ flex: 1, wordBreak: "break-word", lineHeight: 1.2, fontSize: player.name?.length > 15 ? "0.9rem" : "1.1rem", whiteSpace: "normal" }}>
              {player.name}
            </span>
            {player.inspiration && <span className="inspiration-badge" title="Inspiração" style={{ marginLeft: "6px" }}>🌟</span>}
          </div>
          <div className="npc-card-title">{player.classLevel || 'Sem classe/nível'}</div>
          <div className="npc-card-meta">
            <span>{player.race || '---'}</span>
            {player.playerName && <><span>•</span><span>Jogador: {player.playerName}</span></>}
          </div>
        </div>
        <div className="npc-card-actions">
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

        <div style={{ display: "flex", gap: "8px", marginTop: "1rem", alignItems: "stretch", width: "100%" }}>
          <div className="npc-card-hp-area" style={{ flex: 2, marginTop: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="hp-header" style={{ marginBottom: "4px" }}>
              <span>PONTOS DE VIDA</span>
              <div className="hp-values-group">
                <span className="hp-total-display">{player.hpCurrent || 0}</span>
                <span className="hp-max-val">/ {player.hpMax || 0}</span>
              </div>
            </div>
            <div className="hp-bar-bg" style={{ height: "6px" }}>
              <div className={`hp-bar-fill ${hpColorClass}`} style={{ width: `${hpPct}%` }}></div>
            </div>
          </div>
          
          <div className="player-card-hd-badge" style={{ flex: 1, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "4px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4px 6px", minWidth: "65px", height: "32px", boxSizing: "border-box" }}>
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
                  <div key={i} className="player-atk-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.02)" }}>
                    <span className="atk-name" style={{ fontWeight: 700, color: "#fff" }}>{a.name}</span>
                    <span className="atk-bonus" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{a.bonus || '--'}</span>
                    <span className="atk-dmg" style={{ color: "var(--text-secondary)" }}>{a.dmg || '--'}</span>
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
