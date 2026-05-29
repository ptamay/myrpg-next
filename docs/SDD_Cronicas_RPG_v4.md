# SDD — Aba "Crônicas" (v4)

**Sistema:** RPG Tempo — Gerenciador do Mestre  
**Versão:** 4.0 — Escopo final: Diário de Bordo + Mural de Investigação  
**Ferramenta alvo:** Antigravity (Next.js + CSS Vanilla)  
**Estilo:** CSS Vanilla com `globals.css` — sem Tailwind, sem CSS Modules
**Última atualização:** Maio 2026

> **Escopo confirmado:** Códice da Campanha removido. A aba Crônicas contém
> apenas **Diário de Bordo** e **Mural de Investigação**.

---

## Decisões de Arquitetura (NÃO alterar sem revisar o documento)

### 1. Navegação — sem rotas do Next.js

O sistema usa `activeView` no `AppShell.tsx`, não `router.push`. Padrão:

```tsx
// AppShell.tsx — adicionar junto com as views existentes
import CronicasView from "../views/CronicasView";

<div style={{ display: activeView === "view-cronicas" ? "block" : "none", height: "100%" }}>
  <CronicasView />
</div>
```

```tsx
// Sidebar.tsx — novo nav-tab
<button
  className={`nav-tab ${activeView === "view-cronicas" ? "active" : ""}`}
  onClick={() => setActiveView("view-cronicas")}
>
  <svg>/* ícone de pergaminho */</svg>
  <span>CRÔNICAS</span>
</button>
```

### 2. Persistência — `useLocalStorage` agora, Supabase depois

A Fase 0 cria uma camada de abstração (`adapter`) que hoje usa `localStorage`.
Quando chegar o Supabase, troca-se **uma linha** no `useGameData.ts` e os
componentes não mudam.

### 3. Sessão leve — GM ou Jogador

A Fase 0.5 cria o `UserSessionContext`. Hoje persiste em `localStorage`;
no futuro troca por `supabase.auth` sem tocar nos componentes.

### 4. `authorId` no `DiaryEntry`

Referencia o `id` do personagem em `dadosGlobais.players`. Suficiente agora;
o Supabase associará ao user real depois.

### 5. Mural — apenas GM edita, Jogador visualiza

Jogador pode fazer pan e zoom no Mural, mas não cria cards nem conexões.
A toolbar de edição é renderizada condicionalmente com `{isGM && <MuralToolbar />}`.

### 6. Tipo de card `'lore'` removido do Mural

Sem o Códice, não existe `LoreEntry`. O tipo `MuralCardType` não tem mais `'lore'`.
Cards que referenciariam lore viram `'nota'` com texto livre.

### 7. Ordem de implementação

```
Fase 0    → Camada de abstração de dados (adapter + useGameData)
Fase 0.5  → UserSessionContext (sessão leve gm/player)
Sprint 1  → Diário de Bordo
Sprint 2  → Mural parte A (canvas + drag + SVG)
Sprint 3  → Mural parte B (conexões + formulários + persistência)
Sprint 4  → Visão do Jogador: NPC Resumido (NpcCardPlayer)
```

---

## Tabs visíveis por role

| Aba | GM | Jogador |
|---|---|---|
| Dashboard | ✅ Completo | ✅ Simplificado |
| NPCs | ✅ Completo | ✅ Card resumido |
| Jogadores | ✅ | ❌ Oculta |
| Sessões / Jornada | ✅ | ❌ Oculta |
| Configurações | ✅ | ❌ Oculta |
| **Crônicas** | ✅ Completo | ✅ Com restrições |

**Crônicas por role:**

| Sub-aba | GM | Jogador |
|---|---|---|
| Diário | Lê tudo, cria, deleta qualquer entrada | Lê tudo, cria com `authorId = characterId` |
| Mural | Lê, cria cards, cria conexões, edita, deleta | Somente leitura (pan + zoom) |

---

## Design System (extraído do globals.css real)

```css
/* Usar APENAS estas variáveis — não inventar outras */
--bg-base: hsl(240, 10%, 4%)
--bg-card: hsla(240, 10%, 8%, 0.7)
--bg-card-hover: hsla(240, 10%, 12%, 0.85)

--accent-primary:   /* DINÂMICO — muda conforme bloco de tempo */
--accent-glow:      /* DINÂMICO */
--accent-secondary: /* DINÂMICO */

--text-primary:   hsl(0, 0%, 98%)
--text-secondary: hsl(240, 5%, 70%)
--text-muted:     hsl(240, 4%, 45%)

--border-subtle: hsla(240, 5%, 20%, 0.5)
--border-bright: hsla(240, 5%, 40%, 0.3)

--success: hsl(150, 80%, 50%)
--danger:  hsl(0, 84%, 60%)
--warning: hsl(45, 93%, 58%)

--radius-sm: 8px  |  --radius-md: 14px  |  --radius-lg: 24px
--transition-fast: 0.2s cubic-bezier(0.2, 0, 0, 1)
--transition-base: 0.4s cubic-bezier(0.2, 0, 0, 1)
--shadow-premium: 0 20px 40px -10px rgba(0,0,0,0.7)
--glass-blur: 20px
```

**Classes reutilizáveis (já existem no globals.css):**

| Classe | Uso |
|---|---|
| `glass-panel` | Painel glassmorphism |
| `btn primary-btn` | Botão primário com gradiente accent |
| `btn secondary-btn` | Botão secundário sutil |
| `btn danger-btn` | Ação destrutiva |
| `journey-input` | Input padrão |
| `modern-input` | Input compacto |
| `form-textarea` | Textarea redimensionável |
| `filter-tag` / `filter-tag active` | Pills de filtro |
| `section-title` | Título com diamante laranja |
| `narrative-label` | Label uppercase âmbar 0.65rem |
| `narrative-text` | Texto secundário 0.9rem |
| `empty-state` | Estado vazio com borda dashed |
| `scrollable-area` | Scroll estilizado |
| `modern-card` / `clickable-card` | Card com hover |
| `ghost-delete-btn` | Delete invisível até hover |
| `ghost-add-btn` | Add invisível com hover âmbar |
| `nav-btn` | Botão circular de navegação |
| `npc-view-container` | Layout de view completa |
| `sticky-npc-header` | Header com sticky + blur |
| `small-btn` | Modificador de tamanho para `.btn` |

