"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlobalData } from "@/lib/gameData";
import { mapDBToNpc, mapDBToPlayer, mapNpcToDB, mapPlayerToDB } from "@/lib/supabase/mappers";

import { useRealtimeSync } from "./useRealtime";

const defaultGlobalData: GlobalData = {
  npcs: [],
  players: [],
  plotPoints: [],
  food: { water: 0, food: 0, people: 0 },
  maps: [],
};

export function useGameSync() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  
  // Local States
  const [diaAtual, setDiaAtualLocal] = useState<number>(1);
  const [indiceBlocoAtivo, setIndiceBlocoAtivoLocal] = useState<number>(0);
  const [dadosGlobais, setDadosGlobaisLocal] = useState<GlobalData>(defaultGlobalData);
  const [jornadaPorDia, setJornadaPorDiaLocal] = useState<Record<number, any>>({});
  const campaignIdRef = useRef<string | null>(null);
  const userProfileRef = useRef<{ role: 'gm' | 'player' | null; playerId: string | null }>({ role: null, playerId: null });

  // Synchronize user profile role/playerId
  useEffect(() => {
    async function updateProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role, player_id').eq('id', user.id).single();
          if (profile) {
            userProfileRef.current = {
              role: profile.role as 'gm' | 'player',
              playerId: profile.player_id
            };
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário para permissões:", err);
      }
      userProfileRef.current = { role: null, playerId: null };
    }

    updateProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateProfile();
      } else {
        userProfileRef.current = { role: null, playerId: null };
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Callbacks para refetch
  const fetchCampaign = useCallback(async () => {
    const { data } = await supabase.from("campaign").select("*").limit(1).single();
    if (data) {
      setDiaAtualLocal(data.current_day);
      setIndiceBlocoAtivoLocal(data.active_block_index);
    }
  }, [supabase]);

  const fetchNpcs = useCallback(async () => {
    const { data } = await supabase.from("npcs").select("*");
    setDadosGlobaisLocal(prev => ({ ...prev, npcs: (data || []).map(mapDBToNpc) }));
  }, [supabase]);

  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase.from("players").select("*");
    setDadosGlobaisLocal(prev => ({ ...prev, players: (data || []).map(mapDBToPlayer) }));
  }, [supabase]);

  const fetchSupplies = useCallback(async () => {
    const { data } = await supabase.from("supplies").select("*").limit(1).single();
    setDadosGlobaisLocal(prev => ({ ...prev, food: data ? { water: data.water, food: data.food, people: data.people } : { water: 0, food: 0, people: 0 } }));
  }, [supabase]);

  const fetchJourney = useCallback(async () => {
    const { data: blocks } = await supabase.from("journey_blocks").select("*, journey_days(day_number)");
    if (blocks && blocks.length > 0) {
      const newJornada: Record<number, any> = {};
      blocks.forEach(block => {
        const dayNum = block.journey_days?.day_number;
        if (dayNum) {
          if (!newJornada[dayNum]) newJornada[dayNum] = { blocos: [] };
          newJornada[dayNum].blocos[block.block_index] = {
            weather: block.weather,
            weatherEffect: block.weather_effect,
            timeline: block.timeline || [],
            plots: block.plots || [],
            sidequests: block.sidequests || [],
            playerSessions: block.player_sessions || {}
          };
        }
      });
      setJornadaPorDiaLocal(newJornada);
    }
  }, [supabase]);

  // Hook de Realtime
  useRealtimeSync({
    onNpcsChange: fetchNpcs,
    onPlayersChange: fetchPlayers,
    onCampaignChange: fetchCampaign,
    onJourneyChange: fetchJourney,
    onSuppliesChange: fetchSupplies,
  });

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // 1. Campaign
        let { data: campaign } = await supabase.from("campaign").select("*").limit(1).single();
        
        // Se não houver campanha, cria a padrão
        if (!campaign) {
          const { data: newCampaign, error } = await supabase.from("campaign")
            .insert({ name: 'Campanha MyRPG', current_day: 1, active_block_index: 0 })
            .select("*").single();
          if (!error && newCampaign) {
            campaign = newCampaign;
          }
        }

        if (campaign) {
          campaignIdRef.current = campaign.id;
          setDiaAtualLocal(campaign.current_day);
          setIndiceBlocoAtivoLocal(campaign.active_block_index);
        }

        // 2. NPCs
        const { data: npcs } = await supabase.from("npcs").select("*");
        // 3. Players
        const { data: players } = await supabase.from("players").select("*");
        // 4. Supplies
        const { data: supplies } = await supabase.from("supplies").select("*").limit(1).single();
        // 5. Maps (metadata only for now)
        const { data: maps } = await supabase.from("maps").select("*");

        setDadosGlobaisLocal({
          npcs: (npcs || []).map(mapDBToNpc),
          players: (players || []).map(mapDBToPlayer),
          plotPoints: [],
          food: supplies ? { water: supplies.water, food: supplies.food, people: supplies.people } : { water: 0, food: 0, people: 0 },
          maps: maps || []
        });

        // 6. Journey Blocks
        const { data: blocks } = await supabase.from("journey_blocks").select("*, journey_days(day_number)");
        if (blocks && blocks.length > 0) {
          const newJornada: Record<number, any> = {};
          blocks.forEach(block => {
            const dayNum = block.journey_days?.day_number;
            if (dayNum) {
              if (!newJornada[dayNum]) newJornada[dayNum] = { blocos: [] };
              newJornada[dayNum].blocos[block.block_index] = {
                weather: block.weather,
                weatherEffect: block.weather_effect,
                timeline: block.timeline || [],
                plots: block.plots || [],
                sidequests: block.sidequests || [],
                playerSessions: block.player_sessions || {}
              };
            }
          });
          setJornadaPorDiaLocal(newJornada);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setters wrap local state update and Supabase mutation
  const setDiaAtual = useCallback((val: number | ((prev: number) => number)) => {
    setDiaAtualLocal(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (campaignIdRef.current) {
        supabase.from("campaign").update({ current_day: next }).eq("id", campaignIdRef.current)
          .then(({ error }) => { if (error) console.error("Erro ao atualizar dia:", error); });
      }
      return next;
    });
  }, [supabase]);

  const setIndiceBlocoAtivo = useCallback((val: number | ((prev: number) => number)) => {
    setIndiceBlocoAtivoLocal(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (campaignIdRef.current) {
        supabase.from("campaign").update({ active_block_index: next }).eq("id", campaignIdRef.current)
          .then(({ error }) => { if (error) console.error("Erro ao atualizar bloco:", error); });
      }
      return next;
    });
  }, [supabase]);

  const setDadosGlobais = useCallback((val: GlobalData | ((prev: GlobalData) => GlobalData)) => {
    setDadosGlobaisLocal(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (!campaignIdRef.current) return next;
      const cid = campaignIdRef.current;
      const { role, playerId } = userProfileRef.current;

      // Sync deltas
      // NPCs
      if (prev.npcs !== next.npcs && role === 'gm') {
        if (next.npcs.length > 0) {
          const mappedNpcs = next.npcs.map(n => mapNpcToDB(n, cid));
          supabase.from("npcs").upsert(mappedNpcs).then(({ error }) => {
            if (error) {
              console.error("Erro ao salvar NPCs no Supabase:", error.message, error.code, error.details);
              alert(`Erro do banco de dados ao salvar NPC: ${error.message} (Código: ${error.code})`);
            }
          });
        }
        
        const prevIds = prev.npcs.map(n => n.id);
        const nextIds = new Set(next.npcs.map(n => n.id));
        const deletedIds = prevIds.filter(id => !nextIds.has(id));
        if (deletedIds.length > 0) {
          supabase.from("npcs").delete().in("id", deletedIds).then(({ error }) => {
            if (error) console.error("Erro ao deletar NPCs no Supabase:", error);
          });
        }
      }
      // Players
      if (prev.players !== next.players) {
        if (next.players.length > 0) {
          const mappedPlayers = next.players.map(p => mapPlayerToDB(p, cid));
          if (role === 'gm') {
            supabase.from("players").upsert(mappedPlayers).then(({ error }) => {
              if (error) {
                console.error("Erro ao salvar players no Supabase (GM):", error.message, error.code, error.details);
                alert(`Erro do banco de dados ao salvar Player: ${error.message} (Código: ${error.code})`);
              }
            });
          } else if (role === 'player' && playerId) {
            const myPlayer = mappedPlayers.find(p => p.id === playerId);
            if (myPlayer) {
              supabase.from("players").update(myPlayer).eq("id", playerId).then(({ error }) => {
                if (error) {
                  console.error("Erro ao salvar player no Supabase (Player):", error.message, error.code, error.details);
                  alert(`Erro do banco de dados ao salvar seu Player: ${error.message} (Código: ${error.code})`);
                }
              });
            }
          }
        }

        const prevIds = prev.players.map(p => p.id);
        const nextIds = new Set(next.players.map(p => p.id));
        const deletedIds = prevIds.filter(id => !nextIds.has(id));
        if (deletedIds.length > 0 && role === 'gm') {
          supabase.from("players").delete().in("id", deletedIds).then(({ error }) => {
            if (error) console.error("Erro ao deletar players no Supabase:", error);
          });
        }
      }
      // Food
      if (prev.food !== next.food && role === 'gm') {
        supabase.from("supplies").upsert({
          campaign_id: cid,
          water: next.food.water,
          food: next.food.food,
          people: next.food.people
        }, { onConflict: 'campaign_id' }).then(({ error }) => {
          if (error) console.error("Erro ao salvar suprimentos:", error);
        });
      }
      
      return next;
    });
  }, [supabase]);

  const setJornadaPorDia = useCallback((val: Record<number, any> | ((prev: Record<number, any>) => Record<number, any>)) => {
    setJornadaPorDiaLocal(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (!campaignIdRef.current) return next;
      const cid = campaignIdRef.current;
      const { role } = userProfileRef.current;

      // Sync all modified days
      const allDays = new Set([
        ...Object.keys(prev).map(Number),
        ...Object.keys(next).map(Number)
      ]);

      allDays.forEach(day => {
        if (prev[day] !== next[day] && next[day] && next[day].blocos && role === 'gm') {
          syncJourneyToSupabase(cid, day, next[day].blocos, supabase);
        }
      });
      return next;
    });
  }, [supabase]);

  return {
    diaAtual,
    setDiaAtual,
    indiceBlocoAtivo,
    setIndiceBlocoAtivo,
    dadosGlobais,
    setDadosGlobais,
    jornadaPorDia,
    setJornadaPorDia,
    loading
  };
}

// Helper to sync journey blocks
async function syncJourneyToSupabase(campaignId: string, dayNumber: number, blocos: any[], supabase: any) {
  try {
    // 1. Upsert day
    const { data: dayData } = await supabase.from("journey_days")
      .upsert({ campaign_id: campaignId, day_number: dayNumber }, { onConflict: 'campaign_id,day_number' })
      .select('id').single();

    if (!dayData) return;

    // 2. Upsert blocks
    const mappedBlocks = blocos.map((b, index) => ({
      day_id: dayData.id,
      block_index: index,
      weather: b?.weather || 'clear',
      weather_effect: b?.weatherEffect || 'clear',
      timeline: b?.timeline || [],
      plots: b?.plots || [],
      sidequests: b?.sidequests || [],
      player_sessions: b?.playerSessions || {}
    }));

    await supabase.from("journey_blocks").upsert(mappedBlocks, { onConflict: 'day_id,block_index' });
    supabase.channel('game-sync').send({ type: 'broadcast', event: 'refresh_journey' });
  } catch (error) {
    console.error("Erro ao sincronizar jornada:", error);
  }
}
