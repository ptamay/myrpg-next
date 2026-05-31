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
DROP POLICY IF EXISTS "Apenas GM deleta perfis" ON profiles;

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
  -- Segurança: verifica se o usuário autenticado é realmente o player tentando salvar a sessão
  -- Isso impede que um jogador sobrescreva anotações de outro jogador.
  IF p_player_id != auth.uid()::text THEN
    RAISE EXCEPTION 'Não autorizado. O ID fornecido não corresponde ao usuário autenticado.';
  END IF;

  -- Atualiza o campo jsonb player_sessions apenas na chave do player_id fornecido
  UPDATE journey_blocks
  SET player_sessions = COALESCE(player_sessions, '{}'::jsonb) || jsonb_build_object(p_player_id, p_session_data)
  WHERE id = p_block_id;
END;
$$;

-- 5. Adicionar políticas para tabelas abertas (Proteção adicional)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE murals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_connections ENABLE ROW LEVEL SECURITY;

-- Exemplo simplificado: Acesso total ao GM, e Players apenas visualizam
-- Você pode refinar isso para cada tabela, mas a base é:
DROP POLICY IF EXISTS "GM gerencia tudo" ON players;
DROP POLICY IF EXISTS "Todos visualizam players" ON players;
DROP POLICY IF EXISTS "Jogador edita próprio player" ON players;
CREATE POLICY "GM gerencia tudo" ON players FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm'));
CREATE POLICY "Todos visualizam players" ON players FOR SELECT USING (auth.uid() IS NOT NULL);
-- Permitir update do próprio jogador na tabela players
CREATE POLICY "Jogador edita próprio player" ON players FOR UPDATE USING (id = (SELECT player_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "GM gerencia campaign" ON campaign;
DROP POLICY IF EXISTS "Todos visualizam campaign" ON campaign;
CREATE POLICY "GM gerencia campaign" ON campaign FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm'));
CREATE POLICY "Todos visualizam campaign" ON campaign FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "GM gerencia journey_blocks" ON journey_blocks;
DROP POLICY IF EXISTS "Todos visualizam journey_blocks" ON journey_blocks;
CREATE POLICY "GM gerencia journey_blocks" ON journey_blocks FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm'));
CREATE POLICY "Todos visualizam journey_blocks" ON journey_blocks FOR SELECT USING (auth.uid() IS NOT NULL);
-- A atualização das player_sessions é feita via RPC com Security Definer, que bypassa RLS.

DROP POLICY IF EXISTS "GM gerencia journey_days" ON journey_days;
DROP POLICY IF EXISTS "Todos visualizam journey_days" ON journey_days;
CREATE POLICY "GM gerencia journey_days" ON journey_days FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm'));
CREATE POLICY "Todos visualizam journey_days" ON journey_days FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "GM gerencia supplies" ON supplies;
DROP POLICY IF EXISTS "Todos visualizam supplies" ON supplies;
CREATE POLICY "GM gerencia supplies" ON supplies FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm'));
CREATE POLICY "Todos visualizam supplies" ON supplies FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "GM gerencia maps" ON maps;
DROP POLICY IF EXISTS "Todos visualizam maps" ON maps;
CREATE POLICY "GM gerencia maps" ON maps FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm'));
CREATE POLICY "Todos visualizam maps" ON maps FOR SELECT USING (auth.uid() IS NOT NULL);

-- Para diários e murais, todos podem criar, ver e editar
DROP POLICY IF EXISTS "Todos usam diários" ON diary_entries;
DROP POLICY IF EXISTS "Todos usam murais" ON murals;
DROP POLICY IF EXISTS "Todos usam mural_cards" ON mural_cards;
DROP POLICY IF EXISTS "Todos usam mural_connections" ON mural_connections;
CREATE POLICY "Todos usam diários" ON diary_entries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Todos usam murais" ON murals FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Todos usam mural_cards" ON mural_cards FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Todos usam mural_connections" ON mural_connections FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Adicionar coluna para Transformação (duas fichas em uma)
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS transformation jsonb;
ALTER TABLE players ADD COLUMN IF NOT EXISTS transformation jsonb;

-- 6. Adicionar coluna para sincronização do estado de transformação
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS is_transformed boolean DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_transformed boolean DEFAULT false;

-- 7. Função para resetar a campanha (apagar todos os dados)
CREATE OR REPLACE FUNCTION reset_campaign()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Apenas GM pode resetar
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gm') THEN
    RAISE EXCEPTION 'Não autorizado';
  END IF;

  DELETE FROM mural_connections;
  DELETE FROM mural_cards;
  DELETE FROM murals;
  DELETE FROM diary_entries;
  DELETE FROM maps;
  DELETE FROM supplies;
  DELETE FROM journey_blocks;
  DELETE FROM journey_days;
  DELETE FROM campaign;
  DELETE FROM players;
  DELETE FROM npcs;
END;
$$;