---

## Estrutura de arquivos a criar

```
/types/
  cronicas.ts               ← DiaryEntry, MuralCard, MuralConnection, Mural
  session.ts                ← UserRole, UserSession

/contexts/
  UserSessionContext.tsx    ← Sessão leve GM/Player

/hooks/
  useGameData.ts            ← useDiario, useMurais
  adapters/
    types.ts                ← Interface CronicasAdapter
    localStorageAdapter.ts  ← Implementação atual
    supabaseAdapter.ts      ← Esqueleto vazio (preencher depois)

/components/
  LoginScreen.tsx
  views/
    CronicasView.tsx        ← Sub-tabs: Diário | Mural
  cronicas/
    diario/
      DiarioFeed.tsx
      DiarioEntryCard.tsx
      DiarioEntryForm.tsx
    mural/
      MuralCanvas.tsx
      MuralCard.tsx
      MuralConnectionLayer.tsx
      MuralToolbar.tsx
      MuralCardForm.tsx
  npcs/
    NpcCardPlayer.tsx

/lib/
  cronicasData.ts           ← Dados mock para desenvolvimento
```

---

## Types (`/types/cronicas.ts`)

```typescript
// ─── DIÁRIO ─────────────────────────────────────────────
export interface DiaryEntry {
  id: string
  sessionNumber: number    // Ex: 14
  sessionTitle: string     // Ex: "A Fuga do Templo"
  authorId: string         // ID de dadosGlobais.players[n].id
  authorName: string       // Cache do nome para exibição
  content: string          // Texto livre
  imageUrl?: string        // base64 ou URL (upload local)
  createdAt: string        // ISO string (Date serializa mal no localStorage)
  likes: string[]          // Array de authorId — comentários são escopo futuro
}

// ─── MURAL ──────────────────────────────────────────────
export type MuralCardType =
  | 'nota'      // Texto livre (post-it)
  | 'npc'       // Referência a NPC do sistema
  | 'artefato'  // Item físico com imagem
  | 'teoria'    // Hipótese do grupo
  | 'retrato'   // Imagem + nome (pessoa sem NPC cadastrado)

export interface MuralCard {
  id: string
  muralId: string
  type: MuralCardType
  title: string
  content?: string
  imageUrl?: string
  refId?: string                    // ID do NPC se type === 'npc'
  position: { x: number; y: number }
  createdBy: string                 // 'gm' ou characterId
  createdAt: string
}

export interface MuralConnection {
  id: string
  muralId: string
  fromCardId: string
  toCardId: string
  label?: string   // Ex: "suspeito de", "localizado em"
  color?: string   // Padrão: var(--accent-primary)
}

export interface Mural {
  id: string
  name: string
  cards: MuralCard[]
  connections: MuralConnection[]
  createdAt: string
}
```

---

## Types (`/types/session.ts`)

```typescript
export type UserRole = 'gm' | 'player';

export interface UserSession {
  role: UserRole;
  characterId?: string;    // ID em dadosGlobais.players — só para 'player'
  characterName?: string;  // Cache do nome para exibição
}
```

---

## FASE 0 — Camada de Abstração de Dados

**Complexidade:** Baixa-Média | **Estimativa:** 1 dia | **Fazer antes de tudo**

### Por que

```
SEM abstração (frágil):           COM abstração (robusto):
  DiarioFeed                        DiarioFeed
    → useLocalStorage(...)            → useDiario()
  MuralCanvas                                ↓
    → useLocalStorage(...)          useGameData.ts
                                      → localStorageAdapter  ← trocar por supabase aqui
```

### `/hooks/adapters/types.ts`

```typescript
import { DiaryEntry, Mural } from "@/types/cronicas";

export interface CronicasAdapter {
  // ── Diário ──────────────────────────────
  getDiarioEntries: ()                    => Promise<DiaryEntry[]>
  addDiarioEntry:   (entry: DiaryEntry)   => Promise<void>
  deleteDiarioEntry:(id: string)          => Promise<void>

  // ── Mural ───────────────────────────────
  getMurais:   ()               => Promise<Mural[]>
  saveMural:   (mural: Mural)   => Promise<void>  // cria ou atualiza
  deleteMural: (id: string)     => Promise<void>
}
```

### `/hooks/adapters/localStorageAdapter.ts`

```typescript
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
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStorageAdapter: CronicasAdapter = {
  // ── Diário ──────────────────────────────────────────────
  getDiarioEntries: async () =>
    read<DiaryEntry[]>("myrpg_diario_entries", []),

  addDiarioEntry: async (entry) => {
    const current = read<DiaryEntry[]>("myrpg_diario_entries", []);
    write("myrpg_diario_entries", [entry, ...current]);
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
```

### `/hooks/adapters/supabaseAdapter.ts` (esqueleto — não implementar agora)

```typescript
// ⚠️ NÃO IMPLEMENTADO
// Quando pronto, trocar UMA linha no useGameData.ts:
//   de:   import { localStorageAdapter as adapter }
//   para: import { supabaseAdapter as adapter }

import { CronicasAdapter } from "./types";

export const supabaseAdapter: CronicasAdapter = {
  getDiarioEntries:  async () => { throw new Error("Supabase adapter not implemented") },
  addDiarioEntry:    async () => { throw new Error("Supabase adapter not implemented") },
  deleteDiarioEntry: async () => { throw new Error("Supabase adapter not implemented") },
  getMurais:         async () => { throw new Error("Supabase adapter not implemented") },
  saveMural:         async () => { throw new Error("Supabase adapter not implemented") },
  deleteMural:       async () => { throw new Error("Supabase adapter not implemented") },
};
```

### `/hooks/useGameData.ts`

```typescript
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

  return { entries, loading, add, remove };
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
```

### Checklist Fase 0

- [ ] Criar `/types/cronicas.ts`
- [ ] Criar `/types/session.ts`
- [ ] Criar `/hooks/adapters/types.ts`
- [ ] Criar `/hooks/adapters/localStorageAdapter.ts`
- [ ] Criar `/hooks/adapters/supabaseAdapter.ts` (só esqueleto)
- [ ] Criar `/hooks/useGameData.ts` com `useDiario` e `useMurais`
- [ ] Testar leitura e escrita via hooks no browser
- [ ] **NÃO alterar o AppContext existente** — ele continua intacto

