"use client";

import React from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NpcImportTextModal({ isOpen, onClose }: ImportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} id="npc-import-text-modal">
      <div className="modal-content glass-panel" style={{ maxWidth: "600px" }}>
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Automação</span>
            <h2 className="modal-title">Colar Estrutura de Texto</h2>
          </div>
        </header>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Cole a estrutura de texto do NPC abaixo para preencher os campos automaticamente.
          </p>
          <textarea 
            className="journey-input form-textarea" 
            style={{ minHeight: "300px", fontSize: "0.85rem" }} 
            placeholder="Informações Básicas&#10;Nome: Exemplo..."
          ></textarea>
        </div>
        <footer className="modal-footer">
          <button className="btn danger-btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary-btn">Processar e Preencher</button>
        </footer>
      </div>
    </Modal>
  );
}

export function NpcImportOptionsModal({ isOpen, onClose }: ImportModalProps) {
  const { dadosGlobais, setDadosGlobais, activeData, salvarEstadoLocal } = useAppContext();
  
  const importedNpcs = activeData?.importedNpcs || [];
  const count = importedNpcs.length;

  const handleMerge = () => {
    if (count === 0) return;
    const currentNpcs = [...(dadosGlobais.npcs || [])];
    
    // Mescla usando ID ou Nome como chave
    importedNpcs.forEach((newNpc: any) => {
      const idx = currentNpcs.findIndex(n => n.id === newNpc.id || n.name === newNpc.name);
      if (idx !== -1) {
        currentNpcs[idx] = { ...currentNpcs[idx], ...newNpc };
      } else {
        currentNpcs.push(newNpc);
      }
    });

    setDadosGlobais({ ...dadosGlobais, npcs: currentNpcs });
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  const handleReplace = () => {
    if (count === 0) return;
    setDadosGlobais({ ...dadosGlobais, npcs: importedNpcs });
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="npc-import-options-modal">
      <div className="modal-content glass-panel" style={{ maxWidth: "500px" }}>
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Importador de Elenco</span>
            <h2 className="modal-title">Como importar os NPCs?</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Identificamos <strong style={{ color: "var(--accent-primary)" }}>{count}</strong> NPCs no arquivo selecionado. Como deseja prosseguir com a importação?
          </p>
          <div className="import-options-grid" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button className="btn secondary-btn" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", padding: "1.25rem", gap: "4px", borderLeft: "4px solid var(--success)", width: "100%" }} onClick={handleMerge}>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-success"><path d="M12 5v14M5 12h14"/></svg>
                Mesclar com o Elenco Atual
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 400 }}>
                Adiciona novos NPCs e atualiza os já existentes (mesmo ID ou Nome). Nenhum NPC atual será excluído.
              </div>
            </button>
            <button className="btn danger-btn" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", padding: "1.25rem", gap: "4px", borderLeft: "4px solid var(--danger)", width: "100%" }} onClick={handleReplace}>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger"><path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/></svg>
                Substituir Elenco Atual
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>
                Apaga permanentemente todos os NPCs cadastrados atualmente e instala os novos NPCs do arquivo.
              </div>
            </button>
          </div>
        </div>
        <footer className="modal-footer" style={{ justifyContent: "flex-end" }}>
          <button className="btn secondary-btn" style={{ padding: "0.6rem 1.2rem" }} onClick={onClose}>Cancelar</button>
        </footer>
      </div>
    </Modal>
  );
}
