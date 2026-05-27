"use client";

import React from "react";
import { useAppContext } from "@/contexts/AppContext";

interface NpcCardProps {
  npc: any;
  combatMode: boolean;
  hideEffects: boolean;
}

export default function NpcCard({ npc, combatMode, hideEffects }: NpcCardProps) {
  const { dadosGlobais, setDadosGlobais, setModals, setActiveData, salvarEstadoLocal } = useAppContext();

  const handleUpdate = (updates: any) => {
    const newNpcs = dadosGlobais.npcs.map((n: any) => n.id === npc.id ? { ...n, ...updates } : n);
    setDadosGlobais({ ...dadosGlobais, npcs: newNpcs });
    setTimeout(salvarEstadoLocal, 100);
  };

  const getMod = (val: number | string) => {
    const m = Math.floor((parseInt((val || 10).toString()) - 10) / 2);
    return m >= 0 ? `+${m}` : m;
  };

  const toggleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdate({ isHidden: !npc.isHidden });
  };

  const openDetail = () => {
    setActiveData(npc);
    setModals((prev: any) => ({ ...prev, npcDetail: true }));
  };

  const handleHpMod = (e: React.MouseEvent, mod: number) => {
    e.stopPropagation();
    let current = npc.hpCurrent || 0;
    let temp = npc.tempHp || 0;
    
    if (mod > 0) {
      if (current >= npc.hpMax) temp += 1;
      else current = Math.min(npc.hpMax, current + 1);
    } else {
      if (temp > 0) temp -= 1;
      else current = Math.max(0, current - 1);
    }
    
    handleUpdate({ 
      hpCurrent: current, 
      tempHp: temp,
      isDead: current <= 0 && temp <= 0
    });
  };

  const toggleCondition = (e: React.MouseEvent, cond: string) => {
    e.stopPropagation();
    const tempCond = npc.tempCond || [];
    const newCond = tempCond.includes(cond) ? tempCond.filter((c: string) => c !== cond) : [...tempCond, cond];
    handleUpdate({ tempCond: newCond });
  };

  const toggleRes = (e: React.MouseEvent, res: string) => {
    e.stopPropagation();
    const tempRes = npc.tempRes || [];
    const newRes = tempRes.includes(res) ? tempRes.filter((r: string) => r !== res) : [...tempRes, res];
    handleUpdate({ tempRes: newRes });
  };

  const handleSpellSlotClick = (e: React.MouseEvent, level: number, idx: number) => {
    e.stopPropagation();
    const used = npc.spellSlotsUsed || {};
    const currentUsed = used[level] || 0;
    
    const newUsed = idx >= currentUsed ? idx + 1 : idx;
    handleUpdate({ spellSlotsUsed: { ...used, [level]: newUsed } });
  };

  const hpPct = npc.hpMax > 0 ? Math.max(0, Math.min(100, ((npc.hpCurrent || 0) / npc.hpMax) * 100)) : 0;
  let hpColorClass = "";
  if (hpPct <= 25) hpColorClass = "danger";
  else if (hpPct <= 50) hpColorClass = "warning";

  const tempHpPct = npc.tempHp && npc.hpMax > 0 ? Math.min(100, (npc.tempHp / npc.hpMax) * 100) : 0;

  const factionBorder = npc.faction === 'enemy' ? 'border-danger' : npc.faction === 'ally' ? 'border-success' : 'border-neutral';

  const CONDITIONS = ["Cego", "Enfeitiçado", "Surdo", "Amedrontado", "Agarrado", "Incapacitado", "Invisível", "Paralisado", "Petrificado", "Envenenado", "Caído", "Restringido", "Atordoado", "Inconsciente"];
  const RESISTANCES = ["Ácido", "Frio", "Fogo", "Força", "Elétrico", "Necrótico", "Veneno", "Psíquico", "Radiante", "Trovão"];

  return (
    <div className={`npc-card glass-panel ${combatMode ? "combat-expanded" : ""} ${npc.isDead ? "is-dead" : ""} ${factionBorder}`} style={npc.isHidden ? { opacity: 0.5 } : {}}>
      {npc.isDead && <div className="status-dead-overlay">💀</div>}
      
      <button className="btn-quick-hide" title={npc.isHidden ? 'Mostrar NPC' : 'Ocultar NPC'} onClick={toggleHide}>
        {npc.isHidden ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7-10.5-7-10.5-7z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        )}
      </button>

      <div className="npc-card-header" onClick={openDetail}>
        {npc.image ? (
          <img src={npc.image} className="npc-card-avatar" alt={npc.name} />
        ) : (
          <div className="npc-card-placeholder">{npc.name.charAt(0).toUpperCase()}</div>
        )}
        <div className="npc-card-title-area">
          <div className="npc-card-name">{npc.name}</div>
          <div className="npc-card-title">{npc.title || 'Sem título'}</div>
          <div className="npc-card-meta">
            <span>{npc.race || '---'}</span>
            <span>•</span>
            <span>ND {npc.cr || '0'}</span>
          </div>
          <div className="npc-card-active-conditions">
            {npc.tempCond?.map((c: string, i: number) => <span key={i} className="active-cond-badge">{c}</span>)}
            {npc.tempRes?.map((r: string, i: number) => <span key={i} className="active-res-badge">{r}</span>)}
          </div>
        </div>
      </div>

      {!combatMode && (
        <div className="npc-card-narrative-details">
          <div className="narrative-block">
            <span className="narrative-label">Motivações</span>
            <p className="narrative-text">{npc.mot || 'Não definidas'}</p>
          </div>
          <div className="narrative-block">
            <span className="narrative-label">Segredos / Fraquezas</span>
            <p className="narrative-text">{npc.sec || 'Não definidos'}</p>
          </div>
          <div className="narrative-block">
            <span className="narrative-label">Traços</span>
            <p className="narrative-text">{npc.traits || 'Não definidos'}</p>
          </div>
        </div>
      )}

      {combatMode && (
        <div className="npc-card-combat-details">
          <div className="npc-card-attrs">
            <div className="attr-m"><span className="attr-lbl">FOR</span><span className="attr-mod">{getMod(npc.str)}</span><span className="attr-val">{npc.str || 10}</span></div>
            <div className="attr-m"><span className="attr-lbl">DES</span><span className="attr-mod">{getMod(npc.dex)}</span><span className="attr-val">{npc.dex || 10}</span></div>
            <div className="attr-m"><span className="attr-lbl">CON</span><span className="attr-mod">{getMod(npc.con)}</span><span className="attr-val">{npc.con || 10}</span></div>
            <div className="attr-m"><span className="attr-lbl">INT</span><span className="attr-mod">{getMod(npc.int)}</span><span className="attr-val">{npc.int || 10}</span></div>
            <div className="attr-m"><span className="attr-lbl">SAB</span><span className="attr-mod">{getMod(npc.wis)}</span><span className="attr-val">{npc.wis || 10}</span></div>
            <div className="attr-m"><span className="attr-lbl">CAR</span><span className="attr-mod">{getMod(npc.cha)}</span><span className="attr-val">{npc.cha || 10}</span></div>
          </div>

          <div className="npc-card-stats" onClick={openDetail}>
            <div className="stat-mini" title="Classe de Armadura">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span className="base-val">{npc.ac || '--'}</span>
              {npc.tempAc ? <span className="temp-bonus">+{npc.tempAc}</span> : null}
            </div>
            <div className="stat-mini" title="Iniciativa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
              {npc.init || '--'}
            </div>
            <div className="stat-mini" title="Deslocamento">💨 {npc.speed || '--'}</div>
            <div className="stat-mini" title="Percepção Passiva">👁️ {npc.perc || '--'}</div>
          </div>

          {(npc.res || npc.imm) && (
            <div className="npc-card-res-area" onClick={openDetail}>
              {npc.res && <div className="npc-card-res"><strong>RES:</strong> {npc.res}</div>}
              {npc.imm && <div className="npc-card-res"><strong>IMU:</strong> {npc.imm}</div>}
            </div>
          )}

          {!hideEffects && (
            <div className="npc-card-combat-console">
              <div className="console-section">
                <div className="mod-section-label">CONDIÇÕES</div>
                <div className="conditions-grid">
                  {CONDITIONS.map(c => (
                    <div 
                      key={c} 
                      className={`condition-tag ${(npc.tempCond || []).includes(c) ? 'active' : ''}`}
                      onClick={(e) => toggleCondition(e, c)}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <div className="console-section">
                <div className="mod-section-label">RESISTÊNCIAS TEMP.</div>
                <div className="conditions-grid">
                  {RESISTANCES.map(r => (
                    <div 
                      key={r} 
                      className={`condition-tag ${(npc.tempRes || []).includes(r) ? 'res-active' : ''}`}
                      onClick={(e) => toggleRes(e, r)}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {npc.hasSpells && npc.spellSlots && (
            <div className="npc-card-spells">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                const total = npc.spellSlots[level] || 0;
                if (total <= 0) return null;
                const usedCount = (npc.spellSlotsUsed && npc.spellSlotsUsed[level]) || 0;
                
                return (
                  <div key={level} className="spell-slot-group">
                    <span className="slot-label">{level}º</span>
                    <div className="slot-dots">
                      {Array.from({ length: total }).map((_, d) => (
                        <div 
                          key={d} 
                          className={`slot-dot ${d >= usedCount ? 'available' : ''}`}
                          onClick={(e) => handleSpellSlotClick(e, level, d)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="npc-card-hp-area">
            <div className="hp-header">
              <span>PONTOS DE VIDA</span>
              <div className="hp-inputs">
                <button className="hp-mod-btn" onClick={(e) => handleHpMod(e, -1)}>-</button>
                <div className="hp-values-group">
                  <span className="hp-total-display" title="HP Atual + Temp">{(npc.hpCurrent || 0) + (npc.tempHp || 0)}</span>
                  <span className="hp-max-val">/ {npc.hpMax}</span>
                  <div className="temp-hp-typing">
                    <span className="temp-label">TEMP:</span>
                    <input 
                      type="number" 
                      className="hp-input temp-hp-input" 
                      value={npc.tempHp || 0} 
                      onClick={e => e.stopPropagation()}
                      onChange={e => handleUpdate({ tempHp: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                </div>
                <button className="hp-mod-btn" onClick={(e) => handleHpMod(e, 1)}>+</button>
              </div>
            </div>
            <div className="hp-bar-bg">
              <div className={`hp-bar-fill ${hpColorClass}`} style={{ width: `${hpPct}%` }}></div>
              {npc.tempHp > 0 && <div className="hp-bar-temp" style={{ width: `${tempHpPct}%` }}></div>}
            </div>
          </div>
          
          <div className="npc-card-atk-container" onClick={openDetail}>
            <div className="atk-header">⚔️ ATAQUE PRINCIPAL</div>
            <div className="npc-card-atk-item highlight-atk">{npc.mainAttack || 'Nenhum ataque cadastrado.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
