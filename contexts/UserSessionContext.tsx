"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "@/types/session";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";

interface UserSessionContextData {
  session: UserSession | null;
  isGM: boolean;
  isPlayer: boolean;
}

const UserSessionContext = createContext<UserSessionContextData>({} as UserSessionContextData);

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase.from('profiles').select('display_name, role, player_id').eq('id', user.id).single();
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

  return (
    <UserSessionContext.Provider value={{
      session,
      isGM: session?.role === 'gm',
      isPlayer: session?.role === 'player',
    }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export const useUserSession = () => useContext(UserSessionContext);
