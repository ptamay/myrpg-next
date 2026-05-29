"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "@/types/session";

interface UserSessionContextData {
  session: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
  isGM: boolean;
  isPlayer: boolean;
}

const UserSessionContext = createContext<UserSessionContextData>({} as UserSessionContextData);
const SESSION_KEY = "myrpg_user_session";

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setSession(JSON.parse(saved)); } catch { /* ignorar */ }
    }
    setMounted(true);
  }, []);

  const login = (s: UserSession) => {
    setSession(s);
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!mounted) return null;

  return (
    <UserSessionContext.Provider value={{
      session, login, logout,
      isGM: session?.role === 'gm',
      isPlayer: session?.role === 'player',
    }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export const useUserSession = () => useContext(UserSessionContext);
