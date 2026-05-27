"use client";

import React, { useState } from "react";
import Modal from "../ui/Modal";
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

interface SessionPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionPlayerModal({ isOpen, onClose }: SessionPlayerModalProps) {
  const { diaAtual, jornadaPorDia, setJornadaPorDia, activeData, dadosGlobais, setDadosGlobais, salvarEstadoLocal } = useAppContext();

  const [acoes, setAcoes] = useState<any[]>([]);
  const [concluido, setConcluido] = useState(false);

  React.useEffect(() => {
    if (isOpen && activeData) {
      const playerObj = activeData.player || activeData;

      if (activeData.blocoIndex !== undefined) {
        const session = jornadaPorDia[diaAtual]?.blocos?.[activeData.blocoIndex]?.playerSessions?.[playerObj.id];
        const savedAcoes = session?.acoes || [];
        
        // Backward compatibility: map strings to objects
        const mappedAcoes = savedAcoes.map((a: any) => {
          if (typeof a === 'string') {
            return { id: Date.now() + Math.random(), type: 'Livre / Outro', text: a, timeCost: 60 };
          }
          // Convert old isSleep format
          if (a.isSleep !== undefined && a.type === undefined) {
            return { ...a, type: a.isSleep ? 'Dormindo / Descanso' : 'Livre / Outro' };
          }
          return a;
        });

        setAcoes(mappedAcoes);
        setConcluido(session?.concluido || false);
      } else {
        setAcoes([]);
        setConcluido(false);
      }
    }
  }, [isOpen, activeData, diaAtual, jornadaPorDia]);

  if (!activeData || !isOpen) return null;

  const player = activeData.player || activeData;
  const isDead = player.isDead;

  // Calculate Total Sleep in the day (combining saved blocks and the current edited block)
  let totalSleepMinutes = 0;
  if (jornadaPorDia[diaAtual] && jornadaPorDia[diaAtual].blocos) {
    jornadaPorDia[diaAtual].blocos.forEach((b: any, index: number) => {
      if (index === activeData?.blocoIndex) {
        acoes.forEach(a => {
          if (a.type === 'Dormindo / Descanso') totalSleepMinutes += (a.timeCost || 0);
        });
      } else if (b.playerSessions && b.playerSessions[player.id]) {
        (b.playerSessions[player.id].acoes || []).forEach((a: any) => {
          if (a && typeof a === 'object') {
            if (a.type === 'Dormindo / Descanso' || a.isSleep === true) {
              totalSleepMinutes += (a.timeCost || 0);
            }
          }
        });
      }
    });
  }
  const totalSleepHours = (totalSleepMinutes / 60).toFixed(1).replace('.0', '');

  const totalTimeSpentInBlock = acoes.reduce((sum, a) => sum + (a.timeCost || 0), 0);
  const remainingTimeMinutes = 240 - totalTimeSpentInBlock;

  const handleHpChange = (amount: number) => {
    const newPlayers = [...(dadosGlobais.players || [])];
    const idx = newPlayers.findIndex(p => p.id === player.id);
    if (idx !== -1) {
      const max = parseInt(newPlayers[idx].hpMax) || 0;
      let current = parseInt(newPlayers[idx].hpCurrent);
      if (isNaN(current)) current = max;
      current += amount;
      if (current > max) current = max;
      if (current < 0) current = 0;
      newPlayers[idx].hpCurrent = current;
      if (current === 0) newPlayers[idx].isDead = true;
      else newPlayers[idx].isDead = false;
      setDadosGlobais({ ...dadosGlobais, players: newPlayers });
      setTimeout(salvarEstadoLocal, 100);
    }
  };

