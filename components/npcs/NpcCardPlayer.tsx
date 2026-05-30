"use client";
import React from "react";
import { useAppContext } from "@/contexts/AppContext";

interface NpcCardPlayerProps {
  npc: any;
}

export default function NpcCardPlayer({ npc }: NpcCardPlayerProps) {
  const { setModals, setActiveData } = useAppContext();

  const openDetail = () => {
    setActiveData(npc);
    setModals((prev: any) => ({ ...prev, summaryCard: true }));
  };

  const factionBorder = npc.faction === 'enemy' ? 'border-danger' : npc.faction === 'ally' ? 'border-success' : 'border-neutral';

  return (
    <div className={`npc-card glass-panel clickable-card ${npc.isDead ? "is-dead" : ""} ${factionBorder}`} onClick={openDetail}>
      {npc.isDead && <div className="status-dead-overlay">💀</div>}
      
      <div className="npc-card-header">
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

      <div className="npc-card-narrative-details">
        {npc.mot && (
          <div className="narrative-block">
            <span className="narrative-label">Motivações</span>
            <p className="narrative-text">{npc.mot}</p>
          </div>
        )}
        {npc.itemsVis && (
          <div className="narrative-block">
            <span className="narrative-label">Itens Visíveis</span>
            <p className="narrative-text">{npc.itemsVis}</p>
          </div>
        )}
        {npc.traits && (
          <div className="narrative-block">
            <span className="narrative-label">Traços</span>
            <p className="narrative-text">{npc.traits}</p>
          </div>
        )}
      </div>
    </div>
  );
}
