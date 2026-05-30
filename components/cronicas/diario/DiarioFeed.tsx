"use client";
import { useState } from "react";
import { useUserSession } from "@/contexts/UserSessionContext";
import { useAppContext } from "@/contexts/AppContext";
import { DiaryEntry } from "@/types/cronicas";
import { useDiario } from "@/hooks/useGameData";
import DiarioEntryCard from "./DiarioEntryCard";
import DiarioEntryForm from "./DiarioEntryForm";

const ITEMS_PER_PAGE = 20;

const NOTE_COLORS: Record<string, { border: string, bg: string, text: string, label: string }> = {
  padrao: { border: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", text: "#fbbf24", label: "Padrão" },
  importante: { border: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", label: "Importante" },
  pista: { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", label: "Pista" },
  npc: { border: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7", label: "NPC" },
  missao: { border: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e", label: "Missão" },
};

const getNoteStyle = (type?: string) => NOTE_COLORS[type || "padrao"] || NOTE_COLORS.padrao;

export default function DiarioFeed() {
  const { entries, add, update, remove } = useDiario();
  const { isGM, session } = useUserSession();
  const { jornadaPorDia, dadosGlobais } = useAppContext();
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
  const canCreate = isGM || !!session?.playerId;
  const currentPlayer = dadosGlobais.players?.find((p: any) => p.id === session?.playerId);
  const currentUserName = currentPlayer ? currentPlayer.name : (session?.name ?? "Mestre");

  // Coletar anotações pessoais do jogador atual
  const personalNotes: any[] = [];
  if (session?.playerId) {
    Object.keys(jornadaPorDia).forEach((dayStr) => {
      const day = Number(dayStr);
      const blocos = jornadaPorDia[day]?.blocos || [];
      blocos.forEach((bloco: any, bIdx: number) => {
        const pSessions = bloco.playerSessions || {};
        const pSession = pSessions[session.id];
        if (pSession && pSession.notes && pSession.notes.length > 0) {
          pSession.notes.forEach((note: any) => {
            personalNotes.push({
              ...note,
              day,
              blocoIdx: bIdx
            });
          });
        }
      });
    });
    personalNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

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
            defaultAuthorId={session?.playerId ?? "gm"}
            defaultAuthorName={currentUserName}
            onSubmit={async (entry) => { await add(entry); setShowForm(false); setCurrentPage(1); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      {/* Feed */}
      <div className="scrollable-area no-scrollbar" style={{ flex: 1, display: "flex", alignItems: "flex-start", width: "100%" }}>
        
        {/* Coluna da Esquerda: Timeline Original */}
        <div style={{ flex: 1, paddingRight: "3rem", paddingLeft: "1rem", borderRight: "1px solid var(--border-subtle)", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {entries.length === 0 && (
            <div className="empty-state" style={{ width: "100%" }}>
              <p>Nenhum registro ainda.</p>
              <span>Clique em "+ Nova Entrada" para começar.</span>
            </div>
          )}
          <div style={{ width: "100%", maxWidth: "800px" }}>
            {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([sessionNum, sessionEntries]) => (
              <div key={sessionNum} style={{ marginBottom: "2rem", width: "100%" }}>
                {/* Divider de sessão */}
                <div id={`session-divider-${sessionNum}`} className="diario-session-divider">
                  <div 
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseLeave={() => setActiveDividerMenu(null)}
                  >
                    <button 
                      className="narrative-label"
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--accent-primary)" }}
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
                    canDelete={isGM || entry.authorId === session?.playerId}
                    onDelete={id => remove(id)}
                    onUpdate={update}
                    currentUserId={session?.playerId ?? "gm"}
                    currentUserName={currentUserName}
                  />
                ))}
              </div>
            </div>
          ))}
          </div>
          
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

        {/* Coluna da Direita: Post-its (Anotações Pessoais) */}
        <div style={{ flex: 1, paddingLeft: "3rem", paddingRight: "1rem", minHeight: "100%" }}>
          {!isGM && session?.playerId && (
            <div style={{ width: "100%", maxWidth: "500px", position: "sticky", top: "0" }}>
              <h4 style={{ marginTop: 0, marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
                Minhas Anotações
              </h4>
              
              {personalNotes.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  Nenhuma anotação pessoal encontrada.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: "0.5rem", paddingBottom: "2rem" }} className="custom-scrollbar">
                  {personalNotes.map((note) => {
                    const style = getNoteStyle(note.type);
                    return (
                    <div key={note.id} style={{ 
                      background: style.bg, 
                      borderLeft: `4px solid ${style.border}`, 
                      padding: "1rem", 
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <h5 style={{ margin: 0, fontSize: "0.95rem", color: style.text, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {note.title || "Sem título"}
                          {note.type && note.type !== "padrao" && (
                            <span style={{ fontSize: "0.6rem", background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "100px", textTransform: "uppercase" }}>
                              {style.label}
                            </span>
                          )}
                        </h5>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                          Dia {note.day}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                        {note.desc}
                      </p>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
