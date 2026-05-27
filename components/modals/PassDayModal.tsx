"use client";

import React from "react";
import Modal from "../ui/Modal";
import { useAppContext } from "@/contexts/AppContext";

interface PassDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PassDayModal({ isOpen, onClose }: PassDayModalProps) {
  const { diaAtual, setDiaAtual, setIndiceBlocoAtivo, dadosGlobais, setDadosGlobais, jornadaPorDia, setJornadaPorDia, salvarEstadoLocal } = useAppContext();
  
  const waterCost = dadosGlobais.food?.people || 0;
  const foodCost = dadosGlobais.food?.people || 0;

  const handleConfirm = () => {
    // Debitar suprimentos
    const newFood = {
      ...dadosGlobais.food,
      water: Math.max(0, dadosGlobais.food.water - waterCost),
      food: Math.max(0, dadosGlobais.food.food - foodCost)
    };
    setDadosGlobais({ ...dadosGlobais, food: newFood });

    // Avançar dia
    const nextDay = diaAtual + 1;
    setDiaAtual(nextDay);
    setIndiceBlocoAtivo(0);

    // Garantir que a jornada existe para o novo dia (caso seja além do dia 6)
    if (!jornadaPorDia[nextDay]) {
      const { getInitialJornada } = require("@/lib/dataHelpers");
      const initial = getInitialJornada();
      setJornadaPorDia((prev) => ({
        ...prev,
        [nextDay]: initial[1] // Usa o dia 1 como template
      }));
    }

    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="pass-day-modal">
      <div className="modal-content glass-panel" style={{ maxWidth: "450px" }}>
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Jornada</span>
            <h2 className="modal-title">Passar o Dia</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <div className="modal-body text-center" style={{ padding: "2rem 1.5rem" }}>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="var(--warning)" strokeWidth="1.5" style={{ marginBottom: "1rem" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>
            Avançar para o Dia <span>{diaAtual + 1}</span>?
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Esta ação irá consumir suprimentos com base na quantidade de pessoas da tripulação e avançar o tempo.
          </p>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", textAlign: "left", borderLeft: "3px solid var(--warning)" }}>
            <p style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
              <strong>Consumo de Água:</strong> <span className="text-danger">{waterCost}</span>
            </p>
            <p style={{ marginBottom: 0, display: "flex", justifyContent: "space-between" }}>
              <strong>Consumo de Comida:</strong> <span className="text-danger">{foodCost}</span>
            </p>
          </div>
        </div>
        <footer className="modal-footer" style={{ justifyContent: "center", gap: "1rem" }}>
          <button className="btn secondary-btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary-btn" style={{ background: "var(--warning)", color: "#000" }} onClick={handleConfirm}>
            Confirmar e Avançar
          </button>
        </footer>
      </div>
    </Modal>
  );
}
