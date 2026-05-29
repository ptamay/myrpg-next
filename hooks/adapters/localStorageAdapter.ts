import { CronicasAdapter } from "./types";
import { DiaryEntry, Mural } from "@/types/cronicas";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
      window.dispatchEvent(new CustomEvent("system-alert", {
        detail: {
          title: "Limite Excedido",
          message: "⚠️ Limite de armazenamento local excedido! O diário ou mural tem muitos dados (provavelmente imagens pesadas). Apague itens antigos ou use imagens mais leves para conseguir salvar.",
          type: "danger"
        }
      }));
    } else {
      console.error("Erro ao salvar no localStorage:", error);
    }
  }
}

export const localStorageAdapter: CronicasAdapter = {
  // ── Diário ──────────────────────────────────────────────
  getDiarioEntries: async () =>
    read<DiaryEntry[]>("myrpg_diario_entries", []),

  addDiarioEntry: async (entry) => {
    const current = read<DiaryEntry[]>("myrpg_diario_entries", []);
    write("myrpg_diario_entries", [entry, ...current]);
  },

  updateDiarioEntry: async (entry) => {
    const current = read<DiaryEntry[]>("myrpg_diario_entries", []);
    write("myrpg_diario_entries", current.map(e => e.id === entry.id ? entry : e));
  },

  deleteDiarioEntry: async (id) => {
    const current = read<DiaryEntry[]>("myrpg_diario_entries", []);
    write("myrpg_diario_entries", current.filter(e => e.id !== id));
  },

  // ── Mural ────────────────────────────────────────────────
  getMurais: async () =>
    read<Mural[]>("myrpg_murais", []),

  saveMural: async (mural) => {
    const current = read<Mural[]>("myrpg_murais", []);
    const exists = current.find(m => m.id === mural.id);
    write("myrpg_murais",
      exists
        ? current.map(m => m.id === mural.id ? mural : m)
        : [mural, ...current]
    );
  },

  deleteMural: async (id) => {
    const current = read<Mural[]>("myrpg_murais", []);
    write("myrpg_murais", current.filter(m => m.id !== id));
  },
};
