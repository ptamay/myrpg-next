"use client";

import React, { useEffect, useState, useRef } from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

// --- MAIN QUEST MODALS ---

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MainQuestModal({ isOpen, onClose }: QuestModalProps) {
  const { diaAtual, jornadaPorDia, setJornadaPorDia, activeData, salvarEstadoLocal } = useAppContext();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [phases, setPhases] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && activeData?.data) {
      const data = activeData.data;
      if (formRef.current) {
        const form = formRef.current;
        (form.elements.namedItem("title") as HTMLInputElement).value = data.title || "";
        (form.elements.namedItem("notes") as HTMLTextAreaElement).value = data.notes || "";
      }
      setPhases(data.phases || []);
    } else if (isOpen) {
      setPhases([]);
    }
  }, [isOpen, activeData]);

  const handleAddPhase = () => {
    setPhases([...phases, { description: "", action: "", coefficient: "", npcRole: "", done: false }]);
  };

  const handlePhaseChange = (index: number, field: string, value: any) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setPhases(newPhases);
  };

  const handleRemovePhase = (index: number) => {
    const newPhases = [...phases];
    newPhases.splice(index, 1);
    setPhases(newPhases);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !activeData) return;
    
    const form = formRef.current;
    const questData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value,
      day: activeData.data?.day || diaAtual,
      phases: phases,
    };

    const blocoIndex = activeData.blocoIndex;
    const newJornada = { ...jornadaPorDia };
    const plots = newJornada[diaAtual].blocos[blocoIndex].plots;

    if (activeData.topicIndex !== undefined) {
      plots[activeData.topicIndex] = questData;
    } else {
      plots.push(questData);
    }

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  const handleDelete = () => {
    if (!activeData || activeData.topicIndex === undefined) return;
    
    const blocoIndex = activeData.blocoIndex;
    const newJornada = { ...jornadaPorDia };
    newJornada[diaAtual].blocos[blocoIndex].plots.splice(activeData.topicIndex, 1);

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="main-quest-modal">
      <div className="modal-content modal-xl glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Campanha</span>
            <h2 className="modal-title">Quest Principal</h2>
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
            <label>Título da Quest</label>
            <input type="text" name="title" className="journey-input modern-input" placeholder="Ex: A Busca pelo Artefato Perdido" required />
          </div>
          <div className="form-group mt-3">
            <label>Notas de Resolução (Visão Geral)</label>
            <textarea name="notes" className="journey-input form-textarea" style={{ minHeight: "80px" }} placeholder="Detalhes sobre o andamento e conclusão desta etapa..."></textarea>
          </div>
          <h4 className="form-section-title mt-4">Fases da Quest</h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Divida a quest em etapas menores para facilitar o acompanhamento.</p>
          <div className="phases-list">
            {phases.map((phase, i) => (
              <div key={i} className="phase-item" style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", position: "relative" }}>
                <button type="button" onClick={() => handleRemovePhase(i)} style={{ position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}>✕</button>
                <div className="form-group">
                  <label>Descrição da Fase</label>
                  <input type="text" className="journey-input" value={phase.description} onChange={(e) => handlePhaseChange(i, "description", e.target.value)} />
                </div>
                <div className="form-row mt-2">
                  <div className="form-group flex-1">
                    <label>Ação Relacionada</label>
                    <input type="text" className="journey-input" value={phase.action} onChange={(e) => handlePhaseChange(i, "action", e.target.value)} />
                  </div>
                  <div className="form-group flex-1">
                    <label>Coeficiente de Progresso</label>
                    <input type="text" className="journey-input" value={phase.coefficient} onChange={(e) => handlePhaseChange(i, "coefficient", e.target.value)} />
                  </div>
                  <div className="form-group flex-1">
                    <label>Papel de NPCs/Facções</label>
                    <input type="text" className="journey-input" value={phase.npcRole} onChange={(e) => handlePhaseChange(i, "npcRole", e.target.value)} />
                  </div>
                </div>
                <div className="form-group mt-2" style={{ display: "flex", alignItems: "center" }}>
                  <label className="custom-checkbox-container">
                    <input type="checkbox" checked={phase.done} onChange={(e) => handlePhaseChange(i, "done", e.target.checked)} />
                    Marcar Fase como Concluída
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn secondary-btn small-btn mt-3" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed" }} onClick={handleAddPhase}>
            + Adicionar Nova Fase
          </button>
        </form>
        <footer className="modal-footer">
          {activeData?.topicIndex !== undefined && (
            <button type="button" className="btn danger-btn ghost-delete-btn" style={{ padding: "0.5rem 1rem" }} onClick={handleDelete}>Excluir Quest</button>
          )}
          <button type="submit" className="btn primary-btn" onClick={(e) => {
            const form = (e.target as HTMLElement).closest('.modal-content')?.querySelector('form');
            if (form) form.requestSubmit();
          }}>Salvar Quest</button>
        </footer>
      </div>
    </Modal>
  );
}

export function MainQuestDetailModal({ isOpen, onClose }: QuestModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} id="main-quest-detail-modal">
      <div className="modal-content modal-xl glass-panel">
        <header className="modal-header" style={{ background: "hsla(0,0%,0%,0.3)" }}>
          <div className="modal-title-group">
            <span className="modal-subtitle">Campanha — Quest Principal</span>
            <h2 className="modal-title" style={{ fontSize: "1.5rem" }}>Detalhes da Quest</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn primary-btn small-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.4rem 0.9rem" }}>
              Editar Quest
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
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span className="meta-tag" style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem" }}>Dia X</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>Em Andamento</span>
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Fases da Quest</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Phases */}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// --- SIDE QUEST MODALS ---

