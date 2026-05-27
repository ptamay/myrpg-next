"use client";

import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { blocosDeTempo } from "@/lib/gameData";
import CelestialIcon from "../ui/CelestialIcon";

export default function DashboardBlock() {
  const { diaAtual, indiceBlocoAtivo, jornadaPorDia, setJornadaPorDia, dadosGlobais, setModals, setActiveData, salvarEstadoLocal } = useAppContext();

  const dayData = jornadaPorDia[diaAtual];
  if (!dayData || !dayData.blocos) return null;

  const bData = dayData.blocos[indiceBlocoAtivo];
  const bloco = blocosDeTempo[indiceBlocoAtivo];
  const players = dadosGlobais.players || [];

  const updateWeather = (weather: string) => {
    const newJornada = JSON.parse(JSON.stringify(jornadaPorDia));
    newJornada[diaAtual].blocos[indiceBlocoAtivo].weatherEffect = weather;
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
    } else {
      setActiveData({ blocoIndex: indiceBlocoAtivo, type: "timeline", data: { title: '', desc: '', trigger: '', save: '', damage: '' } });
    }
    setModals((prev: any) => ({ ...prev, globalEvent: true }));
  };

  const openMainQuest = (index?: number) => {
    if (index !== undefined) {
      setActiveData({ blocoIndex: indiceBlocoAtivo, topicIndex: index, type: "plots", data: bData.plots[index] });
    } else {
      setActiveData({ blocoIndex: indiceBlocoAtivo, type: "plots", data: { title: '', day: diaAtual, phases: [], notes: '' } });
    }
    setModals((prev: any) => ({ ...prev, mainQuest: true }));
  };

  const openSideQuest = (index?: number) => {
    if (index !== undefined) {
      setActiveData({ blocoIndex: indiceBlocoAtivo, topicIndex: index, type: "sidequests", data: bData.sidequests[index] });
    } else {
      setActiveData({ blocoIndex: indiceBlocoAtivo, type: "sidequests", data: { title: '', day: diaAtual, npc: '', desc: '', tests: [] } });
    }
    setModals((prev: any) => ({ ...prev, sideQuest: true }));
  };

  const openPlayerManage = (player: any) => {
    setActiveData({ blocoIndex: indiceBlocoAtivo, player });
    setModals((prev: any) => ({ ...prev, playerManage: true }));
  };

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
              <select className="journey-input modern-input w-full" value={bData.weatherEffect || "clear"} onChange={(e) => updateWeather(e.target.value)}>
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
                <button className="ghost-add-btn" onClick={() => openGlobalEvent()}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add
                </button>
              </div>
              <div className="world-cards-grid">
                {bData.timeline?.length > 0 ? bData.timeline.map((t: any, i: number) => (
                  <div key={i} className="modern-card clickable-card world-compact-card" onClick={() => openGlobalEvent(i)}>
                    <div className="world-card-header">
                      <h5 className="world-card-title">{t.title || 'Evento Sem Título'}</h5>
                      <button className="ghost-delete-btn world-card-action" onClick={(e) => { e.stopPropagation(); removeTopic('timeline', i); }} title="Excluir">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                    {t.save || t.damage ? (
                      <div className="world-card-mechanics">
                        {t.save && <span className="mechanic-badge save-badge">{t.save}</span>}
                        {t.damage && <span className="mechanic-badge damage-badge">{t.damage}</span>}
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                        {t.desc ? (t.desc.length > 60 ? t.desc.substring(0, 60) + '…' : t.desc) : 'Sem descrição.'}
                      </p>
                    )}
                  </div>
                )) : <p className="text-muted text-center py-2" style={{ fontSize: "0.8rem" }}>Nenhum evento registrado.</p>}
              </div>
            </div>

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
                    </div>
                  );
                }) : <p className="text-muted text-center py-2" style={{ fontSize: "0.8rem" }}>Nenhuma side quest registrada.</p>}
              </div>
            </div>

          </div>
        </div>

        <div className="players-events">
          <h3 className="section-title mb-3">Os Jogadores</h3>
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
              const pSession = bData.playerSessions?.[player.id] || { acoes: [], objetivos: [], concluido: false };
              const hpPct = player.hpMax > 0 ? Math.max(0, Math.min(100, ((player.hpCurrent || player.hpMax) / player.hpMax) * 100)) : 0;
              let hpColorClass = hpPct <= 25 ? 'danger' : hpPct <= 50 ? 'warning' : '';
              const isDone = pSession.concluido;
              const firstAcao = pSession.acoes[0];
              const acaoText = firstAcao ? (typeof firstAcao === 'object' ? firstAcao.text : firstAcao) : '';

              return (
                <div key={player.id} className={`spc-card ${isDone ? 'spc-done' : ''} ${player.isDead ? 'spc-dead' : ''}`} onClick={() => openPlayerManage(player)}>
                  <div className="spc-header">
                    <div className="spc-avatar-wrap">
                      {player.image ? (
                        <img src={player.image} className="spc-avatar-img" alt="" />
                      ) : (
                        <div className="spc-avatar-placeholder">{player.name.charAt(0).toUpperCase()}</div>
                      )}
                      {isDone && <span className="spc-done-badge">✓</span>}
                    </div>
                    <div className="spc-info">
                      <span className="spc-name">{player.name}</span>
                      <span className="spc-class">{player.classLevel || 'Sem classe'}</span>
                    </div>
                  </div>
                  <div className="spc-hp-row">
                    <div className="spc-hp-bar-bg">
                      <div className={`spc-hp-bar-fill ${hpColorClass}`} style={{ width: `${hpPct}%` }}></div>
                    </div>
                    <span className="spc-hp-text">{player.hpCurrent || player.hpMax || 0}/{player.hpMax || 0}</span>
                  </div>
                  <div className="spc-action-preview">
                    {acaoText ? (
                      <span className="spc-action-text">{acaoText}{pSession.acoes.length > 1 ? '…' : ''}</span>
                    ) : (
                      <span className="spc-no-action">Sem ações registradas</span>
                    )}
                    {pSession.objetivos.length > 0 && <span className="spc-obj-badge">{pSession.objetivos.length}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
