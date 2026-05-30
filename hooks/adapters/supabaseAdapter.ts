import { CronicasAdapter } from "./types";
import { createClient } from "@/lib/supabase/client";
import { DiaryEntry, Mural, MuralCard, MuralConnection } from "@/types/cronicas";

export const supabaseAdapter: CronicasAdapter = {
  getDiarioEntries: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(row => ({
      id: row.id,
      sessionNumber: row.session_number,
      sessionTitle: row.session_title,
      authorId: row.author_id,
      authorName: row.author_name,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      likes: row.likes || [],
      comments: row.comments || []
    }));
  },

  addDiarioEntry: async (entry: DiaryEntry) => {
    const supabase = createClient();
    // Get campaign_id first (we assume a singleton campaign right now)
    const { data: campaign } = await supabase.from('campaign').select('id').limit(1).single();
    
    const { error } = await supabase.from('diary_entries').insert({
      id: entry.id,
      campaign_id: campaign?.id,
      session_number: entry.sessionNumber,
      session_title: entry.sessionTitle,
      author_id: entry.authorId,
      author_name: entry.authorName,
      content: entry.content,
      image_url: entry.imageUrl,
      created_at: entry.createdAt,
      likes: entry.likes || [],
      comments: entry.comments || []
    });
    if (error) throw error;
  },

  updateDiarioEntry: async (entry: DiaryEntry) => {
    const supabase = createClient();
    const { error } = await supabase.from('diary_entries').update({
      session_number: entry.sessionNumber,
      session_title: entry.sessionTitle,
      author_id: entry.authorId,
      author_name: entry.authorName,
      content: entry.content,
      image_url: entry.imageUrl,
      likes: entry.likes || [],
      comments: entry.comments || [],
      updated_at: new Date().toISOString()
    }).eq('id', entry.id);
    if (error) throw error;
  },

  deleteDiarioEntry: async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw error;
  },

  getMurais: async () => {
    const supabase = createClient();
    // Fetch murals, cards, connections
    const { data: muralsData, error: mErr } = await supabase.from('murals').select('*');
    const { data: cardsData, error: cErr } = await supabase.from('mural_cards').select('*');
    const { data: connData, error: connErr } = await supabase.from('mural_connections').select('*');
    
    if (mErr || cErr || connErr) throw new Error("Erro ao buscar murais");

    return muralsData.map(mural => {
      const cards = (cardsData || []).filter(c => c.mural_id === mural.id).map(c => ({
        id: c.id,
        muralId: c.mural_id,
        type: c.type as any,
        title: c.title,
        content: c.content,
        imageUrl: c.image_url,
        refId: c.ref_id,
        position: { x: c.pos_x, y: c.pos_y },
        createdBy: c.created_by,
        createdAt: c.created_at
      }));

      const connections = (connData || []).filter(conn => conn.mural_id === mural.id).map(conn => ({
        id: conn.id,
        muralId: conn.mural_id,
        fromCardId: conn.from_card_id,
        toCardId: conn.to_card_id,
        label: conn.label,
        color: conn.color
      }));

      return {
        id: mural.id,
        name: mural.name,
        backgroundStyle: mural.background_style,
        createdAt: mural.created_at,
        cards,
        connections
      } as Mural;
    });
  },

  saveMural: async (mural: Mural) => {
    const supabase = createClient();
    const { data: campaign } = await supabase.from('campaign').select('id').limit(1).single();
    
    // Upsert mural
    const { error: muralError } = await supabase.from('murals').upsert({
      id: mural.id,
      campaign_id: campaign?.id,
      name: mural.name,
      background_style: mural.backgroundStyle,
      created_at: mural.createdAt
    });
    if (muralError) throw muralError;

    const { data: existingCards, error: ecErr } = await supabase.from('mural_cards').select('id').eq('mural_id', mural.id);
    if (ecErr) throw ecErr;

    const incomingCardIds = mural.cards.map(c => c.id);
    const toDeleteCards = existingCards?.filter(ec => !incomingCardIds.includes(ec.id)).map(ec => ec.id) || [];
    if (toDeleteCards.length > 0) {
      const { error: delCardsErr } = await supabase.from('mural_cards').delete().in('id', toDeleteCards);
      if (delCardsErr) throw delCardsErr;
    }

    const { data: existingConns, error: econErr } = await supabase.from('mural_connections').select('id').eq('mural_id', mural.id);
    if (econErr) throw econErr;

    const incomingConnIds = mural.connections.map(c => c.id);
    const toDeleteConns = existingConns?.filter(ec => !incomingConnIds.includes(ec.id)).map(ec => ec.id) || [];
    if (toDeleteConns.length > 0) {
      const { error: delConnErr } = await supabase.from('mural_connections').delete().in('id', toDeleteConns);
      if (delConnErr) throw delConnErr;
    }

    // Upsert new cards
    if (mural.cards.length > 0) {
      const { error: upCardsErr } = await supabase.from('mural_cards').upsert(mural.cards.map(c => ({
        id: c.id,
        mural_id: c.muralId,
        campaign_id: campaign?.id,
        type: c.type,
        title: c.title,
        content: c.content,
        image_url: c.imageUrl,
        ref_id: c.refId,
        pos_x: c.position.x,
        pos_y: c.position.y,
        created_by: c.createdBy,
        created_at: c.createdAt
      })));
      if (upCardsErr) throw upCardsErr;
    }

    // Upsert new connections
    if (mural.connections.length > 0) {
      const { error: upConnErr } = await supabase.from('mural_connections').upsert(mural.connections.map(conn => ({
        id: conn.id,
        mural_id: conn.muralId,
        campaign_id: campaign?.id,
        from_card_id: conn.fromCardId,
        to_card_id: conn.toCardId,
        label: conn.label,
        color: conn.color
      })));
      if (upConnErr) throw upConnErr;
    }
  },

  deleteMural: async (id: string) => {
    const supabase = createClient();
    await supabase.from('mural_connections').delete().eq('mural_id', id);
    await supabase.from('mural_cards').delete().eq('mural_id', id);
    await supabase.from('murals').delete().eq('id', id);
  }
};
