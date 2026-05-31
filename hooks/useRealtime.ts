"use client";

import { useEffect, useRef, useState } from "react";
import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

// Este hook escuta as mudanças no banco e dispara callbacks para atualizar o estado local
export function useRealtimeSync(
  supabase: SupabaseClient,
  callbacks: {
    onNpcsChange: () => void;
    onPlayersChange: () => void;
    onCampaignChange: () => void;
    onJourneyChange: () => void;
    onSuppliesChange: () => void;
  }
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const newChannel = supabase.channel(`game-sync`)
      .on(
        "postgres_changes", { event: "*", schema: "public", table: "npcs" },
        () => callbacksRef.current.onNpcsChange()
      )
      .on(
        "postgres_changes", { event: "*", schema: "public", table: "players" },
        () => callbacksRef.current.onPlayersChange()
      )
      .on(
        "postgres_changes", { event: "*", schema: "public", table: "campaign" },
        () => callbacksRef.current.onCampaignChange()
      )
      .on(
        "postgres_changes", { event: "*", schema: "public", table: "journey_blocks" },
        () => callbacksRef.current.onJourneyChange()
      )
      .on(
        "postgres_changes", { event: "*", schema: "public", table: "supplies" },
        () => callbacksRef.current.onSuppliesChange()
      )
      .on("broadcast", { event: "day_passed" }, (payload: any) => {
        window.dispatchEvent(new CustomEvent('day-passed-alert', { detail: payload.payload.newDay }));
      })
      .on("broadcast", { event: "refresh_journey" }, () => callbacksRef.current.onJourneyChange())
      .on("broadcast", { event: "refresh_campaign" }, () => callbacksRef.current.onCampaignChange())
      .on("broadcast", { event: "refresh_players" }, () => callbacksRef.current.onPlayersChange())
      .on("broadcast", { event: "refresh_npcs" }, () => callbacksRef.current.onNpcsChange())
      .on("broadcast", { event: "refresh_supplies" }, () => callbacksRef.current.onSuppliesChange())
      .subscribe();

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [supabase]);

  return channel;
}
