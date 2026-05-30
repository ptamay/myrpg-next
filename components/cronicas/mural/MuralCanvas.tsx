"use client";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useMurais } from "@/hooks/useGameData";
import { useUserSession } from "@/contexts/UserSessionContext";
import { useAppContext } from "@/contexts/AppContext";
import { useSystemDialog } from "@/contexts/SystemDialogContext";
import { Mural } from "@/types/cronicas";
import MuralCard from "./MuralCard";
import MuralConnectionLayer from "./MuralConnectionLayer";
import MuralToolbar from "./MuralToolbar";
import MuralCardForm from "./MuralCardForm";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";

export default function MuralCanvas() {
  const { murais, loading, save } = useMurais();
  const { isGM, session } = useUserSession();
  const { dadosGlobais } = useAppContext();
  const { showAlert, showConfirm } = useSystemDialog();

  const canEdit = isGM || !!session?.playerId;

  const [activeMuralId, setActiveMuralId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("mural-active-id");
      if (saved) return saved;
    }
    return murais[0]?.id ?? null;
  });

  const [zoom, setZoom] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("mural-zoom");
      if (saved) return parseFloat(saved);
    }
    return 1;
  });

  const [pan, setPan] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("mural-pan");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return { x: 0, y: 0 };
  });

  // Persiste no sessionStorage
  useEffect(() => {
    if (activeMuralId) sessionStorage.setItem("mural-active-id", activeMuralId);
  }, [activeMuralId]);

  useEffect(() => {
    sessionStorage.setItem("mural-zoom", zoom.toString());
  }, [zoom]);

  useEffect(() => {
    sessionStorage.setItem("mural-pan", JSON.stringify(pan));
  }, [pan]);

  // Se carregar murais e ainda não tivermos um ID ativo, seleciona o primeiro
  useEffect(() => {
    if (!activeMuralId && murais.length > 0) {
      setActiveMuralId(murais[0].id);
    }
  }, [activeMuralId, murais]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  // Estado otimista de posições: atualizado instantaneamente no drag, sem aguardar o save
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});
  
  const muralRef = useRef<HTMLDivElement>(null);

  const mural = murais.find(m => m.id === activeMuralId) ?? null;

  // Sincroniza localPositions quando o mural muda externamente (carregamento inicial)
  useEffect(() => {
    if (!mural) return;
    setLocalPositions(prev => {
      const next: Record<string, { x: number; y: number }> = {};
      for (const card of mural.cards) {
        // Mantém posição local se já existir (resultado de drag recente)
        next[card.id] = prev[card.id] ?? card.position;
      }
      return next;
    });
  }, [mural?.id]); // Só re-sincroniza ao trocar de mural

  // Filtragem de cards e conexões para jogadores (ocultando NPCs com isHidden === true)
  // Aplica posições locais (otimistas) aos cards para renderização imediata
  const cardsWithLocalPositions = useMemo(() => {
    if (!mural) return [];
    return mural.cards.map(card => ({
      ...card,
      position: localPositions[card.id] ?? card.position,
    }));
  }, [mural, localPositions]);

  const visibleCards = useMemo(() => {
    if (!mural) return [];
    if (isGM) return cardsWithLocalPositions;

    return cardsWithLocalPositions.filter(card => {
      if (card.type === 'npc' && card.refId) {
        const npc = dadosGlobais.npcs.find((n: any) => n.id === card.refId);
        if (npc && npc.isHidden) {
          return false;
        }
      }
      return true;
    });
  }, [mural, cardsWithLocalPositions, isGM, dadosGlobais.npcs]);

  const visibleConnections = useMemo(() => {
    if (!mural) return [];
    if (isGM) return mural.connections;

    const visibleCardIds = new Set(visibleCards.map(c => c.id));
    return mural.connections.filter(conn =>
      visibleCardIds.has(conn.fromCardId) && visibleCardIds.has(conn.toCardId)
    );
  }, [mural, isGM, visibleCards]);

  // Debounce para salvar posições (drag é frequente)
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback((updated: Mural) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(updated), 1000);
  }, [save]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!mural || !canEdit) return;
    const { active, delta } = event;
    if (delta.x === 0 && delta.y === 0) return;

    const cardId = active.id as string;
    const currentPos = localPositions[cardId] ?? mural.cards.find(c => c.id === cardId)?.position ?? { x: 0, y: 0 };
    const newPos = {
      x: currentPos.x + delta.x / zoom,
      y: currentPos.y + delta.y / zoom,
    };

    // Atualiza posição localmente de forma instantânea (sem esperar o save)
    setLocalPositions(prev => ({ ...prev, [cardId]: newPos }));

    // Salva em background com debounce
    const updated: Mural = {
      ...mural,
      cards: mural.cards.map(c =>
        c.id === cardId
          ? { ...c, position: newPos }
          : c
      ),
    };
    debouncedSave(updated);
  };

  const handleExportImage = async () => {
    if (!muralRef.current || !mural) return;
    try {
      const exportBgColor = mural.backgroundStyle === 'wood' 
        ? '#2d1a10' 
        : (mural.backgroundStyle === 'dark-paper' ? '#1a1a1a' : '#09090b');
      const dataUrl = await toPng(muralRef.current, { 
        cacheBust: true, 
        backgroundColor: exportBgColor, 
        skipFonts: true, 
        fontEmbedCSS: '' 
      });
      const link = document.createElement('a');
      link.download = `mural-${mural.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      await showAlert({ title: "Erro na Exportação", message: "Erro ao exportar a imagem.", type: "danger" });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const newZoom = Math.min(Math.max(zoom - e.deltaY * 0.01, 0.4), 2);
      setZoom(newZoom);
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.ctrlKey && e.target === e.currentTarget) {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // PointerSensor configuration is necessary for dnd-kit to distinguish between click/drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (loading) {
    return (
      <div style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem'}}>
        <div className="spinner" style={{width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        <p style={{color: 'var(--text-secondary)'}}>Carregando investigações...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!mural && !activeMuralId) {
    return (
      <div className="empty-state" style={{ height: "100%", margin: "1.5rem" }}>
        <p>Nenhuma investigação encontrada.</p>
        {(isGM || dadosGlobais.players?.length > 0) && (
          <button className="btn primary-btn" onClick={() => {
            const novo: Mural = {
              id: "slot-1",
              name: "Investigação 1",
              cards: [], connections: [],
              createdAt: new Date().toISOString(),
            };
            save(novo);
            setActiveMuralId(novo.id);
          }}>
            + Iniciar Investigação
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mural-wrapper">
      {/* Toolbar lateral */}
      {canEdit && (
        <MuralToolbar
          onAddCard={() => setShowCardForm(true)}
          zoom={zoom}
          onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2))}
          onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.4))}
          connectingMode={!!connectingFrom}
          onToggleConnect={() => setConnectingFrom(c => c !== null ? null : "")}
          onExportImage={handleExportImage}
          currentBackground={mural?.backgroundStyle || 'grid'}
          onChangeBackground={(bg) => {
            if (mural) {
              const updated = { ...mural, backgroundStyle: bg as any };
              save(updated);
            }
          }}
        />
      )}

      {/* Barra de Slots de Investigação (Save States) */}
      <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem", zIndex: 100, background: "var(--bg-card)", padding: "0.5rem 1rem", borderRadius: "100px", border: "1px solid var(--border-subtle)", backdropFilter: "blur(10px)" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", marginRight: "0.5rem", fontWeight: "bold" }}>INVESTIGAÇÕES:</span>
        {[1, 2, 3, 4, 5, 6].map(slot => {
          const slotId = `slot-${slot}`;
          const isSaved = murais.some(m => m.id === slotId);
          const isActive = activeMuralId === slotId;
          
          return (
            <button
              key={slot}
              className={`btn small-btn ${isActive ? 'primary-btn' : (isSaved ? 'secondary-btn' : 'nav-btn')}`}
              style={{ width: "36px", height: "36px", padding: 0, borderRadius: "50%" }}
              onClick={async () => {
                if (isSaved) {
                  setActiveMuralId(slotId);
                } else {
                  // Cria um mural novo e vazio no slot
                  const newMural: Mural = {
                    id: slotId,
                    name: `Investigação ${slot}`,
                    cards: [], 
                    connections: [],
                    createdAt: new Date().toISOString(),
                    backgroundStyle: 'grid'
                  };
                  save(newMural);
                  setActiveMuralId(slotId);
                }
              }}
              onContextMenu={async (e) => {
                e.preventDefault();
                if (!mural) return;
                if (await showConfirm({ title: "Sobrescrever Slot", message: `Deseja clonar a investigação atual para o slot ${slot}? (O slot atual permanecerá intacto)`, type: "warning" })) {
                  const idMap = new Map<string, string>();
                  const newCards = mural.cards.map(c => {
                    const newId = crypto.randomUUID();
                    idMap.set(c.id, newId);
                    return { ...c, id: newId, muralId: slotId };
                  });
                  const newConns = mural.connections.map(c => ({
                    ...c,
                    id: crypto.randomUUID(),
                    muralId: slotId,
                    fromCardId: idMap.get(c.fromCardId) || c.fromCardId,
                    toCardId: idMap.get(c.toCardId) || c.toCardId
                  }));
                  
                  const newMural = { ...mural, id: slotId, name: `Investigação ${slot}`, cards: newCards, connections: newConns };
                  save(newMural);
                  setActiveMuralId(slotId);
                }
              }}
              title={isActive ? `Slot ${slot} Ativo` : (isSaved ? `Carregar Investigação ${slot} (Botão direito para Sobrescrever com o atual)` : `Slot Vazio (Clique para salvar)`)}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <div
          ref={muralRef}
          className="mural-canvas"
          style={{
            backgroundColor: mural?.backgroundStyle === 'wood'
              ? '#2d1a10'
              : (mural?.backgroundStyle === 'dark-paper' ? '#1a1a1a' : '#09090b'),
            backgroundImage: mural?.backgroundStyle === 'wood'
              ? `repeating-linear-gradient(90deg, rgba(15, 8, 4, 0.5) 0px, rgba(15, 8, 4, 0.5) 4px, transparent 4px, transparent ${150 * zoom}px),
                 linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(0, 0, 0, 0.4) 100%)`
              : (mural?.backgroundStyle === 'dark-paper'
                ? `radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px), repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.2) 0, rgba(0, 0, 0, 0.2) 2px, transparent 2px, transparent 8px)`
                : `radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)`),
            backgroundSize: mural?.backgroundStyle === 'grid' || !mural?.backgroundStyle
              ? `${20 * zoom}px ${20 * zoom}px`
              : 'auto',
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            cursor: connectingFrom ? "crosshair" : (isPanning ? "grabbing" : "grab"),
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => { if (connectingFrom === "") setConnectingFrom(null); }}
        >
          {/* SVG de linhas (abaixo dos cards) */}
          <MuralConnectionLayer
            cards={visibleCards}
            connections={visibleConnections}
            zoom={zoom}
            pan={pan}
            canEdit={canEdit}
            onDeleteConnection={(id) => {
              if (!mural) return;
              const updated = { ...mural, connections: mural.connections.filter(c => c.id !== id) };
              save(updated);
            }}
            onUpdateConnectionLabel={(id, label) => {
              if (!mural) return;
              const updated = { ...mural, connections: mural.connections.map(c => c.id === id ? { ...c, label } : c) };
              save(updated);
            }}
          />
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleCards.map(card => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                <MuralCard
                  card={card}
                  zoom={zoom}
                  pan={pan}
                  isConnecting={connectingFrom === card.id}
                  canEdit={canEdit}
                  onCardClick={() => {
                    if (!canEdit || !mural) return;
                    if (connectingFrom === "") {
                      setConnectingFrom(card.id);
                    } else if (connectingFrom && connectingFrom !== card.id) {
                      // Criar conexão
                      const updated: Mural = {
                        ...mural,
                        connections: [...mural.connections, {
                          id: crypto.randomUUID(),
                          muralId: mural.id,
                          fromCardId: connectingFrom,
                          toCardId: card.id,
                        }],
                      };
                      save(updated);
                      setConnectingFrom(null);
                    }
                  }}
                  onEdit={() => setEditingCardId(card.id)}
                  onDelete={async () => {
                    if (!mural) return;
                    if (await showConfirm({ title: "Deletar Card", message: "Deseja deletar este card e todas as suas conexões?", type: "danger" })) {
                      const updated = {
                        ...mural,
                        cards: mural.cards.filter(c => c.id !== card.id),
                        connections: mural.connections.filter(c => c.fromCardId !== card.id && c.toCardId !== card.id)
                      };
                      save(updated);
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DndContext>

      {/* Formulário de Card */}
      {(showCardForm || editingCardId) && (
        <MuralCardForm
          initialData={editingCardId ? mural?.cards.find(c => c.id === editingCardId) : null}
          onSave={(cardData) => {
            if (!mural) return;
            if (editingCardId) {
              const updated = {
                ...mural,
                cards: mural.cards.map(c => c.id === editingCardId ? { ...c, ...cardData } as any : c)
              };
              save(updated);
              setEditingCardId(null);
            } else {
              const newCard = {
                ...cardData,
                id: crypto.randomUUID(),
                muralId: mural.id,
                position: { 
                  // Posição no centro da tela, compensando pan e zoom
                  x: (-pan.x + window.innerWidth / 2) / zoom - 90, 
                  y: (-pan.y + window.innerHeight / 2) / zoom - 50 
                },
                createdBy: "gm",
                createdAt: new Date().toISOString()
              } as any;
              const updated = {
                ...mural,
                cards: [...mural.cards, newCard]
              };
              save(updated);
              setShowCardForm(false);
            }
          }}
          onCancel={() => {
            setShowCardForm(false);
            setEditingCardId(null);
          }}
        />
      )}
    </div>
  );
}
