export type UserRole = 'gm' | 'player';

export interface UserSession {
  role: UserRole;
  characterId?: string;    // ID em dadosGlobais.players — só para 'player'
  characterName?: string;  // Cache do nome para exibição
}
