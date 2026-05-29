"use client";
import { useState } from "react";
import { useDiario } from "@/hooks/useGameData";
import { useUserSession } from "@/contexts/UserSessionContext";
import { DiaryEntry } from "@/types/cronicas";
import DiarioEntryCard from "./DiarioEntryCard";
import DiarioEntryForm from "./DiarioEntryForm";

export default function DiarioFeed() {
  const { entries, add, update, remove } = useDiario();
  const { isGM, session } = useUserSession();
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [activeDividerMenu, setActiveDividerMenu] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 10;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE));
  const paginatedEntries = entries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Agrupar por sessão, decrescente
  const grouped = paginatedEntries
    .slice()
    .sort((a, b) => b.sessionNumber - a.sessionNumber)
    .reduce<Record<number, DiaryEntry[]>>((acc, e) => {
      if (!acc[e.sessionNumber]) acc[e.sessionNumber] = [];
      acc[e.sessionNumber].push(e);
      return acc;
    }, {});

  // Extrair sessões únicas existentes
  const sessionsList = Array.from(new Set(entries.map(e => e.sessionNumber))).sort((a, b) => b - a);

  // Função para ir para a sessão (com suporte a paginação)
  const handleGoToSession = (sNum: number) => {
    const sortedEntries = entries.slice().sort((a, b) => b.sessionNumber - a.sessionNumber);
    const index = sortedEntries.findIndex(e => e.sessionNumber === sNum);
    if (index !== -1) {
      const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
      setCurrentPage(targetPage);
      setShowSessionMenu(false);
      setTimeout(() => {
        const element = document.getElementById(`session-divider-${sNum}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Qualquer um com sessão ativa pode criar
  const canCreate = isGM || !!session?.characterId;

  return (
    <div className="npc-view-container" style={{ padding: "1.5rem" }}>
      {/* Header sticky */}
      <div className="sticky-npc-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="section-title">Diário de Bordo</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {sessionsList.length > 0 && (
              <div style={{ position: "relative" }}>
                <button 
                  className="btn secondary-btn small-btn" 
                  onClick={() => setShowSessionMenu(!showSessionMenu)}
                >
                  Sessões ▾
                </button>
                {showSessionMenu && (
                  <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "0.5rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "0.25rem", zIndex: 100, display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "120px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 10px rgba(0,0,0,0.5)" }} className="no-scrollbar">
                    {sessionsList.map(sNum => (
                      <button 
                        key={sNum}
                        style={{ background: "none", border: "none", color: "var(--text-secondary)", textAlign: "left", fontSize: "0.85rem", padding: "0.5rem 0.75rem", cursor: "pointer", display: "block", width: "100%", transition: "color 0.2s" }} 
                        onClick={() => handleGoToSession(sNum)}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                      >
                        Sessão {sNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {canCreate && (
              <button
                className="btn primary-btn small-btn"
                onClick={() => setShowForm(v => !v)}
              >
                + Nova Entrada
              </button>
            )}
          </div>
        </div>
        {showForm && (
          <DiarioEntryForm
            defaultAuthorId={session?.characterId ?? "gm"}
            defaultAuthorName={session?.characterName ?? "Mestre"}
            onSubmit={async (entry) => { await add(entry); setShowForm(false); setCurrentPage(1); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      {/* Feed */}
      <div className="scrollable-area no-scrollbar" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "900px" }}>
          {entries.length === 0 && (
            <div className="empty-state">
              <p>Nenhum registro ainda.</p>
              <span>Clique em "+ Nova Entrada" para começar.</span>
            </div>
          )}
          {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([sessionNum, sessionEntries]) => (
            <div key={sessionNum} style={{ marginBottom: "2rem" }}>
              {/* Divider de sessão */}
              <div id={`session-divider-${sessionNum}`} className="diario-session-divider">
                <div 
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseLeave={() => setActiveDividerMenu(null)}
                >
                  <button 
                    className="narrative-label"
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", padding: 0 }}
                    onClick={() => setActiveDividerMenu(activeDividerMenu === Number(sessionNum) ? null : Number(sessionNum))}
                  >
                    Sessão {sessionNum} ▾
                  </button>
                  {activeDividerMenu === Number(sessionNum) && (
                    <div style={{ position: "absolute", left: 0, top: "100%", marginTop: "0.25rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "0.25rem", zIndex: 100, display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "120px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 10px rgba(0,0,0,0.5)" }} className="no-scrollbar">
                      {sessionsList.map(sNum => (
                        <button 
                          key={sNum}
                          style={{ background: "none", border: "none", color: "var(--text-secondary)", textAlign: "left", fontSize: "0.85rem", padding: "0.5rem 0.75rem", cursor: "pointer", display: "block", width: "100%", transition: "color 0.2s", borderRadius: "var(--radius-sm)" }} 
                          onClick={() => { setActiveDividerMenu(null); handleGoToSession(sNum); }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                        >
                          Sessão {sNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="diario-session-divider-line" />
              </div>
              
              {/* Entradas */}
              <div className="timeline-container">
                <div className="timeline-line"></div>
                {sessionEntries.map(entry => (
                  <DiarioEntryCard
                    key={entry.id}
                    entry={entry}
                    canDelete={isGM || entry.authorId === session?.characterId}
                    onDelete={id => remove(id)}
                    onUpdate={update}
                    currentUserId={session?.characterId ?? "gm"}
                    currentUserName={session?.characterName ?? "Mestre"}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {/* Pagination Controls */}
          {entries.length > ITEMS_PER_PAGE && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem", paddingBottom: "2rem" }}>
              <button 
                className="btn secondary-btn small-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Anteriores
              </button>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button 
                className="btn secondary-btn small-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Mais Antigos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