---

## FASE 0.5 — UserSessionContext

**Complexidade:** Baixa | **Estimativa:** 0.5 dia | **Fazer antes dos Sprints**

### `/contexts/UserSessionContext.tsx`

```typescript
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "@/types/session";

interface UserSessionContextData {
  session: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
  isGM: boolean;
  isPlayer: boolean;
}

const UserSessionContext = createContext<UserSessionContextData>({} as UserSessionContextData);
const SESSION_KEY = "myrpg_user_session";

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setSession(JSON.parse(saved)); } catch { /* ignorar */ }
    }
    setMounted(true);
  }, []);

  const login = (s: UserSession) => {
    setSession(s);
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!mounted) return null;

  return (
    <UserSessionContext.Provider value={{
      session, login, logout,
      isGM: session?.role === 'gm',
      isPlayer: session?.role === 'player',
    }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export const useUserSession = () => useContext(UserSessionContext);
```

### `/components/LoginScreen.tsx` — estrutura

```tsx
// Exibido quando session === null
// Layout (glass-panel centralizado):
//
//   [Logo RPG Tempo]
//   ─── Entrar como ───
//
//   [Botão grande] "🎲 Mestre"
//      → login({ role: 'gm' })
//
//   ── ou escolha seu personagem ──
//
//   [Lista de dadosGlobais.players]:
//     [avatar] Nome (playerName)
//     → login({ role: 'player', characterId: p.id, characterName: p.name })
//
//   Se players vazio: "Nenhum personagem cadastrado. Entre como Mestre para criar."
//
// Usar: glass-panel, journey-input (se precisar de senha futura), btn primary-btn
```

### Integração no layout raiz

```tsx
// layout.tsx ou AppShell.tsx — envolver com o provider
<UserSessionProvider>
  {session === null
    ? <LoginScreen />
    : <AppShell />
  }
</UserSessionProvider>
```

### Como migrar para Supabase Auth depois

```
1. Implementar auth no Supabase (email/magic link)
2. No UserSessionContext, trocar o useEffect de localStorage por:
     const { data: { session } } = await supabase.auth.getSession()
3. Componentes NÃO mudam — continuam usando useUserSession()
```

### Checklist Fase 0.5

- [ ] Criar `/types/session.ts` (se não criado na Fase 0)
- [ ] Criar `/contexts/UserSessionContext.tsx`
- [ ] Criar `/components/LoginScreen.tsx`
- [ ] Adicionar `UserSessionProvider` no layout raiz
- [ ] Testar login como GM
- [ ] Testar login como jogador (com personagem existente)
- [ ] Testar logout e retorno à tela de login

---

## CronicasView.tsx

```tsx
// /components/views/CronicasView.tsx
"use client";
import { useState } from "react";
import { useUserSession } from "@/contexts/UserSessionContext";
import DiarioFeed from "../cronicas/diario/DiarioFeed";
import MuralCanvas from "../cronicas/mural/MuralCanvas";

type CronicasTab = "diario" | "mural";

export default function CronicasView() {
  const [activeTab, setActiveTab] = useState<CronicasTab>("diario");

  const tabs: { id: CronicasTab; label: string }[] = [
    { id: "diario", label: "Diário de Bordo" },
    { id: "mural", label: "Mural de Investigação" },
  ];

  return (
    <div className="npc-view-container">
      <div className="npc-header glass-panel">
        <div>
          <h2 className="view-title">Crônicas</h2>
          <p className="view-subtitle">Registros e investigações da campanha.</p>
        </div>
        <div className="filter-tags">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-tag ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {activeTab === "diario" && <DiarioFeed />}
        {activeTab === "mural" && <MuralCanvas />}
      </div>
    </div>
  );
}
```

---

## SPRINT 1 — Diário de Bordo

**Complexidade:** Baixa | **Estimativa:** 1–2 dias | **Dependências:** Nenhuma nova

### O que é

Feed cronológico por sessão. Cada entrada tem autor, texto e imagem opcional.
Agrupado por `sessionNumber` (decrescente). Jogadores criam entradas com seu
`characterId`; GM cria como "Mestre".

### DiarioFeed.tsx

