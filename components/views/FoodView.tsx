"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";

export default function FoodView() {
  const { dadosGlobais } = useAppContext();
  const [activeTab, setActiveTab] = useState("food-panel");

  return (
    <div className="food-view-container" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: 0 }}>
      <header className="npc-header glass-panel">
        <div className="npc-header-info">
          <h1 className="view-title">Gestão de Suprimentos</h1>
          <p className="view-subtitle">Controle de rações e água. A escassez pode ser letal.</p>
        </div>
      </header>

      <div className="food-tabs-nav">
        <button
          className={`food-tab-btn ${activeTab === "food-panel" ? "active" : ""}`}
          onClick={() => setActiveTab("food-panel")}
        >
          Painel Geral
        </button>
        <button
          className={`food-tab-btn ${activeTab === "food-history" ? "active" : ""}`}
          onClick={() => setActiveTab("food-history")}
        >
          Histórico de Alterações
        </button>
      </div>

      <div
        className="food-tab-content"
        style={{
          display: activeTab === "food-panel" ? "flex" : "none",
          gap: "1.5rem",
          marginTop: "1rem",
          height: "calc(100vh - 190px)",
          maxHeight: "520px",
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        <div className="food-left-column" style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
          <div className="control-card modern-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem", flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Tripulação & Consumo</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", margin: 0 }}>Defina a tripulação ativa para o cálculo automático diário.</p>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", marginTop: "0.25rem" }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label style={{ fontSize: "0.75rem", marginBottom: "4px", display: "block" }}>Nº de Pessoas</label>
                <input type="number" className="journey-input modern-input" min="0" defaultValue={dadosGlobais.food?.people || 0} style={{ width: "100%", height: "38px", padding: "0 10px" }} />
              </div>
              <button className="btn primary-btn" style={{ height: "38px", padding: "0 1.25rem", fontSize: "0.85rem" }}>Confirmar</button>
            </div>
            <div className="consumption-badge" style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem", fontWeight: 800 }}>
              Consumo diário: {dadosGlobais.food?.people || 0} Água / {dadosGlobais.food?.people || 0} Comida
            </div>
          </div>

          <div className="control-card modern-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem", flex: 1.3 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Ajuste Manual de Estoque</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", margin: 0 }}>Adicione ou remova suprimentos registrando o motivo.</p>
            <div className="manual-adjustment-form" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", alignItems: "stretch", margin: 0 }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <select className="journey-input modern-input w-full" style={{ minHeight: "42px", padding: "0 8px", fontSize: "0.85rem" }}>
                    <option value="water">💧 Água</option>
                    <option value="food">🍖 Comida</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input type="number" className="journey-input modern-input" min="0" placeholder="Qtd" style={{ width: "100%", minHeight: "42px", padding: "0 8px", fontSize: "0.85rem" }} />
                </div>
                <div className="form-group" style={{ flex: 1.5, margin: 0 }}>
                  <select className="journey-input modern-input w-full" style={{ minHeight: "42px", padding: "0 8px", fontSize: "0.85rem" }}>
                    <option value="add">➕ Adicionar</option>
                    <option value="sub">➖ Subtrair</option>
                    <option value="set">✏️ Definir Total</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input type="text" className="journey-input modern-input" placeholder="Ex: Estoque Inicial, Saque..." style={{ width: "100%", minHeight: "42px", padding: "0 10px", fontSize: "0.85rem" }} />
              </div>
              <button className="btn primary-btn" style={{ width: "100%", minHeight: "42px", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.25rem" }}>Confirmar Ajuste</button>
            </div>
          </div>
        </div>

        <div className="food-right-column" style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
          <div className="supply-card modern-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 1.75rem", width: "100%", flex: 1, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", minWidth: 0, flex: 1 }}>
              <div className="supply-icon text-primary" style={{ margin: 0, padding: "0.6rem", background: "rgba(0, 102, 204, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Estoque de Água</h3>
                <div className="supply-info-badge" style={{ marginTop: "0.25rem", padding: "0.2rem 0.5rem", fontSize: "0.75rem", background: "none", border: "none", fontWeight: 600 }}>Dias calculados...</div>
              </div>
            </div>
            <div className="supply-value" style={{ fontSize: "3.2rem", fontWeight: 900, lineHeight: 1, margin: 0, color: "var(--text-primary)", textShadow: "0 0 15px rgba(0, 102, 204, 0.3)", flexShrink: 0 }}>{dadosGlobais.food?.water || 0}</div>
          </div>

          <div className="supply-card modern-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 1.75rem", width: "100%", flex: 1, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", minWidth: 0, flex: 1 }}>
              <div className="supply-icon text-warning" style={{ margin: 0, padding: "0.6rem", background: "rgba(251, 191, 36, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15.4 9.5a4 4 0 0 0-5.5 0l-3 3a4 4 0 0 0 0 5.5l.3.3a3 3 0 0 0 4.1 0l3-3a3 3 0 0 0 0-4.1z" />
                  <path d="M11.2 13.8l-4.7 4.7" />
                  <path d="M8.5 21a2 2 0 1 1-3-3" />
                  <path d="M5.5 18a2 2 0 1 1-3-3" />
                </svg>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Estoque de Comida</h3>
                <div className="supply-info-badge" style={{ marginTop: "0.25rem", padding: "0.2rem 0.5rem", fontSize: "0.75rem", background: "none", border: "none", fontWeight: 600 }}>Dias calculados...</div>
              </div>
            </div>
            <div className="supply-value" style={{ fontSize: "3.2rem", fontWeight: 900, lineHeight: 1, margin: 0, color: "var(--text-primary)", textShadow: "0 0 15px rgba(251, 191, 36, 0.3)", flexShrink: 0 }}>{dadosGlobais.food?.food || 0}</div>
          </div>
        </div>
      </div>

      <div
        className="food-tab-content"
        style={{
          display: activeTab === "food-history" ? "block" : "none",
          marginTop: "1rem",
          height: "calc(100vh - 190px)",
          maxHeight: "520px",
          overflow: "hidden",
        }}
      >
        <div className="glass-panel" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Log de Transações</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0" }}>Histórico de consumo diário e ajustes.</p>
            </div>
            <button className="btn danger-btn small-btn" style={{ padding: "0.4rem 1rem", fontSize: "0.75rem" }}>Limpar Histórico</button>
          </div>
          <div className="history-table-wrapper" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <table className="history-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, position: "sticky", top: 0, background: "var(--bg-dark)", zIndex: 10 }}>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Dia</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Momento</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Suprimento</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Qtd</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Motivo</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Registro</th>
                </tr>
              </thead>
              <tbody>
                {/* Historico aqui */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
