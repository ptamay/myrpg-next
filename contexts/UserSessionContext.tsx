"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "@/types/session";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";

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
  const { user } = useAuth();
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          let avatarUrl = '';
          if (data.player_id) {
            const { data: playerData } = await supabase.from('players').select('image_url').eq('id', data.player_id).single();
            if (playerData && playerData.image_url) {
              avatarUrl = supabase.storage.from('images').getPublicUrl(playerData.image_url).data.publicUrl;
            }
          }

          setSession({
            id: user.id,
            name: data.display_name || user.email || 'Usuário',
            email: user.email || '',
            role: data.role as 'gm' | 'player',
            playerId: data.player_id,
            avatarUrl: avatarUrl,
            isOnline: true
          });
        }
      } else {
        setSession(null);
      }
    }
    fetchProfile();
  }, [user]);

  const login = (s: UserSession) => {
    // Agora o login é via Supabase. Esta função é mantida por compatibilidade 
    // com algum mock antigo que possa existir, mas não faz nada efetivo.
    console.warn("login() via UserSessionContext está obsoleto. Use a autenticação do Supabase.");
  };

  const logout = () => {
    // Deslogar deve ser via AuthContext (Supabase).
    console.warn("logout() via UserSessionContext está obsoleto. Use a autenticação do Supabase.");
  };

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