```tsx
"use client";
import { useState } from "react";
import { useDiario } from "@/hooks/useGameData";
import { useUserSession } from "@/contexts/UserSessionContext";
import { DiaryEntry } from "@/types/cronicas";
import DiarioEntryCard from "./DiarioEntryCard";
import DiarioEntryForm from "./DiarioEntryForm";

export default function DiarioFeed() {
  const { entries, add, remove } = useDiario();
  const { isGM, session } = useUserSession();
  const [showForm, setShowForm] = useState(false);

  // Agrupar por sessão, decrescente
  const grouped = entries
    .slice()
    .sort((a, b) => b.sessionNumber - a.sessionNumber)
    .reduce<Record<number, DiaryEntry[]>>((acc, e) => {
      if (!acc[e.sessionNumber]) acc[e.sessionNumber] = [];
      acc[e.sessionNumber].push(e);
      return acc;
    }, {});

  // Qualquer um com sessão ativa pode criar
  const canCreate = isGM || !!session?.characterId;

  return (
    <div className="npc-view-container" style={{ padding: "1.5rem" }}>

      {/* Header sticky */}
      <div className="sticky-npc-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="section-title">Diário de Bordo</h3>
          {canCreate && (
            <button
              className="btn primary-btn small-btn"
              onClick={() => setShowForm(v => !v)}
            >
              + Nova Entrada
            </button>
          )}
        </div>
        {showForm && (
          <DiarioEntryForm
            defaultAuthorId={session?.characterId ?? "gm"}
            defaultAuthorName={session?.characterName ?? "Mestre"}
            onSubmit={async (entry) => { await add(entry); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      {/* Feed */}
      <div className="scrollable-area" style={{ flex: 1 }}>
        {Object.keys(grouped).length === 0 && (
          <div className="empty-state">
            <p>Nenhum registro ainda.</p>
            <span>Clique em "+ Nova Entrada" para começar.</span>
          </div>
        )}
        {Object.entries(grouped).map(([sessionNum, sessionEntries]) => (
          <div key={sessionNum} style={{ marginBottom: "2rem" }}>
            {/* Divider de sessão */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: "1rem", marginBottom: "1rem",
            }}>
              <span className="narrative-label">
                Sessão {sessionNum}
                {sessionEntries[0]?.sessionTitle && ` · ${sessionEntries[0].sessionTitle}`}
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </div>
            {/* Entradas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sessionEntries.map(entry => (
                <DiarioEntryCard
                  key={entry.id}
                  entry={entry}
                  canDelete={isGM || entry.authorId === session?.characterId}
                  onDelete={id => remove(id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### DiarioEntryCard.tsx — estrutura visual

```tsx
// Container: glass-panel com padding 1.25rem, border-radius radius-md
// Hover: border-color var(--accent-primary), transform translateY(-2px)
//
// Layout:
// ┌──────────────────────────────────────────────────┐
// │ [avatar 36px circular]  authorName    tempo atrás │
// │                                    [🗑 ghost-btn] │
// ├──────────────────────────────────────────────────┤
// │ content (narrative-text, white-space: pre-wrap)  │
// │ [imagem se houver — border-radius md, max-h 300] │
// └──────────────────────────────────────────────────┘
//
// avatar: se player tem image → <img>; senão → inicial do nome
//         fundo: linear-gradient(135deg, accent-primary, accent-secondary)
//
// ghost-delete-btn: só renderizar se canDelete === true
//   → confirm antes de chamar onDelete
//
// tempo atrás: calcular a partir de entry.createdAt
//   ex: "2m", "3h", "ontem"
```

### DiarioEntryForm.tsx — estrutura

```tsx
// Container: glass-panel, padding 1.5rem, margin-top 1rem
// Campos (todos controlled com useState, NÃO usar <form>):
//
//   sessionNumber:  <input type="number" className="journey-input modern-input">
//   sessionTitle:   <input type="text"   className="journey-input modern-input">
//   content:        <textarea            className="form-textarea" rows={4}>
//   image:          <input type="file"   accept="image/*">
//                   preview via URL.createObjectURL — mostrar thumbnail 80px
//
// Botões:
//   [Publicar]  → btn primary-btn — chama onSubmit com DiaryEntry montado
//   [Cancelar]  → btn secondary-btn — chama onCancel
//
// Submit monta o objeto:
//   {
//     id: crypto.randomUUID(),
//     sessionNumber, sessionTitle, content, imageUrl,
//     authorId: defaultAuthorId,
//     authorName: defaultAuthorName,
//     createdAt: new Date().toISOString(),
//     likes: [],
//   }
//
// imageUrl: converter para base64 via FileReader se quiser persistir no localStorage
//   (base64 ocupa mais espaço — aceitar o tradeoff agora, trocar por Storage URL no Supabase depois)
```

### Checklist Sprint 1

- [ ] Criar `/lib/cronicasData.ts` com `mockDiarioEntries` (ver seção de mocks)
- [ ] `CronicasView.tsx` com sub-tabs Diário | Mural (usar mocks por enquanto)
- [ ] Adicionar `view-cronicas` no `AppShell.tsx`
- [ ] Adicionar nav-tab no `Sidebar.tsx`
- [ ] `DiarioFeed.tsx` com agrupamento por sessão
- [ ] `DiarioEntryCard.tsx` com ghost-delete-btn condicional
- [ ] `DiarioEntryForm.tsx` com campos e preview de imagem
- [ ] Conectar ao `useDiario()` e remover mocks

---

## SPRINT 2 — Mural de Investigação (parte A)

**Complexidade:** Alta | **Estimativa:** 3–4 dias

```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

### Etapas internas (seguir a ordem — não pular)

**Etapa 2.1 — Canvas estático**
```tsx
// MuralCanvas.tsx com cards em posições fixas via position: absolute
// Sem drag, sem conexões — apenas renderização visual
// Usar dados mock para visualizar layout
// Fundo do canvas: grid de pontos com background-image radial-gradient
```

**Etapa 2.2 — Drag & Drop**
```tsx
// npm install @dnd-kit/core @dnd-kit/utilities
// MuralCard: usar useDraggable()
// Canvas: usar useDroppable()
//
// CRÍTICO: mover com transform: translate(x, y) — NÃO usar top/left
// Motivo: evita reflow e mantém performance com 20+ cards
//
// onDragEnd: atualizar card.position no array, salvar com debounce de 1s
```

**Etapa 2.3 — SVG de conexões (visualização apenas)**
```tsx
// MuralConnectionLayer.tsx renderiza <svg> sobre o canvas (position: absolute, inset: 0)
// Para cada MuralConnection, calcular centro dos dois cards e desenhar <path>
//
// Bezier:
function getBezierPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const cx = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${cx} ${from.y}, ${cx} ${to.y}, ${to.x} ${to.y}`;
}
//
// Estilo da linha:
//   stroke: var(--accent-primary)
//   stroke-opacity: 0.7
//   stroke-width: 2
//   fill: none
//
// Performance: envolver em useMemo — só recalcular quando cards ou connections mudar
// pointer-events: none no SVG (não bloquear drag dos cards)
```

### MuralCanvas.tsx — estrutura geral

```tsx
"use client";
import { useState, useMemo, useRef, useCallback } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useMurais } from "@/hooks/useGameData";
import { useUserSession } from "@/contexts/UserSessionContext";
import { Mural, MuralCard as MuralCardType } from "@/types/cronicas";
import MuralCard from "./MuralCard";
import MuralConnectionLayer from "./MuralConnectionLayer";
import MuralToolbar from "./MuralToolbar";

