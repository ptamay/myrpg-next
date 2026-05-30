"use client";

import React, { useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";
import { useUserSession } from "@/contexts/UserSessionContext";

interface PersonalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalNoteModal({ isOpen, onClose }: PersonalNoteModalProps) {
  const { diaAtual, indiceBlocoAtivo, jornadaPorDia, setJornadaPorDia, activeData, salvarEstadoLocal } = useAppContext();
  const { session } = useUserSession();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current && activeData?.data) {
      const form = formRef.current;
      const data = activeData.data;
      (form.elements.namedItem("title") as HTMLInputElement).value = data.title || "";
      (form.elements.namedItem("desc") as HTMLTextAreaElement).value = data.desc || "";
      if (form.elements.namedItem("type")) {
        (form.elements.namedItem("type") as HTMLSelectElement).value = data.type || "padrao";
      }
    } else if (isOpen && formRef.current && !activeData?.data) {
      const form = formRef.current;
      (form.elements.namedItem("title") as HTMLInputElement).value = "";
      (form.elements.namedItem("desc") as HTMLTextAreaElement).value = "";
      if (form.elements.namedItem("type")) {
        (form.elements.namedItem("type") as HTMLSelectElement).value = "padrao";
      }
    }
  }, [isOpen, activeData]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !session?.id) return;
    
    const form = formRef.current;
    const noteData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      desc: (form.elements.namedItem("desc") as HTMLTextAreaElement).value,
      type: (form.elements.namedItem("type") as HTMLSelectElement).value,
      date: new Date().toISOString()
    };

    const newJornada = { ...jornadaPorDia };
    if (!newJornada[diaAtual]) return;
    const bData = newJornada[diaAtual].blocos[indiceBlocoAtivo];
    
    if (!bData.playerSessions) bData.playerSessions = {};
    if (!bData.playerSessions[session.id]) {
      bData.playerSessions[session.id] = { acoes: [], objetivos: [], concluido: false, notes: [] };
    }
    
    const notes = bData.playerSessions[session.id].notes || [];

    if (activeData && activeData.topicIndex !== undefined) {
      notes[activeData.topicIndex] = { ...notes[activeData.topicIndex], ...noteData };
    } else {
      notes.push({ id: Date.now(), ...noteData });
    }
    
    bData.playerSessions[session.id].notes = notes;
    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  const handleDelete = () => {
    if (!activeData || activeData.topicIndex === undefined || !session?.id) return;
    
    const newJornada = { ...jornadaPorDia };
    if (!newJornada[diaAtual]) return;
    const bData = newJornada[diaAtual].blocos[indiceBlocoAtivo];
    
    if (bData.playerSessions && bData.playerSessions[session.id] && bData.playerSessions[session.id].notes) {
      bData.playerSessions[session.id].notes.splice(activeData.topicIndex, 1);
    }

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="personal-note-modal">
      <div className="modal-content modal-md glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Anotações Pessoais</span>
            <h2 className="modal-title">Nova Anotação</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <div className="modal-body custom-scrollbar">
          <div style={{ background: "rgba(251, 191, 36, 0.15)", padding: "0.75rem", borderRadius: "8px", borderLeft: "3px solid #fbbf24", marginBottom: "1rem" }}>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#fcd34d", lineHeight: 1.4 }}>
              <strong>Atenção:</strong> As anotações salvas aqui ficarão registradas também no seu <strong>Diário de Bordo</strong> (aba Crônicas) para consultas futuras.
            </p>
          </div>
          <form ref={formRef} onSubmit={handleSave}>
            <div className="form-group">
              <label>Título / Assunto</label>
              <input type="text" name="title" className="journey-input modern-input" placeholder="Ex: A chave de prata" required />
            </div>
            <div className="form-group mt-3">
              <label>Tipo de Anotação</label>
              <select name="type" className="journey-input modern-input">
                <option value="padrao">Padrão / Nota</option>
                <option value="importante">Importante</option>
                <option value="pista">Pista / Investigação</option>
                <option value="npc">NPC / Personagem</option>
                <option value="missao">Missão / Objetivo</option>
              </select>
            </div>
            <div className="form-group mt-3">
              <label>Conteúdo da Anotação</label>
              <textarea name="desc" className="journey-input form-textarea" style={{ minHeight: "200px" }} placeholder="Escreva o que quiser lembrar..."></textarea>
            </div>
          </form>
        </div>
        <footer className="modal-footer">
          {activeData?.topicIndex !== undefined && (
            <button type="button" className="btn danger-btn ghost-delete-btn" style={{ padding: "0.5rem 1rem" }} onClick={handleDelete}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg> Excluir
            </button>
          )}
          <button type="submit" className="btn primary-btn" onClick={(e) => {
            const form = (e.target as HTMLElement).closest('.modal-content')?.querySelector('form');
            if (form) form.requestSubmit();
          }}>Salvar</button>
        </footer>
      </div>
    </Modal>
  );
}

export function PersonalNoteDetailModal({ isOpen, onClose }: PersonalNoteModalProps) {
  const { activeData, setModals } = useAppContext();
  
  if (!activeData || !activeData.data) return null;
  const { title, desc } = activeData.data;

  const handleEdit = () => {
    setModals((prev: any) => ({ ...prev, personalNoteDetail: false, personalNote: true }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="personal-note-detail-modal">
      <div className="modal-content modal-md glass-panel">
        <header className="modal-header" style={{ background: "hsla(0,0%,0%,0.3)" }}>
          <div className="modal-title-group">
            <span className="modal-subtitle">Anotação Pessoal</span>
            <h2 className="modal-title" style={{ fontSize: "1.5rem" }}>{title || 'Sem Título'}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={handleEdit} className="btn primary-btn small-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.4rem 0.9rem" }}>
              Editar
            </button>
            <button className="close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>
        <div className="modal-body custom-scrollbar" style={{ gap: "1.25rem" }}>
          {desc && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                {desc}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
