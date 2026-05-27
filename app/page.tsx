"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundEffects from "@/components/layout/BackgroundEffects";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary mock login logic
    if (email && password) {
      login();
      router.push("/dashboard");
    }
  };

  return (
    <>
      <BackgroundEffects weatherEffect="clear" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: "3rem",
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          <div className="sidebar-logo" style={{ marginBottom: "0", transform: "scale(1.5)" }}>
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2v22"></path>
              <path d="M9.5 2v22"></path>
              <path d="M2 14.5h22"></path>
              <path d="M2 9.5h22"></path>
              <circle cx="12" cy="12" r="7"></circle>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
              RPG Tempo
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Gerenciador de Campanhas
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem" }}>Email (Mock)</label>
              <input
                type="text"
                className="journey-input modern-input"
                style={{ width: "100%" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem" }}>Senha (Mock)</label>
              <input
                type="password"
                className="journey-input modern-input"
                style={{ width: "100%" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn primary-btn"
              style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
            >
              Entrar na Campanha
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