export default function MuralCanvas() {
  const { murais, save } = useMurais();
  const { isGM } = useUserSession();

  const [activeMuralId, setActiveMuralId] = useState<string | null>(
    murais[0]?.id ?? null
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const mural = murais.find(m => m.id === activeMuralId) ?? null;

  // Debounce para salvar posições (drag é frequente)
  const saveTimer = useRef<NodeJS.Timeout>();
  const debouncedSave = useCallback((updated: Mural) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(updated), 1000);
  }, [save]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!mural || !event.over) return;
    const { active, delta } = event;
    const updated: Mural = {
      ...mural,
      cards: mural.cards.map(c =>
        c.id === active.id
          ? { ...c, position: { x: c.position.x + delta.x / zoom, y: c.position.y + delta.y / zoom } }
          : c
      ),
    };
    debouncedSave(updated);
  };

  if (!mural) {
    return (
      <div className="empty-state" style={{ height: "100%", margin: "1.5rem" }}>
        <p>Nenhum mural criado.</p>
        {isGM && (
          <button className="btn primary-btn" onClick={() => {
            const novo: Mural = {
              id: crypto.randomUUID(),
              name: "Investigação",
              cards: [], connections: [],
              createdAt: new Date().toISOString(),
            };
            save(novo);
            setActiveMuralId(novo.id);
          }}>
            + Criar Mural
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Toolbar lateral — só GM */}
      {isGM && (
        <MuralToolbar
          onAddCard={() => setShowCardForm(true)}
          zoom={zoom}
          onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2))}
          onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.4))}
          connectingMode={!!connectingFrom}
          onToggleConnect={() => setConnectingFrom(c => c !== null ? null : "")}
        />
      )}

      {/* Canvas */}
      <DndContext onDragEnd={handleDragEnd}>
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            background: "var(--bg-base)",
            backgroundImage: `radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            cursor: connectingFrom ? "crosshair" : "grab",
          }}
          onClick={() => { if (connectingFrom === "") setConnectingFrom(null); }}
        >
          {/* SVG de linhas (abaixo dos cards) */}
          <MuralConnectionLayer
            cards={mural.cards}
            connections={mural.connections}
            zoom={zoom}
            pan={pan}
          />
          {/* Cards */}
          {mural.cards.map(card => (
            <MuralCard
              key={card.id}
              card={card}
              zoom={zoom}
              pan={pan}
              isConnecting={connectingFrom === card.id}
              canEdit={isGM}
              onCardClick={() => {
                if (!isGM) return;
                if (connectingFrom === "") {
                  setConnectingFrom(card.id);
                } else if (connectingFrom && connectingFrom !== card.id) {
                  // Criar conexão
                  const updated: Mural = {
                    ...mural,
                    connections: [...mural.connections, {
                      id: crypto.randomUUID(),
                      muralId: mural.id,
                      fromCardId: connectingFrom,
                      toCardId: card.id,
                    }],
                  };
                  save(updated);
                  setConnectingFrom(null);
                }
              }}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
```

### MuralToolbar.tsx — estrutura visual

```tsx
// Barra vertical à esquerda, largura 56px
// Container: glass-panel com border-right: 1px solid var(--border-subtle)
// Fundo: var(--bg-card)
//
// Seção superior (ações):
//   [📌] Adicionar Card    → nav-btn, onClick: onAddCard
//   [🔗] Modo Conexão      → nav-btn, borda accent-primary quando connectingMode === true
//
//   Divisor: 1px solid border-subtle
//
// Seção inferior (zoom):
//   [+] Zoom In  → nav-btn
//   [−] Zoom Out → nav-btn
//   Badge de zoom: "100%" em text-muted, font-size 0.65rem, text-align center
```

### MuralCard.tsx — estrutura visual

```tsx
// Container: position absolute, pointer-events auto
// transform: translate( card.position.x * zoom + pan.x, card.position.y * zoom + pan.y )
//
// Visual do card (glass-panel, min-width: 160px, max-width: 200px):
//   Borda esquerda colorida por tipo (4px solid):
//     nota:    var(--text-muted)
//     npc:     var(--warning)
//     artefato: hsl(300, 60%, 60%)   <- roxo
//     teoria:  var(--danger)
//     retrato: var(--accent-primary)
//
//   Conteúdo:
//     narrative-label: nome do tipo (ex: "TEORIA")
//     título: font-size 0.9rem, font-weight 800, text-primary
//     content: narrative-text, -webkit-line-clamp: 3 (truncar)
//
//   Se type === 'npc' e refId:
//     Buscar npc = dadosGlobais.npcs.find(n => n.id === card.refId)
//     Mostrar: [avatar 28px circular] + npc.name em font-weight 700
//
//   Se isConnecting: box-shadow: 0 0 0 2px var(--accent-primary)
//                   animation: pulse 1.5s infinite (dayPulse já existe no globals.css)
//
// Hover (canEdit === true):
//   Mostrar botões sobrepostos (npc-card-actions pattern):
//     [✏ Editar]  → npc-card-action
//     [🗑 Deletar] → npc-card-action text-danger
```

### MuralConnectionLayer.tsx

```tsx
// SVG position: absolute, inset: 0, width: 100%, height: 100%
// pointer-events: none (não bloquear drag)
// z-index: 0 (abaixo dos cards)
//
// Para cada connection:
//   from = cards.find(c => c.id === conn.fromCardId)
//   to   = cards.find(c => c.id === conn.toCardId)
//   if (!from || !to) continue
//
//   fromCenter = {
//     x: from.position.x * zoom + pan.x + CARD_WIDTH / 2,
//     y: from.position.y * zoom + pan.y + CARD_HEIGHT / 2,
//   }
//   toCenter = { ... } (idem para to)
//
//   <path
//     d={getBezierPath(fromCenter, toCenter)}
//     stroke="var(--accent-primary)"
//     strokeOpacity="0.7"
//     strokeWidth="2"
//     fill="none"
//   />
//
//   Se conn.label: renderizar <text> no ponto médio da curva
//     font-size: 11, fill: var(--text-muted)
//
// CARD_WIDTH ≈ 180, CARD_HEIGHT ≈ 100 (ajustar após medir o card real)
//
// Performance: useMemo com deps [cards, connections, zoom, pan]
```

### Checklist Sprint 2

- [ ] `npm install @dnd-kit/core @dnd-kit/utilities`
- [ ] `MuralToolbar.tsx` (só renderiza para GM)
- [ ] `MuralCanvas.tsx` — canvas estático com cards mockados (Etapa 2.1)
- [ ] `MuralCard.tsx` — visual sem drag
- [ ] Drag & drop funcionando (Etapa 2.2)
- [ ] `MuralConnectionLayer.tsx` com SVG das conexões mockadas (Etapa 2.3)
- [ ] Pan do canvas (arrastar o fundo com mouse down)
- [ ] Zoom com `Ctrl+scroll` ou pinch

---

## SPRINT 3 — Mural de Investigação (parte B)

**Complexidade:** Média | **Estimativa:** 2–3 dias

### Etapa 3.1 — Modo Conexão (já parcialmente implementado no Sprint 2)

