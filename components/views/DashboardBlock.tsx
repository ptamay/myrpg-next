"use client";

import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useUserSession } from "@/contexts/UserSessionContext";
import { blocosDeTempo } from "@/lib/gameData";
import CelestialIcon from "../ui/CelestialIcon";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardBlock() {
  const { diaAtual, indiceBlocoAtivo, jornadaPorDia, setJornadaPorDia, dadosGlobais, setDadosGlobais, setModals, setActiveData, salvarEstadoLocal } = useAppContext();
  const { isGM, session } = useUserSession();
  const router = useRouter();

  const dayData = jornadaPorDia[diaAtual];
  if (!dayData || !dayData.blocos) return null;

  const bData = dayData.blocos[indiceBlocoAtivo];

  const handleConcluirAcao = (e: React.MouseEvent, playerId: string, acaoId: number, isSleeping: boolean) => {
    e.stopPropagation();
    if (!isGM) return; // Jogadores não podem concluir ações por enquanto (ou só do próprio char)
    
    const newJornada = JSON.parse(JSON.stringify(jornadaPorDia));
    const pSession = newJornada[diaAtual].blocos[indiceBlocoAtivo].playerSessions[playerId];
    if (pSession && pSession.acoes) {
      const idx = pSession.acoes.findIndex((a: any) => typeof a === 'object' && a.id === acaoId);
      if (idx !== -1) {
         pSession.acoes[idx].concluida = true;
      }
    }
    setJornadaPorDia(newJornada);
    
    if (isSleeping) {
       const newPlayers = [...dadosGlobais.players];
       const idx = newPlayers.findIndex(p => p.id === playerId);
       if(idx !== -1) {
         newPlayers[idx].isSleepingAction = false;
         setDadosGlobais({...dadosGlobais, players: newPlayers});
       }
    }
    setTimeout(salvarEstadoLocal, 100);
  };
  const bloco = blocosDeTempo[indiceBlocoAtivo];
  const players = (dadosGlobais.players || []).slice().sort((a: any, b: any) => {
    if (a.id === session?.playerId) return -1;
    if (b.id === session?.playerId) return 1;
    return 0;
  });

  const getAvatarUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    const supabase = createClient();
    return supabase.storage.from("images").getPublicUrl(img).data.publicUrl;
  };

  const updateWeather = (weather: string) => {
    const newJornada = JSON.parse(JSON.stringify(jornadaPorDia));
    
    // 1. Propagar para os blocos seguintes do dia atual
    for (let i = indiceBlocoAtivo; i < newJornada[diaAtual].blocos.length; i++) {
      newJornada[diaAtual].blocos[i].weatherEffect = weather;
    }
    
    // 2. Propagar para todos os dias subsequentes que já estejam criados
    const totalDays = Object.keys(newJornada).map(Number);
    totalDays.forEach(day => {
      if (day > diaAtual && newJornada[day]?.blocos) {
        newJornada[day].blocos.forEach((b: any) => {
          b.weatherEffect = weather;
        });
      }
    });

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
  };

  const removeTopic = (type: "timeline" | "plots" | "sidequests", index: number) => {
    const newJornada = JSON.parse(JSON.stringify(jornadaPorDia));
    newJornada[diaAtual].blocos[indiceBlocoAtivo][type].splice(index, 1);
    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
  };

  const openGlobalEvent = (index?: number) => {
    if (index !== undefined) {
      setActiveData({ blocoIndex: indiceBlocoAtivo, topicIndex: index, type: "timeline", data: bData.timeline[index] });
      setModals((prev: any) => ({ ...prev, globalEventDetail: true }));
    } else {
      setActiveData({ blocoIndex: indiceBlocoAtivo, type: "timeline", data: { title: '', desc: '', trigger: '', save: '', damage: '' } });
      setModals((prev: any) => ({ ...prev, globalEvent: true }));
    }
  };

  const openMainQuest = (index?: number) => {
    if (index !== undefined) {
      setActiveData({ blocoIndex: indiceBlocoAtivo, topicIndex: index, type: "plots", data: bData.plots[index] });
      setModals((prev: any) => ({ ...prev, mainQuestDetail: true }));
    } else {
      setActiveData({ blocoIndex: indiceBlocoAtivo, type: "plots", data: { title: '', day: diaAtual, phases: [], notes: '' } });
      setModals((prev: any) => ({ ...prev, mainQuest: true }));
    }
  };

  const openSideQuest = (index?: number) => {
    if (index !== undefined) {
      setActiveData({ blocoIndex: indiceBlocoAtivo, topicIndex: index, type: "sidequests", data: bData.sidequests[index] });
      setModals((prev: any) => ({ ...prev, sideQuestDetail: true }));
    } else {
      setActiveData({ blocoIndex: indiceBlocoAtivo, type: "sidequests", data: { title: '', day: diaAtual, npc: '', desc: '', tests: [] } });
      setModals((prev: any) => ({ ...prev, sideQuest: true }));
    }
  };

  const openPersonalNote = (index?: number) => {
    if (index !== undefined) {
      if (session?.id) {
        const myNotes = bData.playerSessions?.[session.id]?.notes || [];
        setActiveData({ topicIndex: index, data: myNotes[index] });
        setModals((prev: any) => ({ ...prev, personalNoteDetail: true }));
      }
    } else {
      setActiveData({ data: { title: '', desc: '' } });
      setModals((prev: any) => ({ ...prev, personalNote: true }));
    }
  };

  const openPlayerManage = (player: any) => {
    setActiveData({ blocoIndex: indiceBlocoAtivo, player });
    setModals((prev: any) => ({ ...prev, playerManage: true }));
  };

  const worldBlock = (
    <div className="world-events">
      <h3 className="section-title mb-3">O Mundo</h3>
      <div className="scrollable-area" style={{ paddingRight: "0.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div className="world-section">
          <div className="world-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5h-.5c-.5-3-3-5.5-6-5.5s-5.5 2.5-6 5.5h-.5C2.5 10 0 12 0 14.5S2.5 19 5 19h12.5z"></path></svg> 
              Atmosfera
            </h4>
          </div>
          <select className="journey-input modern-input w-full" value={bData.weatherEffect || "clear"} onChange={(e) => updateWeather(e.target.value)} disabled={!isGM}>
            <option value="clear">☀️ Céu Limpo / Sol Radiante</option>
            <option value="fog">🌫️ Névoa Misteriosa</option>
            <option value="rain">🌧️ Chuva Melancólica</option>
            <option value="storm">⚡ Tempestade de Raios</option>
            <option value="snow">❄️ Neve Silenciosa</option>
            <option value="blizzard">🌨️ Nevasca / Gelo</option>
            <option value="ember">🔥 Cinzas de Fogo (Brasas)</option>
            <option value="sandstorm">🏜️ Tempestade de Areia</option>
            <option value="eclipse">🌑 Eclipse Celestial</option>
            <option value="arcane">🔮 Neblina Arcana</option>
          </select>
        </div>

        <div className="world-section">
          <div className="world-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 
              Eventos Globais
            </h4>
            {isGM && (
              <button className="ghost-add-btn" onClick={() => openGlobalEvent()}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add
              </button>
            )}
          </div>
          <div className="world-cards-grid">
            {bData.timeline?.length > 0 ? bData.timeline.map((t: any, i: number) => (
              <div key={i} className={`modern-card world-compact-card ${isGM ? 'clickable-card' : ''}`} onClick={() => isGM && openGlobalEvent(i)}>
                <div className="world-card-header">
                  <h5 className="world-card-title">{t.title || 'Evento Sem Título'}</h5>
                  {isGM && (
                    <button className="ghost-delete-btn world-card-action" onClick={(e) => { e.stopPropagation(); removeTopic('timeline', i); }} title="Excluir">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  )}
                </div>
                {t.save || t.damage ? (
                  <div className="world-card-mechanics">
                    {t.save && (
                      <span className="mechanic-badge save-badge">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        {t.save}
                      </span>
                    )}
                    {t.damage && (
                      <span className="mechanic-badge damage-badge">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        {t.damage}
                      </span>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--border-subtle)" }}>
                    {t.desc ? (t.desc.length > 60 ? t.desc.substring(0, 60) + '…' : t.desc) : 'Sem descrição.'}
                  </p>
                )}
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block", opacity: 0.6 }}>Clique para detalhes</span>
              </div>
            )) : <p className="text-muted text-center py-2" style={{ fontSize: "0.8rem" }}>Nenhum evento registrado.</p>}
          </div>
        </div>

        {isGM && (
          <>
            <div className="world-section">
              <div className="world-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg> 
                  Quest Principal
                </h4>
                <button className="ghost-add-btn" onClick={() => openMainQuest()}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add
                </button>
              </div>
              <div className="world-cards-grid">
                {bData.plots?.length > 0 ? bData.plots.map((p: any, i: number) => {
                  const phases = p.phases || [];
                  const doneCnt = phases.filter((ph: any) => ph.done).length;
                  const total = phases.length;
                  const pct = total > 0 ? Math.round((doneCnt / total) * 100) : 0;
                  const allDone = total > 0 && doneCnt === total;
                  return (
                    <div key={i} className="modern-card clickable-card world-compact-card" onClick={() => openMainQuest(i)}>
                      <div className="world-card-header">
                        <h5 className="world-card-title">{p.title || 'Quest Sem Título'}</h5>
                        <button className="ghost-delete-btn world-card-action" onClick={(e) => { e.stopPropagation(); removeTopic('plots', i); }} title="Excluir">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      {total > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Progresso</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: allDone ? 'var(--success)' : 'var(--text-secondary)' }}>{doneCnt}/{total} fases</span>
                          </div>
                          <div style={{ height: "4px", background: "hsla(0,0%,100%,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: allDone ? 'var(--success)' : 'var(--accent-primary)' }}></div>
                          </div>
                        </div>
                      ) : <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>Nenhuma fase registrada.</p>}
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block", opacity: 0.6 }}>Clique para detalhes</span>
                    </div>
                  );
                }) : <p className="text-muted text-center py-2" style={{ fontSize: "0.8rem" }}>Nenhuma quest registrada.</p>}
              </div>
            </div>

            <div className="world-section">
              <div className="world-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> 
                  Side Quests
                </h4>
                <button className="ghost-add-btn" onClick={() => openSideQuest()}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add
                </button>
              </div>
              <div className="world-cards-grid">
                {bData.sidequests?.length > 0 ? bData.sidequests.map((sq: any, i: number) => {
                  const tests = sq.tests || [];
                  const doneCnt = tests.filter((t: any) => t.done).length;
                  const total = tests.length;
                  const pct = total > 0 ? Math.round((doneCnt / total) * 100) : 0;
                  const allDone = total > 0 && doneCnt === total;
                  return (
                    <div key={i} className="modern-card clickable-card world-compact-card" onClick={() => openSideQuest(i)}>
                      <div className="world-card-header">
                        <h5 className="world-card-title">{sq.title || 'Side Quest Sem Título'}</h5>
                        <button className="ghost-delete-btn world-card-action" onClick={(e) => { e.stopPropagation(); removeTopic('sidequests', i); }} title="Excluir">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      {total > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Testes</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: allDone ? 'var(--success)' : 'var(--text-secondary)' }}>{doneCnt}/{total}</span>
                          </div>
                          <div style={{ height: "4px", background: "hsla(0,0%,100%,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: allDone ? 'var(--success)' : 'var(--warning)' }}></div>
                          </div>
                        </div>
                      )}
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block", opacity: 0.6 }}>Clique para detalhes</span>
                    </div>
                  );
                }) : <p className="text-muted text-center py-2" style={{ fontSize: "0.8rem" }}>Nenhuma side quest registrada.</p>}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );

  const playersBlock = (
    <div className="players-events">
      <h3 className="section-title mb-3">{isGM ? "Os Jogadores" : "Party"}</h3>
      <div className="players-grid scrollable-area">
        {players.length === 0 ? (
          <div className="session-players-empty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: "12px" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>Nenhum jogador cadastrado.</p>
            <span>Acesse a aba <strong>Jogadores</strong> para adicionar personagens.</span>
          </div>
        ) : players.map((player: any) => {
          const pSessionRaw = bData.playerSessions?.[player.id] || {};
          const pSession = {
            acoes: pSessionRaw.acoes || [],
            objetivos: pSessionRaw.objetivos || [],
            concluido: !!pSessionRaw.concluido
          };
          const hpPct = player.hpMax > 0 ? Math.max(0, Math.min(100, ((player.hpCurrent !== undefined ? player.hpCurrent : player.hpMax) / player.hpMax) * 100)) : 0;
          
          let hpColor = "#4ade80"; // Saudável (soft green)
          let hpStatusText = "Saudável";
          let hpBg = "rgba(74, 222, 128, 0.1)";
          let hpBorder = "rgba(74, 222, 128, 0.2)";

          if (hpPct <= 50) {
            hpColor = "#f87171"; // Perigo (soft red)
            hpStatusText = "Perigo";
            hpBg = "rgba(248, 113, 113, 0.12)";
            hpBorder = "rgba(248, 113, 113, 0.25)";
          } else if (hpPct <= 75) {
            hpColor = "#fbbf24"; // Ok (soft orange/amber)
            hpStatusText = "Ok";
            hpBg = "rgba(251, 191, 36, 0.12)";
            hpBorder = "rgba(251, 191, 36, 0.25)";
          }

          const isDone = pSession.concluido;
          const acoesList = pSession.acoes || [];
          const acaoAtiva = acoesList.find((a: any) => typeof a === 'object' && !a.concluida);
          const completedAcoes = acoesList.filter((a: any) => typeof a === 'object' && a.concluida);
          
          let acaoText = '';
          if (acaoAtiva) {
             acaoText = acaoAtiva.type && acaoAtiva.type !== 'Livre / Outro' ? acaoAtiva.type : (acaoAtiva.text || 'Livre');
          }

          const totalTimeSpent = (pSession.acoes || []).reduce((sum: number, a: any) => {
             if (typeof a === 'object') {
               return a.concluida ? sum + (a.timeCost || 0) : sum;
             }
             return sum + 60;
          }, 0);
          const remainingTime = 240 - totalTimeSpent;

          // Calculate Total Sleep for this player in the current day
          let totalSleepMinutes = 0;
          if (dayData && dayData.blocos) {
            dayData.blocos.forEach((b: any) => {
              if (b.playerSessions && b.playerSessions[player.id]) {
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

          return (
            <div key={player.id} className={`spc-card ${isDone ? 'spc-done' : ''} ${player.isDead ? 'spc-dead' : ''}`} onClick={() => {
              if (isGM || session?.playerId === player.id) {
                setActiveData({ blocoIndex: indiceBlocoAtivo, player }); 
                setModals((prev: any) => ({ ...prev, sessionPlayer: true })); 
              } else {
                setActiveData(player);
                setModals((prev: any) => ({ ...prev, summaryCard: true }));
              }
            }} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
              
              {/* HEADER: Identity + HP */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", border: '2px solid rgba(255,255,255,0.1)' }}>
                    {player.image ? (
                      <img src={getAvatarUrl(player.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: player.isDead ? "grayscale(100%)" : "none" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", fontWeight: "bold", fontSize: "1.2rem", color: "var(--text-muted)" }}>{player.name.charAt(0).toUpperCase()}</div>
                    )}
                    {isDone && <div style={{ position: "absolute", bottom: 0, right: 0, background: "#10b981", width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", color: "#fff", fontWeight: "bold", zIndex: 2 }}>✓</div>}
                    {player.isDead && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}><span style={{ fontSize: "1.5rem" }}>💀</span></div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{player.name}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", marginTop: "2px" }}>
                      {player.playerClass || player.classLevel || 'Sem classe'}{player.playerLevel ? ` Nv. ${player.playerLevel}` : ''}
                      <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                      <span style={{ color: hpColor, fontWeight: 700 }}>{hpStatusText}</span>
                    </span>
                  </div>
                </div>
                {/* HP PILL */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: hpBg, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${hpBorder}` }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={hpColor} strokeWidth="2.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: hpColor }}>{player.hpCurrent !== undefined ? player.hpCurrent : player.hpMax || 0} <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, opacity: 0.7 }}>/ {player.hpMax || 0}</span></span>
                </div>
              </div>

              {/* BODY: Current Action */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                {player.isSleepingAction && acaoAtiva ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(99, 102, 241, 0.15)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1rem" }}>💤</span>
                      <span style={{ fontSize: "0.85rem", color: "#818cf8", fontWeight: 700 }}>Dormindo / Descanso</span>
                    </div>
                    {isGM && (
                      <button 
                         onClick={(e) => handleConcluirAcao(e, player.id, acaoAtiva.id, true)} 
                         style={{ fontSize: "0.7rem", padding: "4px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
                      >
                        Acordar
                      </button>
                    )}
                  </div>
                ) : acaoAtiva ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6" }}></div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>{acaoText}</span>
                    </div>
                    {isGM && (
                      <button 
                         onClick={(e) => handleConcluirAcao(e, player.id, acaoAtiva.id, false)} 
                         style={{ fontSize: "0.7rem", padding: "4px 12px", background: "rgba(139, 92, 246, 0.2)", border: "1px solid rgba(139, 92, 246, 0.5)", borderRadius: "6px", color: "#ddd", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.01)", padding: "8px 12px", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {completedAcoes.length > 0 ? "Aguardando próxima ação..." : "Aguardando ação..."}
                    </span>
                  </div>
                )}
              </div>

              {/* FOOTER: Time and Exhaustion */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                {isGM ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: remainingTime < 0 ? "#ef4444" : "var(--text-muted)" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <strong>{Math.floor(Math.abs(remainingTime)/60)}h {Math.abs(remainingTime)%60}m {remainingTime < 0 ? 'excedidos' : 'restantes'}</strong> no bloco
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span style={{ fontSize: "0.95rem" }}>💤</span>
                    <span>Total de Sono Hoje: <strong style={{ color: "var(--text-primary)" }}>{totalSleepHours}h</strong> <span style={{fontSize: "0.75rem"}}>/ {player.minSleepReq || 8}h mín</span></span>
                  </div>
                )}

                {(player.exhaustionLevel || 0) > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.1)", padding: "6px 10px", borderRadius: "6px", borderLeft: "3px solid #ef4444", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.9rem" }}>⚠️</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fca5a5", textTransform: "uppercase" }}>Exaustão {player.exhaustionLevel}</span>
                      <span style={{ fontSize: "0.65rem", color: "#fecaca", lineHeight: 1.1, marginTop: "1px" }}>
                        {player.exhaustionLevel === 1 ? "Desv. em Habilidades" : player.exhaustionLevel === 2 ? "Deslocamento Metade" : player.exhaustionLevel === 3 ? "Desv. em Ataque/Salv." : player.exhaustionLevel === 4 ? "HP Máximo / 2" : player.exhaustionLevel === 5 ? "Deslocamento 0" : "Morte"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );

  const personalNotesBlock = (
    <div className="world-events">
      <h3 className="section-title mb-3">Anotações Pessoais</h3>
      <div className="scrollable-area" style={{ paddingRight: "0.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div className="world-section">
          <div className="world-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "4px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> 
              Minhas Anotações
            </h4>
            <button className="ghost-add-btn" onClick={() => openPersonalNote()}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add
            </button>
          </div>
          <div className="world-cards-grid">
            {(session?.id && bData.playerSessions?.[session.id]?.notes?.length > 0) ? bData.playerSessions[session.id].notes.map((n: any, i: number) => (
              <div key={i} className="modern-card clickable-card world-compact-card" onClick={() => openPersonalNote(i)}>
                <div className="world-card-header">
                  <h5 className="world-card-title">{n.title || 'Sem Título'}</h5>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--border-subtle)" }}>
                  {n.desc ? (n.desc.length > 60 ? n.desc.substring(0, 60) + '…' : n.desc) : 'Sem conteúdo.'}
                </p>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block", opacity: 0.6 }}>Clique para editar</span>
              </div>
            )) : <p className="text-muted text-center py-2" style={{ fontSize: "0.8rem" }}>Nenhuma anotação registrada para este momento.</p>}
          </div>
        </div>

        {/* Resumo de Diário de Bordo e Mural */}
        <div className="world-section mt-2">
          <div className="world-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "4px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              Crônicas (Resumo)
            </h4>
          </div>
          <div className="world-cards-grid">
            <div className="modern-card world-compact-card clickable-card" onClick={() => {
              router.push('/cronicas#diario');
            }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1 }}>
                <h5 className="world-card-title" style={{color: "var(--accent-primary)"}}>Diário de Bordo</h5>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0" }}>Registros históricos da campanha e o desenvolvimento da narrativa no mundo.</p>
              </div>
              <div style={{marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--border-subtle)"}}>
                <span style={{fontSize: "0.75rem", color: "var(--text-secondary)"}}>Dia Atual: {diaAtual}</span>
              </div>
            </div>
            
            <div className="modern-card world-compact-card clickable-card" onClick={() => {
              router.push('/cronicas#mural');
            }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1 }}>
                <h5 className="world-card-title" style={{color: "var(--accent-secondary)"}}>Mural de Investigação</h5>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0" }}>Evidências, pistas e conexões que a equipe descobriu durante a jornada.</p>
              </div>
              <div style={{marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed transparent"}}>
                <span style={{fontSize: "0.75rem", color: "transparent", userSelect: "none"}}>Espaçador</span>
              </div>
            </div>

            <div className="modern-card world-compact-card" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {{ clear: "☀️", fog: "🌫️", rain: "🌧️", storm: "⚡", snow: "❄️", blizzard: "🌨️", ember: "🔥", sandstorm: "🏜️", eclipse: "🌑", arcane: "🔮" }[bData?.weatherEffect as string || "clear"] || "☀️"}
              </div>
              <h5 className="world-card-title" style={{color: "var(--text-primary)", fontSize: "1rem", margin: 0}}>
                {{ clear: "Céu Limpo", fog: "Névoa", rain: "Chuva", storm: "Tempestade", snow: "Neve", blizzard: "Nevasca", ember: "Cinzas", sandstorm: "Temp. Areia", eclipse: "Eclipse", arcane: "Neblina Arcana" }[bData?.weatherEffect as string || "clear"] || "Céu Limpo"}
              </h5>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800 }}>Clima Atual</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="dash-active-block-container">
      <div className="block-hero glass-panel">
        <div className="block-hero-left">
          <span className="active-badge">MOMENTO ATUAL</span>
          <h2 className="block-title">{bloco?.nome}</h2>
          <span className="block-time">{bloco?.horario}</span>
        </div>
        <CelestialIcon blocoId={bloco?.id || 1} />
        <div className="block-hero-right">
          <p className="block-anchor">"{bloco?.ancora}"</p>
        </div>
      </div>
      
      <div className="block-two-cols mt-4">
        {isGM ? (
          <>
            {worldBlock}
            {playersBlock}
          </>
        ) : (
          <>
            {personalNotesBlock}
            {playersBlock}
          </>
        )}
      </div>
    </div>
  );
}
