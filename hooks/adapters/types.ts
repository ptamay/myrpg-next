import { DiaryEntry, Mural } from "@/types/cronicas";

export interface CronicasAdapter {
  // ── Diário ──────────────────────────────
  getDiarioEntries: ()                    => Promise<DiaryEntry[]>
  addDiarioEntry:   (entry: DiaryEntry)   => Promise<void>
  updateDiarioEntry:(entry: DiaryEntry)   => Promise<void>
  deleteDiarioEntry:(id: string)          => Promise<void>

  // ── Mural ───────────────────────────────
  getMurais:   ()               => Promise<Mural[]>
  saveMural:   (mural: Mural)   => Promise<void>  // cria ou atualiza
  deleteMural: (id: string)     => Promise<void>
}
