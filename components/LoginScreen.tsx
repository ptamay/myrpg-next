"use client";

import { useUserSession } from "@/contexts/UserSessionContext";
import { useAppContext } from "@/contexts/AppContext";

export default function LoginScreen() {
  const { login } = useUserSession();
  const { dadosGlobais } = useAppContext();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      padding: "2rem"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "400px",
        width: "100%",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        textAlign: "center"
      }}>
        <h1 className="view-title" style={{ margin: 0, fontSize: "1.5rem", color: "var(--accent-primary)" }}>
          RPG Tempo
        </h1>
        <p className="narrative-text" style={{ margin: 0 }}>
          Selecione como deseja acessar o sistema.
        </p>

        <div style={{ height: "1px", background: "var(--border-subtle)", margin: "0.5rem 0" }} />

        <div>
          <button 
            className="btn primary-btn" 
            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", justifyContent: "center" }}
            onClick={() => login({ role: 'gm' })}
          >
            🎲 Entrar como Mestre
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span className="narrative-label">OU ESCOLHA SEU PERSONAGEM</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {(!dadosGlobais.players || dadosGlobais.players.length === 0) ? (
          <div className="empty-state" style={{ padding: "1rem" }}>
            <p style={{ margin: 0 }}>Nenhum personagem cadastrado.</p>
            <span>Entre como Mestre para criar.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {dadosGlobais.players.map((p: any) => (
              <button
                key={p.id}
                className="clickable-card modern-card"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem", 
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  background: "var(--bg-card)",
                  border: "none",
                  cursor: "pointer",
                  width: "100%"
                }}
                onClick={() => login({ role: 'player', characterId: p.id, characterName: p.name })}
              >
                {p.image ? (
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-bright)" }} 
                  />
                ) : (
                  <div style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "50%", 
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "white",
                    flexShrink: 0
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