O fluxo já está no `MuralCanvas.tsx` acima. Confirmar:
- [ ] Clicar no botão 🔗 ativa `connectingFrom = ""`
- [ ] Clicar em card A define `connectingFrom = card.id`
- [ ] Clicar em card B cria a conexão e limpa `connectingFrom`
- [ ] Clicar no fundo cancela (`connectingFrom = null`)
- [ ] Card em `connectingFrom` recebe borda pulsante

### Etapa 3.2 — MuralCardForm (modal, só GM)

```tsx
// /components/cronicas/mural/MuralCardForm.tsx
//
// Modal sobre o canvas (modal-overlay / modal-content — padrão existente)
//
// Campos:
//   type:    <select className="journey-input">
//              nota | npc | artefato | teoria | retrato
//   title:   <input className="journey-input modern-input">
//   content: <textarea className="form-textarea"> (opcional para npc/retrato)
//   imageUrl: <input type="file"> com preview 80px (para artefato e retrato)
//   refId:   <select className="journey-input"> — condicional por type:
//              type === 'npc' → listar dadosGlobais.npcs (AppContext)
//              outros → campo oculto
//
// NÃO usar <form> — usar divs + onClick (padrão do projeto)
//
// Submit: monta MuralCard com crypto.randomUUID() e chama onSave
// Posição inicial: centro do canvas visível (pan + metade do viewport)
```

### Etapa 3.3 — Deletar card e conexão

```tsx
// Deletar card:
//   Remover o card E todas as connections que referenciam o card
const updated: Mural = {
  ...mural,
  cards: mural.cards.filter(c => c.id !== cardId),
  connections: mural.connections.filter(
    conn => conn.fromCardId !== cardId && conn.toCardId !== cardId
  ),
};
save(updated);

// Deletar conexão:
//   No SVG, adicionar linha invisível mais larga (stroke-width: 20, opacity: 0)
//   para aumentar área clicável. Ao clicar: confirmar e deletar.
//   pointer-events: stroke (só a linha, não a área)
```

### Etapa 3.4 — Integração com NPCs reais

```tsx
// MuralCard.tsx — quando type === 'npc':
import { useAppContext } from "@/contexts/AppContext";
const { dadosGlobais } = useAppContext();
const npc = dadosGlobais.npcs.find(n => n.id === card.refId);

// Mostrar: avatar do NPC (npc.image) ou inicial do nome
// Link "Ver NPC" → abre o modal de detalhe existente do sistema
//   setActiveData(npc); setModals(prev => ({ ...prev, npcDetail: true }))
```

### Etapa 3.5 — Labels nas conexões

```tsx
// Ao clicar numa conexão: abrir inline input para editar o label
// Estado local: editingConnId: string | null
// <input type="text" className="journey-input" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
// Salvar ao blur ou Enter
```

### Checklist Sprint 3

- [ ] Modo Conexão completo (criar, visualizar, cancelar)
- [ ] `MuralCardForm.tsx` — criar card (todos os tipos)
- [ ] Editar card existente (reutilizar MuralCardForm com initialData)
- [ ] Deletar card (remove card + suas conexões)
- [ ] Deletar conexão (clique na linha)
- [ ] Integração com NPCs reais do AppContext
- [ ] Labels editáveis nas conexões
- [ ] Persistência com debounce (posições) e imediata (conexões, cards)

---

## SPRINT 4 — Visão do Jogador: NPC Resumido

**Complexidade:** Baixa | **Estimativa:** 0.5–1 dia

### NpcCardPlayer.tsx

```tsx
// /components/npcs/NpcCardPlayer.tsx
// Exibido quando isPlayer === true na view de NPCs
//
// Lista filtrada: dadosGlobais.npcs.filter(n => !n.isHidden)
//
// Layout (glass-panel):
// ┌───────────────────────────────────────────┐
// │ [avatar 80px]  Nome do NPC                │
// │                Título · Facção            │
// ├───────────────────────────────────────────┤
// │ ◆ MOTIVAÇÕES          ← narrative-label  │
// │ npc.mot               ← narrative-text   │
// │                                           │
// │ ◆ INTENÇÕES VISÍVEIS  ← narrative-label  │
// │ npc.itemsVis          ← narrative-text   │
// │                                           │
// │ ◆ TRAÇOS              ← narrative-label  │
// │ npc.traits            ← narrative-text   │
// └───────────────────────────────────────────┘
//
// SEM: atributos, HP, AC, CR, ataques, spells, itemsHid, notes
// SEM: botões de editar, deletar, modo combate
// SEM: npc-card-actions
```

### NpcsView adaptado

```tsx
// NpcsView.tsx — adicionar distinção por role
import { useUserSession } from "@/contexts/UserSessionContext";
import NpcCardPlayer from "../npcs/NpcCardPlayer";

const { isGM } = useUserSession();

const visibleNpcs = isGM
  ? dadosGlobais.npcs
  : dadosGlobais.npcs.filter(n => !n.isHidden);

// Na renderização:
return isGM
  ? <NpcCard npc={npc} />        // card completo existente
  : <NpcCardPlayer npc={npc} />; // card resumido novo
```

### Sidebar filtrada por role

```tsx
// Sidebar.tsx — ocultar abas de gerenciamento para jogadores
const { isGM } = useUserSession();

{isGM && <button onClick={() => setActiveView("view-players")}>JOGADORES</button>}
{isGM && <button onClick={() => setActiveView("view-settings")}>AJUSTES</button>}
{isGM && <button onClick={() => setActiveView("view-food")}>ALIMENTOS</button>}
// Crônicas e NPCs ficam visíveis para todos
```

### Checklist Sprint 4

- [ ] Criar `NpcCardPlayer.tsx` com campos: mot, itemsVis, traits
- [ ] Adaptar `NpcsView.tsx` para alternar card por role
- [ ] Filtrar `isHidden === true` para jogadores
- [ ] Filtrar tabs do Sidebar por role (ocultar abas de GM)
- [ ] Testar login como jogador: ver NPCs públicos, Crônicas, Dashboard
- [ ] Testar que dados sensíveis (itemsHid, notes, combate) não aparecem

---

## Dados mock (`/lib/cronicasData.ts`)

