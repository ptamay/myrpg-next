"use client";
import { useState, useEffect, useCallback } from "react";
import { localStorageAdapter as adapter } from "./adapters/localStorageAdapter";
// Migração futura: trocar APENAS a linha acima para supabaseAdapter
import { DiaryEntry, Mural } from "@/types/cronicas";

// ── Diário ───────────────────────────────────────────────
export function useDiario() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adapter.getDiarioEntries().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const add = useCallback(async (entry: DiaryEntry) => {
    await adapter.addDiarioEntry(entry);
    setEntries(prev => [entry, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await adapter.deleteDiarioEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const update = useCallback(async (entry: DiaryEntry) => {
    await adapter.updateDiarioEntry(entry);
    setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
  }, []);

  return { entries, loading, add, update, remove };
}

// ── Murais ───────────────────────────────────────────────
export function useMurais() {
  const [murais, setMurais] = useState<Mural[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adapter.getMurais().then(data => {
      setMurais(data);
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (mural: Mural) => {
    await adapter.saveMural(mural);
    setMurais(prev => {
      const exists = prev.find(m => m.id === mural.id);
      return exists
        ? prev.map(m => m.id === mural.id ? mural : m)
        : [mural, ...prev];
    });
  }, []);

  const remove = useCallback(async (id: string) => {
    await adapter.deleteMural(id);
    setMurais(prev => prev.filter(m => m.id !== id));
  }, []);

  return { murais, loading, save, remove };
}
