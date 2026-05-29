"use client";
import React from "react";

interface NpcCardPlayerProps {
  npc: any;
}

export default function NpcCardPlayer({ npc }: NpcCardPlayerProps) {
  return (
    <div className="npc-card glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {npc.image ? (
          <img 
            src={npc.image} 
            alt={npc.name} 
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-bright)" }} 
          />
        ) : (
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold" }}>
            {npc.name.charAt(0)}
          </div>
        )}
        
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            {npc.name}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            {npc.title} {npc.title && npc.faction ? '·' : ''} {npc.faction}
          </p>
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--border-subtle)", margin: "0.5rem 0" }} />

      {/* DETALHES PÚBLICOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {npc.mot && (
          <div>
            <span className="narrative-label">◆ MOTIVAÇÕES</span>
            <div className="narrative-text">{npc.mot}</div>
          </div>
        )}

        {npc.itemsVis && (
          <div>
            <span className="narrative-label">◆ INTENÇÕES VISÍVEIS</span>
            <div className="narrative-text">{npc.itemsVis}</div>
          </div>
        )}

        {npc.traits && (
          <div>
            <span className="narrative-label">◆ TRAÇOS</span>
            <div className="narrative-text">{npc.traits}</div>
          </div>
        )}
      </div>

    </div>
  );
}