```typescript
import { DiaryEntry, Mural } from "@/types/cronicas";

export const mockDiarioEntries: DiaryEntry[] = [
  {
    id: "d1",
    sessionNumber: 14,
    sessionTitle: "A Fuga do Templo",
    authorId: "player-1",
    authorName: "Aris",
    content: "Descobrimos uma passagem secreta no sul do templo. A chave enferrujada do Borin pode abrir algo importante lá dentro.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2min atrás
    likes: [],
  },
  {
    id: "d2",
    sessionNumber: 14,
    sessionTitle: "A Fuga do Templo",
    authorId: "player-2",
    authorName: "Borin",
    content: "Achei uma chave enferrujada perto do altar central.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h atrás
    likes: [],
  },
  {
    id: "d3",
    sessionNumber: 13,
    sessionTitle: "O Mercado das Sombras",
    authorId: "gm",
    authorName: "Mestre",
    content: "Os aventureiros chegaram ao mercado e encontraram pistas sobre o Culto da Serpente operando nas docas.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
    likes: [],
  },
];

export const mockMural: Mural = {
  id: "m1",
  name: "Investigação: O Culto",
  cards: [
    {
      id: "c1", muralId: "m1", type: "nota",
      title: "O Culto da Serpente",
      content: "Um culto que conecta uma amirto da serpente.",
      position: { x: 60, y: 80 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c2", muralId: "m1", type: "retrato",
      title: "Retrato do Líder: Malakor",
      position: { x: 320, y: 60 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c3", muralId: "m1", type: "nota",
      title: "Localização: Templo Arruinado",
      position: { x: 200, y: 240 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c4", muralId: "m1", type: "artefato",
      title: "Artefato: O Olho de Jade",
      position: { x: 60, y: 360 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
    {
      id: "c5", muralId: "m1", type: "teoria",
      title: "Eles querem a Joia do Rei",
      content: "Eles querem a joia do rei — usarão ela no ritual.",
      position: { x: 320, y: 340 },
      createdBy: "gm", createdAt: new Date().toISOString(),
    },
  ],
  connections: [
    { id: "conn1", muralId: "m1", fromCardId: "c1", toCardId: "c2" },
    { id: "conn2", muralId: "m1", fromCardId: "c1", toCardId: "c3" },
    { id: "conn3", muralId: "m1", fromCardId: "c1", toCardId: "c4" },
    { id: "conn4", muralId: "m1", fromCardId: "c3", toCardId: "c5" },
    { id: "conn5", muralId: "m1", fromCardId: "c2", toCardId: "c3" },
  ],
  createdAt: new Date().toISOString(),
};
```

---

## Checklist Master

### Fase 0 — Abstração de dados
- [ ] `/types/cronicas.ts`
- [ ] `/types/session.ts`
- [ ] `/hooks/adapters/types.ts`
- [ ] `/hooks/adapters/localStorageAdapter.ts`
- [ ] `/hooks/adapters/supabaseAdapter.ts` (esqueleto)
- [ ] `/hooks/useGameData.ts` — `useDiario` + `useMurais`
- [ ] Testar no browser

### Fase 0.5 — Sessão leve
- [ ] `/contexts/UserSessionContext.tsx`
- [ ] `/components/LoginScreen.tsx`
- [ ] `UserSessionProvider` no layout raiz
- [ ] Testar GM e player

### Sprint 1 — Diário
- [ ] `/lib/cronicasData.ts` com mocks
- [ ] `CronicasView.tsx` (sub-tabs: Diário | Mural)
- [ ] `AppShell.tsx` + `Sidebar.tsx` atualizados
- [ ] `DiarioFeed.tsx`
- [ ] `DiarioEntryCard.tsx`
- [ ] `DiarioEntryForm.tsx`
- [ ] Conectar ao `useDiario()`

### Sprint 2 — Mural parte A
- [ ] `npm install @dnd-kit/core @dnd-kit/utilities`
- [ ] `MuralToolbar.tsx`
- [ ] `MuralCanvas.tsx` — canvas estático
- [ ] `MuralCard.tsx`
- [ ] Drag & drop
- [ ] `MuralConnectionLayer.tsx` — SVG bezier
- [ ] Pan + zoom

### Sprint 3 — Mural parte B
- [ ] Modo Conexão completo
- [ ] `MuralCardForm.tsx`
- [ ] Editar e deletar card
- [ ] Deletar conexão
- [ ] Labels nas conexões
- [ ] Integração com NPCs do AppContext
- [ ] Persistência com debounce

### Sprint 4 — Visão do Jogador
- [ ] `NpcCardPlayer.tsx`
- [ ] `NpcsView.tsx` adaptado por role
- [ ] Sidebar filtrada por role
- [ ] Testes de role GM vs player

---

*SDD v4.1 — maio 2026*  
*Escopo: Diário de Bordo + Mural de Investigação (Códice removido)*  
*Estilo: CSS Vanilla — globals.css (sem Tailwind)*  
*Arquitetura: AppShell.tsx, AppContext.tsx, globals.css, gameData.ts*

---

## CSS Vanilla — Classes novas a adicionar no `globals.css`

> **Regra:** Todo estilo fixo (visual, cor, tipografia) vai no `globals.css`.
> Somente valores dinâmicos de runtime (posição x/y, zoom, pan) ficam como
> `style={{}}` inline no React — CSS Vanilla não consegue ler variáveis JS.

Adicionar no final do `globals.css` existente, após a última seção:

