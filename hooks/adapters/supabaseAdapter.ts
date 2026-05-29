// ⚠️ NÃO IMPLEMENTADO
// Quando pronto, trocar UMA linha no useGameData.ts:
//   de:   import { localStorageAdapter as adapter }
//   para: import { supabaseAdapter as adapter }

import { CronicasAdapter } from "./types";

export const supabaseAdapter: CronicasAdapter = {
  getDiarioEntries:  async () => { throw new Error("Supabase adapter not implemented") },
  addDiarioEntry:    async () => { throw new Error("Supabase adapter not implemented") },
  updateDiarioEntry: async () => { throw new Error("Supabase adapter not implemented") },
  deleteDiarioEntry: async () => { throw new Error("Supabase adapter not implemented") },
  getMurais:         async () => { throw new Error("Supabase adapter not implemented") },
  saveMural:         async () => { throw new Error("Supabase adapter not implemented") },
  deleteMural:       async () => { throw new Error("Supabase adapter not implemented") },
};
