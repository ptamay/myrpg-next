"use client";
import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { MuralCard as MuralCardType } from "@/types/cronicas";
import { useAppContext } from "@/contexts/AppContext";

interface MuralCardProps {
  card: MuralCardType;
  zoom: number;
  pan: { x: number; y: number };
  isConnecting: boolean;
  canEdit: boolean;
  onCardClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MuralCard({ card, zoom, pan, isConnecting, canEdit, onCardClick, onEdit, onDelete }: MuralCardProps) {
  const { dadosGlobais, setActiveData, setModals } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !canEdit,
  });

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'nota': return 'var(--text-muted)';
      case 'npc': return 'var(--warning)';
      case 'jogador': return 'var(--accent-primary)';
      case 'artefato': return 'hsl(300, 60%, 60%)';
      case 'teoria': return 'var(--danger)';
      case 'retrato': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  const npc = card.type === 'npc' && card.refId ? dadosGlobais.npcs.find((n: any) => n.id === card.refId) : null;
  const player = card.type === 'jogador' && card.refId ? dadosGlobais.players.find((p: any) => p.id === card.refId) : null;

  // Calcula a posição atualizada com o transform do drag ativo
  const x = card.position.x * zoom + pan.x + (transform?.x || 0);
  const y = card.position.y * zoom + pan.y + (transform?.y || 0);

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
        transformOrigin: '0 0',
        zIndex: isDragging ? 1000 : 1,
        touchAction: 'none',
      }}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        // Allow the dnd-kit pointer down listener to work, but if we don't drag and just click, we trigger click
        listeners?.onPointerDown?.(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onCardClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="glass-panel"
        style={{
          minWidth: 160,
          maxWidth: 200,
          borderLeft: `4px solid ${getBorderColor(card.type)}`,
          padding: "0.75rem",
          cursor: canEdit ? "grab" : "default",
          boxShadow: isConnecting ? "0 0 0 2px var(--accent-primary)" : "none",
          animation: isConnecting ? "dayPulse 1.5s infinite" : "none",
          opacity: isDragging ? 0.8 : 1,
        }}
      >
        <div className="narrative-label" style={{ marginBottom: 4 }}>
          {card.type.toUpperCase()}
        </div>
        <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
          {card.title}
        </div>
        
        {(card.imageUrl || (npc && npc.image) || (player && player.image)) && (
          <div style={{ marginBottom: "8px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <img src={card.imageUrl || npc?.image || player?.image} alt={card.title} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}

        {card.content && (
          <div className="narrative-text" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {card.content}
          </div>
        )}

        {(npc || player) && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button 
              className="ghost-delete-btn" 
              style={{ fontSize: "0.75rem", padding: "4px 8px", opacity: 1, color: "var(--accent-primary)", background: "rgba(204, 51, 255, 0.1)", borderRadius: "4px" }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveData(npc || player);
                setModals((prev: any) => ({ ...prev, summaryCard: true }));
              }}
            >
              Ver Ficha
            </button>
          </div>
        )}

        {isHovered && canEdit && (
          <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 4, background: "var(--bg-card)", borderRadius: "4px", padding: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            <button className="ghost-delete-btn" style={{ opacity: 1, padding: "4px" }} onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>✏️</button>
            <button className="ghost-delete-btn" style={{ opacity: 1, padding: "4px", color: "var(--danger)" }} onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>🗑️</button>
          </div>
        )}
      </div>
    </div>
  );
}
