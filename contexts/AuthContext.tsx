"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextData {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session storage
    const auth = sessionStorage.getItem("myrpg_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = () => {
    sessionStorage.setItem("myrpg_auth", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("myrpg_auth");
    setIsAuthenticated(false);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
