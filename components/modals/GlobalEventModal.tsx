"use client";

import React, { useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

interface GlobalEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalEventModal({ isOpen, onClose }: GlobalEventModalProps) {
  const { diaAtual, jornadaPorDia, setJornadaPorDia, activeData, salvarEstadoLocal } = useAppContext();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current && activeData?.data) {
      const form = formRef.current;
      const data = activeData.data;
      (form.elements.namedItem("title") as HTMLInputElement).value = data.title || "";
      (form.elements.namedItem("desc") as HTMLTextAreaElement).value = data.desc || "";
      (form.elements.namedItem("trigger") as HTMLInputElement).value = data.trigger || "";
      (form.elements.namedItem("save") as HTMLInputElement).value = data.save || "";
      (form.elements.namedItem("damage") as HTMLInputElement).value = data.damage || "";
    }
  }, [isOpen, activeData]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !activeData) return;
    
    const form = formRef.current;
    const eventData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      desc: (form.elements.namedItem("desc") as HTMLTextAreaElement).value,
      trigger: (form.elements.namedItem("trigger") as HTMLInputElement).value,
      save: (form.elements.namedItem("save") as HTMLInputElement).value,
      damage: (form.elements.namedItem("damage") as HTMLInputElement).value,
    };

    const blocoIndex = activeData.blocoIndex;
    const newJornada = { ...jornadaPorDia };
    const timeline = newJornada[diaAtual].blocos[blocoIndex].timeline;

    if (activeData.topicIndex !== undefined) {
      timeline[activeData.topicIndex] = eventData;
    } else {
      timeline.push(eventData);
    }

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  const handleDelete = () => {
    if (!activeData || activeData.topicIndex === undefined) return;
    
    const blocoIndex = activeData.blocoIndex;
    const newJornada = { ...jornadaPorDia };
    newJornada[diaAtual].blocos[blocoIndex].timeline.splice(activeData.topicIndex, 1);

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="global-event-modal">
      <div className="modal-content modal-md glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">O Mundo</span>
            <h2 className="modal-title">Evento Global</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <form ref={formRef} onSubmit={handleSave} className="modal-body custom-scrollbar">
          <div className="form-group">
            <label>Título do Evento</label>
            <input type="text" name="title" className="journey-input modern-input" placeholder="Ex: Tempestade Violenta" required />
          </div>
          <div className="form-group mt-3">
            <label>Descrição Narrativa</label>
            <textarea name="desc" className="journey-input form-textarea" style={{ minHeight: "100px" }} placeholder="Área para o mestre ler para os jogadores..."></textarea>
          </div>
          
          <div className="mechanics-block mt-4 glass-panel highlight-box" style={{ padding: "1.5rem" }}>
            <h4 className="form-section-title" style={{ marginTop: 0 }}>Mecânica (D&D 5e)</h4>
            <div className="form-group mt-2">
              <label>Gatilho do Evento</label>
              <input type="text" name="trigger" className="journey-input modern-input" placeholder="Ex: No início do turno" />
            </div>
            <div className="form-row mt-2">
              <div className="form-group flex-1">
                <label>Teste de Resistência / CD</label>
                <input type="text" name="save" className="journey-input modern-input" placeholder="Ex: CD 13 - Constituição" />
              </div>
              <div className="form-group flex-1">
                <label>Dano / Consequência</label>
                <input type="text" name="damage" className="journey-input modern-input" placeholder="Ex: 2d10 contundente ou metade num sucesso" />
              </div>
            </div>
          </div>
        </form>
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
          }}>Salvar Evento</button>
        </footer>
      </div>
    </Modal>
  );
}
