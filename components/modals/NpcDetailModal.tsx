"use client";

import React, { useState } from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "../../contexts/AppContext";
import { useSystemDialog } from "../../contexts/SystemDialogContext";

interface NpcDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  npc: any; // We'll type this later or pass a detailed object
}

export default function NpcDetailModal({ isOpen, onClose, npc }: NpcDetailModalProps) {
  const [activeTab, setActiveTab] = useState("tab-combat");
  const { setModals, setActiveData, dadosGlobais, setDadosGlobais, salvarEstadoLocal } = useAppContext();
  const { showConfirm } = useSystemDialog();

  const handleDelete = async () => {
    if (await showConfirm({ title: "Excluir NPC", message: `Tem certeza que deseja excluir o NPC "${npc.name}" permanentemente?`, type: "danger" })) {
      const newNpcs = dadosGlobais.npcs.filter((n: any) => n.id !== npc.id);
      setDadosGlobais({ ...dadosGlobais, npcs: newNpcs });
      setTimeout(salvarEstadoLocal, 100);
      onClose();
    }
  };

  if (!npc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="npc-detail-modal">
      <div className="modal-content modal-xl glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Visualização</span>
            <h2 className="modal-title">Ficha do NPC</h2>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn danger-btn small-btn" onClick={handleDelete}>
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: "4px" }}>
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Excluir
            </button>
            <button className="btn secondary-btn small-btn" onClick={() => {
              setActiveData(npc);
              setModals((p: any) => ({ ...p, npcForm: true }));
              onClose();
            }}>Editar Ficha</button>
            <button className="close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>
        <div className="modal-body custom-scrollbar p-0">
          <div className="npc-detail-header">
            {npc.image ? (
              <img src={npc.image} alt="Avatar" className="npc-detail-avatar" />
            ) : (
              <div className="npc-detail-placeholder">?</div>
            )}
            <div className="npc-detail-title-area">
              <h1 className="det-name">
                <span>{npc.name}</span>
                {npc.isHidden && <span className="badge-hidden">Oculto</span>}
              </h1>
              <p className="det-title">{npc.title || "---"}</p>
              <p className="det-meta">
                <span>{npc.race || "---"}</span> • <span>{npc.alignment || "---"}</span> • ND <span>{npc.cr || "---"}</span>
              </p>
            </div>
          </div>

          <div className="npc-detail-tabs-nav">
            <button
              className={`det-tab-btn ${activeTab === "tab-combat" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-combat")}
            >
              Combate
            </button>
            <button
              className={`det-tab-btn ${activeTab === "tab-lore" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-lore")}
            >
              Biografia
            </button>
            <button
              className={`det-tab-btn ${activeTab === "tab-notes" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-notes")}
            >
              Inventário & Notas
            </button>
          </div>

          <div className="npc-detail-tabs-content">
            <div className={`det-tab-content ${activeTab === "tab-combat" ? "active" : ""}`}>
              <div className="det-combat-stats-bar">
                <div className="det-combat-stat"><span className="lbl">PV Máx</span><span className="val">{npc.hpMax || "---"}</span></div>
                <div className="det-combat-stat"><span className="lbl">CA</span><span className="val">{npc.ac || "---"}</span></div>
                <div className="det-combat-stat"><span className="lbl">Iniciativa</span><span className="val">{npc.init || "---"}</span></div>
                <div className="det-combat-stat"><span className="lbl">Desloc.</span><span className="val">{npc.speed || "---"}</span></div>
              </div>
              <div className="det-attr-grid">
                <div className="det-attr-box"><span className="lbl">FOR</span><span className="val">{npc.str || 10}</span></div>
                <div className="det-attr-box"><span className="lbl">DES</span><span className="val">{npc.dex || 10}</span></div>
                <div className="det-attr-box"><span className="lbl">CON</span><span className="val">{npc.con || 10}</span></div>
                <div className="det-attr-box"><span className="lbl">INT</span><span className="val">{npc.int || 10}</span></div>
                <div className="det-attr-box"><span className="lbl">SAB</span><span className="val">{npc.wis || 10}</span></div>
                <div className="det-attr-box"><span className="lbl">CAR</span><span className="val">{npc.cha || 10}</span></div>
              </div>
              <div className="det-text-block mt-4">
                <p><strong>Resistências:</strong> <span>{npc.res || "---"}</span></p>
                <p><strong>Imunidades:</strong> <span>{npc.imm || "---"}</span></p>
              </div>
              <h4 className="det-section-title mt-4">⚔️ Ataque Principal</h4>
              <div>{npc.mainAttack || "---"}</div>
              <h4 className="det-section-title mt-4">📜 Outras Ações</h4>
              <div className="det-text-body">{npc.actions || "---"}</div>
            </div>

            <div className={`det-tab-content ${activeTab === "tab-lore" ? "active" : ""}`}>
              <h4 className="det-section-title">Motivações</h4>
              <div className="det-text-body">{npc.mot || "---"}</div>
              <h4 className="det-section-title mt-4">Segredos & Fraquezas</h4>
              <div className="det-text-body">{npc.sec || "---"}</div>
              <h4 className="det-section-title mt-4">Traços</h4>
              <div className="det-text-body">{npc.traits || "---"}</div>
            </div>

            <div className={`det-tab-content ${activeTab === "tab-notes" ? "active" : ""}`}>
              <div className="form-row">
                <div className="flex-1">
                  <h4 className="det-section-title">Itens Visíveis</h4>
                  <div className="det-text-body">{npc.itemsVis || "---"}</div>
                </div>
                <div className="flex-1">
                  <h4 className="det-section-title">Itens Ocultos</h4>
                  <div className="det-text-body">{npc.itemsHid || "---"}</div>
                </div>
              </div>
              <h4 className="det-section-title mt-4">Notas do Mestre</h4>
              <div className="det-text-body highlight-text-body">{npc.notes || "---"}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