export function SideQuestModal({ isOpen, onClose }: QuestModalProps) {
  const { diaAtual, jornadaPorDia, setJornadaPorDia, activeData, salvarEstadoLocal } = useAppContext();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && activeData?.data) {
      const data = activeData.data;
      if (formRef.current) {
        const form = formRef.current;
        (form.elements.namedItem("title") as HTMLInputElement).value = data.title || "";
        (form.elements.namedItem("desc") as HTMLTextAreaElement).value = data.desc || "";
        (form.elements.namedItem("npc") as HTMLInputElement).value = data.npc || "";
      }
      setTests(data.tests || []);
    } else if (isOpen) {
      setTests([]);
    }
  }, [isOpen, activeData]);

  const handleAddTest = () => {
    setTests([...tests, { description: "", done: false }]);
  };

  const handleTestChange = (index: number, field: string, value: any) => {
    const newTests = [...tests];
    newTests[index] = { ...newTests[index], [field]: value };
    setTests(newTests);
  };

  const handleRemoveTest = (index: number) => {
    const newTests = [...tests];
    newTests.splice(index, 1);
    setTests(newTests);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !activeData) return;
    
    const form = formRef.current;
    const questData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      desc: (form.elements.namedItem("desc") as HTMLTextAreaElement).value,
      npc: (form.elements.namedItem("npc") as HTMLInputElement).value,
      day: activeData.data?.day || diaAtual,
      tests: tests,
    };

    const blocoIndex = activeData.blocoIndex;
    const newJornada = { ...jornadaPorDia };
    const sidequests = newJornada[diaAtual].blocos[blocoIndex].sidequests;

    if (activeData.topicIndex !== undefined) {
      sidequests[activeData.topicIndex] = questData;
    } else {
      sidequests.push(questData);
    }

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  const handleDelete = () => {
    if (!activeData || activeData.topicIndex === undefined) return;
    
    const blocoIndex = activeData.blocoIndex;
    const newJornada = { ...jornadaPorDia };
    newJornada[diaAtual].blocos[blocoIndex].sidequests.splice(activeData.topicIndex, 1);

    setJornadaPorDia(newJornada);
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="side-quest-modal">
      <div className="modal-content modal-md glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Mundo Aberto</span>
            <h2 className="modal-title">Side Quest / Rumor</h2>
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
            <label>Título ou Rumor</label>
            <input type="text" name="title" className="journey-input modern-input" placeholder="Ex: A Fera dos Bosques" required />
          </div>
          <div className="form-group mt-3">
            <label>Descrição do Problema</label>
            <textarea name="desc" className="journey-input form-textarea" style={{ minHeight: "80px" }}></textarea>
          </div>
          <div className="form-group mt-3">
            <label>Recompensa / Desfecho Prometido (ou NPC vinculado)</label>
            <input type="text" name="npc" className="journey-input modern-input" placeholder="Ex: 50 PO e a gratidão da vila" />
          </div>
          
          <h4 className="form-section-title mt-4">Testes Relacionados</h4>
          <div className="phases-list">
            {tests.map((test, i) => (
              <div key={i} className="phase-item" style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", position: "relative" }}>
                <button type="button" onClick={() => handleRemoveTest(i)} style={{ position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}>✕</button>
                <div className="form-group">
                  <label>Descrição do Teste (ex: Rastrear pegadas CD 15)</label>
                  <input type="text" className="journey-input" value={test.description} onChange={(e) => handleTestChange(i, "description", e.target.value)} />
                </div>
                <div className="form-group mt-2" style={{ display: "flex", alignItems: "center" }}>
                  <label className="custom-checkbox-container">
                    <input type="checkbox" checked={test.done} onChange={(e) => handleTestChange(i, "done", e.target.checked)} />
                    Marcar como Concluído
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn secondary-btn small-btn mt-3" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed" }} onClick={handleAddTest}>
            + Adicionar Novo Teste
          </button>
        </form>
        <footer className="modal-footer">
          {activeData?.topicIndex !== undefined && (
             <button type="button" className="btn danger-btn ghost-delete-btn" style={{ padding: "0.5rem 1rem" }} onClick={handleDelete}>Excluir Missão</button>
          )}
          <button type="submit" className="btn primary-btn" onClick={(e) => {
            const form = (e.target as HTMLElement).closest('.modal-content')?.querySelector('form');
            if (form) form.requestSubmit();
          }}>Salvar Missão</button>
        </footer>
      </div>
    </Modal>
  );
}

export function SideQuestDetailModal({ isOpen, onClose }: QuestModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} id="side-quest-detail-modal">
      <div className="modal-content modal-md glass-panel">
        <header className="modal-header" style={{ background: "hsla(0,0%,0%,0.3)" }}>
          <div className="modal-title-group">
            <span className="modal-subtitle">Mundo Aberto — Side Quest</span>
            <h2 className="modal-title" style={{ fontSize: "1.4rem" }}>Detalhes da Missão</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn primary-btn small-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.4rem 0.9rem" }}>
              Editar Missão
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
           {/* Side Quest Details Here */}
        </div>
      </div>
    </Modal>
  );
}
