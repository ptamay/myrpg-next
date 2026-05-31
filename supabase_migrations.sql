-- Script de Migração: Políticas de Segurança (RLS) e Funções Auxiliares
-- Para ser executado no painel SQL Editor do Supabase

-- 1. Ativar RLS nas tabelas
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'npcs'
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "GM pode tudo em npcs" ON npcs;
DROP POLICY IF EXISTS "Jogadores leem npcs não ocultos" ON npcs;

-- GM tem acesso total (CRUD)
CREATE POLICY "GM pode tudo em npcs" ON npcs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm')
  );

-- Jogadores só podem LER (SELECT) NPCs que não estão ocultos
CREATE POLICY "Jogadores leem npcs não ocultos" ON npcs
  FOR SELECT USING (
    is_hidden = false OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm')
  );


-- 3. Políticas para 'profiles'
DROP POLICY IF EXISTS "Todos podem ler perfis" ON profiles;
DROP POLICY IF EXISTS "Apenas GM edita perfis" ON profiles;

-- Leitura pública para todos os autenticados
CREATE POLICY "Todos podem ler perfis" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Apenas GMs podem editar ou deletar perfis
CREATE POLICY "Apenas GM edita perfis" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm')
  );

CREATE POLICY "Apenas GM deleta perfis" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm')
  );


-- 4. Função RPC para mesclar (merge) Player Sessions atômica (Evitar Race Condition)
-- Usada para salvar anotações de jogadores sem sobrescrever o GM ou outros jogadores.
CREATE OR REPLACE FUNCTION merge_player_session(
  p_block_id bigint, 
  p_player_id text, 
  p_session_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualiza o campo jsonb player_sessions apenas na chave do player_id fornecido
  UPDATE journey_blocks
  SET player_sessions = COALESCE(player_sessions, '{}'::jsonb) || jsonb_build_object(p_player_id, p_session_data)
  WHERE id = p_block_id;
END;
$$;