  const handleSaveDmControls = () => {
    let setPlayerToSleep = false;
    if (activeData.blocoIndex !== undefined) {
       setPlayerToSleep = acoes.some(a => a.type === 'Dormindo / Descanso');
    }

    const newPlayers = [...(dadosGlobais.players || [])];
    const idx = newPlayers.findIndex(p => p.id === player.id);
    if (idx !== -1) {
      newPlayers[idx].sleepHoursToday = Number(totalSleepHours);
      if (setPlayerToSleep) {
        newPlayers[idx].isSleepingAction = true;
      }
      setDadosGlobais({ ...dadosGlobais, players: newPlayers });
    }

    if (activeData.blocoIndex !== undefined) {
      const blocoIndex = activeData.blocoIndex;
      const newJornada = { ...jornadaPorDia };
      const blocos = newJornada[diaAtual].blocos;
      
      if (!blocos[blocoIndex].playerSessions) {
        blocos[blocoIndex].playerSessions = {};
      }

      // Filter out empty 'Livre' actions without text, but keep sleep actions etc.
      const filteredAcoes = acoes.filter(a => {
        if (typeof a === 'object') {
          if (a.type !== 'Livre / Outro') return true; // keep it if it has a category
          return a.text && a.text.trim() !== "";
        }
        return a.trim() !== "";
      });

      blocos[blocoIndex].playerSessions[player.id] = {
        ...blocos[blocoIndex].playerSessions[player.id], // preserve previous things just in case
        acoes: filteredAcoes,
        concluido: concluido
      };
      
      // Delete old objetivos array since it's no longer used
      if (blocos[blocoIndex].playerSessions[player.id].objetivos) {
        delete blocos[blocoIndex].playerSessions[player.id].objetivos;
      }

      setJornadaPorDia(newJornada);
    }

    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  const handleAddAcao = () => setAcoes([...acoes, { id: Date.now(), type: 'Livre / Outro', text: "", timeCost: 60, concluida: false }]);
  
  const handleResetBloco = () => {
    setAcoes([]);
    const newPlayers = [...(dadosGlobais.players || [])];
    const idx = newPlayers.findIndex(p => p.id === player.id);
    if (idx !== -1 && newPlayers[idx].isSleepingAction) {
      newPlayers[idx].isSleepingAction = false;
      setDadosGlobais({ ...dadosGlobais, players: newPlayers });
      setTimeout(salvarEstadoLocal, 100);
    }
  };
  
  const handleAcaoChange = (index: number, field: string, value: any) => {
    const newAcoes = [...acoes];
    if (field === 'type' && value === 'Cozinhar') {
      newAcoes[index] = { ...newAcoes[index], [field]: value, timeCost: 60 };
    } else {
      newAcoes[index] = { ...newAcoes[index], [field]: value };
    }
    setAcoes(newAcoes);
  };

  const handleRemoveAcao = (index: number) => {
    const newAcoes = [...acoes];
    newAcoes.splice(index, 1);
    setAcoes(newAcoes);
  };

  const handleExhaustionChange = (level: number) => {
    const newPlayers = [...(dadosGlobais.players || [])];
    const idx = newPlayers.findIndex(p => p.id === player.id);
    if (idx !== -1) {
      newPlayers[idx].exhaustionLevel = level;
      setDadosGlobais({ ...dadosGlobais, players: newPlayers });
      setTimeout(salvarEstadoLocal, 100);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="session-player-modal">
      <div className="modal-content" style={{ maxWidth: "90%", width: "100%", background: "#09090b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        <header style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              Gestão da Sessão
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              {player.name}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", padding: "4px" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div style={{ display: "flex", flex: 1, minHeight: "60vh", overflow: "hidden" }}>
          
          {/* PAINEL ESQUERDO: FICHA DO JOGADOR */}
          <div className="custom-scrollbar" style={{ flex: 0.3, padding: "12px 16px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", alignItems: "center" }}>
              <div style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "8px", overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)" }}>
                {player.image ? (
                  <img src={player.image} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isDead ? "grayscale(100%) brightness(0.6)" : "none" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: "bold", color: "rgba(255,255,255,0.1)" }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isDead && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "2.5rem", opacity: 0.8 }}>💀</span>
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{player.name}</h3>
                <div style={{ display: "flex", gap: "6px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "12px" }}>
                  <span style={{ color: "#d946ef" }}>{player.classLevel || "Sem classe"}</span>
                  <span style={{ color: "var(--text-muted)" }}>•</span>
                  <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>{player.race || "Raça não definida"}</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
                  {[
                    { lbl: 'FOR', val: player.str }, { lbl: 'DES', val: player.dex }, { lbl: 'CON', val: player.con },
                    { lbl: 'INT', val: player.int }, { lbl: 'SAB', val: player.wis }, { lbl: 'CAR', val: player.cha }
                  ].map(attr => {
                    const mod = Math.floor((parseInt((attr.val || 10).toString()) - 10) / 2);
                    return (
                      <div key={attr.lbl} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "4px 2px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", fontWeight: 800 }}>{attr.lbl}</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#fff", margin: "1px 0 0 0", lineHeight: 1 }}>{attr.val || 10}</div>
                        <div style={{ fontSize: "0.6rem", color: "var(--accent-primary)", fontWeight: 700, lineHeight: 1.1 }}>{mod >= 0 ? `+${mod}` : mod}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>



            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {/* HP */}
              <div style={{ flex: 2, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Vida</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => handleHpChange(-1)} style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "#ef4444", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>-</button>
                  <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#10b981" }}>{player.hpCurrent || 0} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>/ {player.hpMax || 0}</span></span>
                  <button onClick={() => handleHpChange(1)} style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.5)", color: "#10b981", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" }}>+</button>
                </div>
              </div>
              {/* CA */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginLeft: "4px" }}>CA</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#fff", marginRight: "4px" }}>{player.ac || '--'}</span>
              </div>
              {/* Deslocamento */}
              <div style={{ flex: 1.2, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginLeft: "4px" }}>Desloc</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#fff", marginRight: "4px" }}>{player.speed || '--'}</span>
              </div>
            </div>
            
            {/* Perícias e Salvaguardas - Estilo Ficha D&D */}
            {(() => {
              const profBonus = player.profBonus || "2";
              const profBonusNum = parseInt(profBonus.toString()) || 2;
              const parsedSaves = Array.isArray(player.saves) ? player.saves : (typeof player.saves === 'string' && player.saves ? player.saves.split(',').map((s: string) => s.trim()) : []);
              const parsedSkills = Array.isArray(player.skills) ? player.skills : (typeof player.skills === 'string' && player.skills ? player.skills.split(',').map((s: string) => s.trim()) : []);

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#e2b43b", letterSpacing: "0.05em" }}>BÔNUS DE PROFICIÊNCIA</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#e2b43b" }}>+{profBonus}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "#8a8a8a", letterSpacing: "0.05em", display: "block" }}>Salvaguardas</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "16px", rowGap: "8px" }}>
                      {SAVES_MAP.map((sv) => {
                        const baseVal = parseInt((player[sv.attr] || 10).toString());
                        const mod = Math.floor((baseVal - 10) / 2);
                        const isProf = parsedSaves.some((s: string) => s.toLowerCase().trim() === sv.key.toLowerCase().trim());
                        const total = mod + (isProf ? profBonusNum : 0);
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

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "#8a8a8a", letterSpacing: "0.05em", display: "block" }}>Perícias</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "16px", rowGap: "8px" }}>
                      {SKILLS_MAP.map((sk) => {
                        const baseVal = parseInt((player[sk.attr] || 10).toString());
                        const mod = Math.floor((baseVal - 10) / 2);
                        const isProf = parsedSkills.some((s: string) => s.toLowerCase().trim() === sk.label.toLowerCase().trim() || s.toLowerCase().trim() === sk.name.toLowerCase().trim());
                        const total = mod + (isProf ? profBonusNum : 0);
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
              );
            })()}
          </div>

          {/* PAINEL DIREITO: GESTÃO DO MESTRE */}
          <div className="custom-scrollbar" style={{ flex: 0.7, padding: "24px", overflowY: "auto", background: "rgba(139, 92, 246, 0.03)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#8b5cf6", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              Controle de Condições
            </h3>
            
            {/* Old Sleep and Activity blocks removed */}

            <div className="form-group mt-4">
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                Nível de Exaustão
                <span className="text-danger" style={{ fontWeight: "bold" }}>{player.exhaustionLevel || 0} / 6</span>
              </label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                {[0, 1, 2, 3, 4, 5, 6].map(level => (
                  <button 
                    key={level}
                    onClick={() => handleExhaustionChange(level)}
                    style={{ 
                      flex: 1, 
                      padding: "8px 0", 
                      border: "1px solid",
                      borderColor: (player.exhaustionLevel || 0) === level ? "#ef4444" : "rgba(255,255,255,0.1)",
                      background: (player.exhaustionLevel || 0) === level ? "rgba(239, 68, 68, 0.2)" : "transparent",
                      color: (player.exhaustionLevel || 0) === level ? "#fff" : "var(--text-muted)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "10px", borderRadius: "8px", fontSize: "0.75rem", color: "#fca5a5" }}>
                <strong>Efeitos (D&D 5e):</strong>
                <ul style={{ paddingLeft: "1.2rem", margin: "4px 0 0 0" }}>
                  {(player.exhaustionLevel || 0) >= 1 && <li>Desvantagem em testes de habilidade</li>}
                  {(player.exhaustionLevel || 0) >= 2 && <li>Deslocamento reduzido à metade</li>}
                  {(player.exhaustionLevel || 0) >= 3 && <li>Desvantagem em jogadas de ataque e salvaguarda</li>}
                  {(player.exhaustionLevel || 0) >= 4 && <li>Pontos de vida máximos reduzidos à metade</li>}
                  {(player.exhaustionLevel || 0) >= 5 && <li>Deslocamento reduzido a 0</li>}
                  {(player.exhaustionLevel || 0) >= 6 && <li>Morte</li>}
                  {(player.exhaustionLevel || 0) === 0 && <li style={{ listStyle: "none", color: "var(--text-muted)" }}>Sem efeitos adversos no momento.</li>}
                </ul>
              </div>
            </div>

            {activeData.blocoIndex !== undefined && (
              <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#8b5cf6", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Atribuições do Bloco
                </h3>
                
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", background: "rgba(0,0,0,0.2)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                        Tempo Restante no Bloco
                        <button onClick={handleResetBloco} title="Resetar Tempo do Bloco" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "4px", color: "#fca5a5", fontSize: "0.6rem", padding: "2px 6px", cursor: "pointer", fontWeight: 700, textTransform: "uppercase" }}>Resetar</button>
                      </span>
                      <span style={{ fontSize: "0.85rem", color: remainingTimeMinutes < 0 ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                        {Math.floor(Math.abs(remainingTimeMinutes) / 60)}h {Math.abs(remainingTimeMinutes) % 60}m {remainingTimeMinutes < 0 ? 'excedido' : 'disponíveis'}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Total de Sono Hoje: <strong style={{ color: "var(--text-primary)" }}>{totalSleepHours}h</strong> <span style={{fontSize: "0.7rem"}}>/ {player.minSleepReq || 8}h mín</span></div>
                    </div>
                  </div>

                  {acoes.map((acao, i) => acao.concluida ? (
                    <div key={acao.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", background: "rgba(16, 185, 129, 0.05)", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                      <span style={{ fontSize: "0.85rem", color: "#a7f3d0", fontWeight: 600 }}>✓ {acao.type !== 'Livre / Outro' ? acao.type : acao.text}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>-{acao.timeCost}m</span>
                    </div>
                  ) : (
                    <div key={acao.id || i} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", background: "rgba(59, 130, 246, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                      <div style={{ fontSize: "0.7rem", color: "#93c5fd", fontWeight: 800, textTransform: "uppercase", marginBottom: "-4px" }}>Ação Ativa</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select className="journey-input" value={acao.type || 'Livre / Outro'} onChange={(e) => handleAcaoChange(i, 'type', e.target.value)} style={{ margin: 0, padding: "6px 10px", width: "auto", flexShrink: 0 }}>
                          <option value="Dormindo / Descanso">💤 Dormindo / Descanso</option>
                          <option value="De Guarda / Vigiando">🛡️ De Guarda / Vigiando</option>
                          <option value="Explorando / Investigando">🗺️ Explorando / Investigando</option>
                          <option value="Cozinhar">🍳 Cozinhar</option>
                          <option value="Consertando navio">🛠️ Consertando navio</option>
                          <option value="Viajando / Deslocamento">🐎 Viajando / Deslocamento</option>
                          <option value="Ofício / Preparação">⚒️ Ofício / Preparação</option>
                          <option value="Livre / Outro">🎲 Livre / Outro</option>
                        </select>
                        {(!acao.type || acao.type === 'Livre / Outro') && (
                          <input type="text" className="journey-input" value={acao.text || ""} onChange={(e) => handleAcaoChange(i, 'text', e.target.value)} placeholder="Detalhes (obrigatório)..." style={{ flex: 1, margin: 0 }} />
                        )}
                        <button className="btn danger-btn small-btn" onClick={() => handleRemoveAcao(i)} style={{ padding: "4px 8px", margin: 0, marginLeft: "auto" }}>✕</button>
                      </div>
                      <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "4px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold" }}>Tempo investido:</span>
                        {acao.type === 'Cozinhar' ? (
                          <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700, padding: "4px 8px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                            1 Hora (Fixo)
                          </span>
                        ) : (
                          <select className="journey-input" value={acao.timeCost || 60} onChange={(e) => handleAcaoChange(i, 'timeCost', Number(e.target.value))} style={{ margin: 0, padding: "4px 10px", height: "auto", fontSize: "0.8rem", width: "120px" }}>
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={60}>1 Hora</option>
                            <option value={90}>1.5 Horas</option>
                            <option value={120}>2 Horas</option>
                            <option value={180}>3 Horas</option>
                            <option value={240}>4 Horas</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  {acoes.length === 0 && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>Nenhuma ação registrada neste bloco.</p>}
                  
                  {!acoes.some(a => !a.concluida) && (
                    <button className="btn secondary-btn" onClick={handleAddAcao} style={{ width: "100%", marginTop: "10px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderStyle: "dashed" }}>
                       <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                       Adicionar Ação ao Bloco
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="modal-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between" }}>
          <div></div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn secondary-btn" onClick={onClose}>Cancelar</button>
            <button className="btn primary-btn" onClick={handleSaveDmControls}>Salvar Alterações</button>
          </div>
        </footer>
      </div>
    </Modal>
  );
}