```css
/* =========================================================
   CRÔNICAS — Diário de Bordo + Mural de Investigação
   Adicionado em: maio 2026
   ========================================================= */

/* ── DIÁRIO DE BORDO ──────────────────────────────────── */

.diario-entry-card {
    background: var(--bg-card);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    transition: var(--transition-fast);
    position: relative;
}

.diario-entry-card:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.5);
}

.diario-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-bright);
    flex-shrink: 0;
}

.diario-avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
}

.diario-entry-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.diario-entry-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
}

.diario-author-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
}

.diario-time-ago {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
}

.diario-entry-content {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 0.75rem;
}

.diario-entry-image {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    margin-top: 0.5rem;
    display: block;
}

.diario-session-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.diario-session-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border-subtle);
}

.diario-form {
    background: var(--bg-card);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.diario-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.diario-image-preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    display: block;
}

.diario-image-upload-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0.5rem 1rem;
    background: hsla(0, 0%, 100%, 0.05);
    border: 1px dashed var(--border-bright);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
}

.diario-image-upload-label:hover {
    background: hsla(0, 0%, 100%, 0.1);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
}

.diario-form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
}

/* ── MURAL DE INVESTIGAÇÃO ────────────────────────────── */

.mural-wrapper {
    display: flex;
    height: 100%;
    overflow: hidden;
}

.mural-canvas {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: var(--bg-base);
    /* backgroundImage e backgroundSize são inline (dependem de zoom — valor JS) */
}

/* Toolbar lateral */
.mural-toolbar {
    width: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
    gap: 0.5rem;
    background: var(--bg-card);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-right: 1px solid var(--border-subtle);
    flex-shrink: 0;
    z-index: 10;
}

.mural-toolbar-divider {
    width: 32px;
    height: 1px;
    background: var(--border-subtle);
    margin: 0.25rem 0;
}

.mural-zoom-badge {
    font-size: 0.6rem;
    font-weight: 800;
    color: var(--text-muted);
    text-align: center;
    letter-spacing: 0.05em;
}

.mural-toolbar .nav-btn.connect-active {
    background: var(--accent-glow);
    color: var(--accent-primary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 12px var(--accent-glow);
}

/* Cards do mural */
/* NOTA: position, transform (x/y/zoom) são inline — valores JS dinâmicos */
.mural-card {
    position: absolute;  /* reforço — o inline já define, mas boa prática declarar */
    min-width: 160px;
    max-width: 200px;
    background: var(--bg-card);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--border-subtle);
    border-left-width: 4px;
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    cursor: grab;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    user-select: none;
    z-index: 2;
}

.mural-card:hover {
    box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.6);
    z-index: 3;
}

.mural-card:active {
    cursor: grabbing;
}

/* Variantes por tipo — borda esquerda colorida */
.mural-card--nota    { border-left-color: var(--text-muted); }
.mural-card--npc     { border-left-color: var(--warning); }
.mural-card--artefato{ border-left-color: hsl(300, 60%, 60%); }
.mural-card--teoria  { border-left-color: var(--danger); }
.mural-card--retrato { border-left-color: var(--accent-primary); }

/* Card em modo conexão (aguardando ser clicado como destino) */
.mural-card--connecting {
    box-shadow: 0 0 0 2px var(--accent-primary), 0 0 16px var(--accent-glow);
    animation: muralCardPulse 1.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
}

@keyframes muralCardPulse {
    0%   { box-shadow: 0 0 0 2px var(--accent-primary), 0 0 8px  var(--accent-glow); }
    50%  { box-shadow: 0 0 0 4px var(--accent-primary), 0 0 20px var(--accent-glow); }
    100% { box-shadow: 0 0 0 2px var(--accent-primary), 0 0 8px  var(--accent-glow); }
}

.mural-card-type-label {
    font-size: 0.6rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 4px;
}

.mural-card-title {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: 4px;
    word-break: break-word;
}

.mural-card-content {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.mural-card-npc-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
}

.mural-card-npc-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border-bright);
    flex-shrink: 0;
}

.mural-card-npc-avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
}

.mural-card-npc-name {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--warning);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Botões de ação do card (aparecem no hover — padrão npc-card-actions) */
.mural-card-actions {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    gap: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 15;
}

.mural-card:hover .mural-card-actions {
    opacity: 1;
    pointer-events: auto;
}

/* SVG de conexões — cobre todo o canvas */
.mural-connection-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;   /* NÃO bloquear drag dos cards */
    z-index: 1;             /* abaixo dos cards (z-index: 2) */
}

/* Linha de conexão — área clicável invisível para deletar */
.mural-connection-hitarea {
    stroke: transparent;
    stroke-width: 20;
    fill: none;
    pointer-events: stroke;
    cursor: pointer;
}

.mural-connection-hitarea:hover + .mural-connection-line {
    stroke-opacity: 1;
    stroke-width: 3;
}

.mural-connection-line {
    stroke: var(--accent-primary);
    stroke-opacity: 0.7;
    stroke-width: 2;
    fill: none;
    transition: stroke-opacity 0.2s ease, stroke-width 0.2s ease;
    pointer-events: none;
}

.mural-connection-label {
    font-size: 11px;
    fill: var(--text-muted);
    text-anchor: middle;
    pointer-events: none;
    font-family: var(--font-main);
}

/* Estado vazio do mural */
.mural-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-muted);
}

/* Seletor de murais (se houver múltiplos) */
.mural-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
}

.mural-selector-tab {
    padding: 0.4rem 0.9rem;
    border-radius: 100px;
    border: 1px solid var(--border-subtle);
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition-fast);
}

.mural-selector-tab:hover {
    background: hsla(0, 0%, 100%, 0.05);
    color: var(--text-primary);
}

.mural-selector-tab.active {
    background: var(--accent-glow);
    color: var(--accent-primary);
    border-color: var(--accent-primary);
}
```

### Regras de uso CSS Vanilla (para o Antigravity seguir)

```
REGRA 1 — Nunca Tailwind
  ❌ className="flex items-center gap-4"
  ✅ className="diario-entry-header"  (classe no globals.css)
  ✅ style={{ display: "flex", alignItems: "center", gap: "1rem" }}
     (inline só se o valor for dinâmico/JS)

REGRA 2 — Valores estáticos → globals.css
  ❌ style={{ borderRadius: "14px", padding: "1.25rem" }}
  ✅ className="mural-card"  (valores fixos já estão na classe)

REGRA 3 — Valores dinâmicos → inline obrigatório
  ✅ style={{ transform: `translate(${x}px, ${y}px)` }}   (posição do card)
  ✅ style={{ transform: `scale(${zoom})` }}               (zoom do canvas)
  ✅ style={{ backgroundSize: `${20 * zoom}px` }}          (grid do canvas)

REGRA 4 — Variantes de tipo → classe modificadora BEM-like
  ✅ className={`mural-card mural-card--${card.type}`}
  ✅ className={`mural-card ${isConnecting ? "mural-card--connecting" : ""}`}

REGRA 5 — Reutilizar classes do sistema existente
  Sempre preferir: glass-panel, btn primary-btn, narrative-label,
  journey-input, scrollable-area, empty-state, nav-btn, section-title
  Criar classe nova só quando não existe equivalente no globals.css
```
