"use client";
import { useState, useEffect, useCallback } from "react";
import { supabaseAdapter as adapter } from "./adapters/supabaseAdapter";
import { DiaryEntry, Mural } from "@/types/cronicas";
import { createClient } from "@/lib/supabase/client";

// ── Diário ───────────────────────────────────────────────
export function useDiario() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const data = await adapter.getDiarioEntries();
      setEntries(data);
    } catch (error) {
      console.error("Erro ao buscar diário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();

    const supabase = createClient();
    const channel = supabase.channel(`diary_sync_${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "diary_entries" }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEntries]);

  const add = useCallback(async (entry: DiaryEntry) => {
    try {
      await adapter.addDiarioEntry(entry);
      setEntries(prev => [entry, ...prev]);
    } catch (e: any) { alert("Erro ao salvar diário: " + (e.message || JSON.stringify(e))); }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await adapter.deleteDiarioEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e: any) { alert("Erro ao deletar: " + (e.message || JSON.stringify(e))); }
  }, []);

  const update = useCallback(async (entry: DiaryEntry) => {
    try {
      await adapter.updateDiarioEntry(entry);
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    } catch (e: any) { alert("Erro ao atualizar diário: " + (e.message || JSON.stringify(e))); }
  }, []);

  return { entries, loading, add, update, remove };
}

// ── Murais ───────────────────────────────────────────────
export function useMurais() {
  const [murais, setMurais] = useState<Mural[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMurais = useCallback(async () => {
    try {
      const data = await adapter.getMurais();
      setMurais(data);
    } catch (error) {
      console.error("Erro ao buscar murais:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMurais();

    const supabase = createClient();
    const channel = supabase.channel(`murals_sync_${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "murals" }, () => { fetchMurais(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "mural_cards" }, () => { fetchMurais(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "mural_connections" }, () => { fetchMurais(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMurais]);

  const save = useCallback(async (mural: Mural) => {
    try {
      await adapter.saveMural(mural);
      setMurais(prev => {
        const exists = prev.find(m => m.id === mural.id);
        return exists
          ? prev.map(m => m.id === mural.id ? mural : m)
          : [mural, ...prev];
      });
    } catch (error: any) {
      console.error("Erro ao salvar mural:", error);
      alert("Falha de segurança ou erro no banco de dados ao tentar salvar o mural. " + (error.message || JSON.stringify(error)));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await adapter.deleteMural(id);
      setMurais(prev => prev.filter(m => m.id !== id));
    } catch (e: any) { alert("Erro ao deletar: " + (e.message || JSON.stringify(e))); }
  }, []);

  return { murais, loading, save, remove };
}
