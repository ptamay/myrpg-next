"use client";

import { useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

// Este hook escuta as mudanças no banco e dispara callbacks para atualizar o estado local
export function useRealtimeSync(callbacks: {
  onNpcsChange: () => void;
  onPlayersChange: () => void;
  onCampaignChange: () => void;
  onJourneyChange: () => void;
  onSuppliesChange: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);

  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const channel = supabase.channel(`game-sync`)
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
}
