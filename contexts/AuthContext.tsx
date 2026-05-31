"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { UserSession } from "@/types/session";

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  userProfile: UserSession | null;
  isGM: boolean;
  isPlayer: boolean;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchProfile = async (currentUser: User | null) => {
      if (!currentUser) {
        setUserProfile(null);
        return;
      }
      try {
        const { data, error } = await supabase.from('profiles').select('display_name, role, player_id').eq('id', currentUser.id).single();
        
        if (error) {
          console.error("Erro na query de profiles:", error);
          return;
        }

        if (data) {
          let avatarUrl = '';
          if (data.player_id) {
            const { data: playerData } = await supabase.from('players').select('image_url').eq('id', data.player_id).single();
            if (playerData && playerData.image_url) {
              avatarUrl = supabase.storage.from('images').getPublicUrl(playerData.image_url).data.publicUrl;
            }
          }
          setUserProfile({
            id: currentUser.id,
            name: data.display_name || 'Jogador',
            email: currentUser.email || '',
            role: data.role as 'gm' | 'player',
            playerId: data.player_id,
            avatarUrl: avatarUrl,
            isOnline: true
          });
        }
      } catch (err) {
        console.error("Erro interno ao buscar perfil:", err);
      }
    };

    let isInitialized = false;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setSession(session);
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        await fetchProfile(currentUser);
      } catch (error) {
        console.error("Erro ao verificar sessão Supabase:", error);
      } finally {
        if (!isInitialized) {
          isInitialized = true;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Safety timeout: after 3s, force loading=false regardless
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn("AuthContext timeout: Forcing loading to false.");
        isInitialized = true;
        setLoading(false);
      }
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;
        setSession(session);
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        await fetchProfile(currentUser);
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  };

  // IMPORTANT: Do NOT block rendering with a loading screen here.
  // The Next.js middleware already validates auth server-side.
  // Blocking here causes infinite loading if the Supabase client
  // takes too long to initialize (network issues, cookie parsing, etc.)
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, user, session, logout, loading,
      userProfile, isGM: userProfile?.role === 'gm', isPlayer: userProfile?.role === 'player'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
