export interface Stadium {
  stadium_id: number;
  name: string;
  city: string | null;
  capacity: number | null;
  created_at: Date;
}
 
export interface Team {
  team_id: number;
  external_id: number;
  name: string;
  short_code: string | null;
  strength: number | null;
  stadium_id: number | null;
  created_at: Date;
}
 
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
 
export interface Player {
  player_id: number;
  external_id: number;
  full_name: string;
  position: Position | null;
  now_cost: number | null;
  team_id: number | null;
}
 
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';
 
export interface Match {
  match_id: number;
  external_id: number;
  season: string;
  gameweek: number;
  match_date: Date;
  home_team_id: number;
  away_team_id: number;
  home_score: number;
  away_score: number;
  status: MatchStatus;
}
 
export type EventType = 'Goal' | 'Assist';
 
export interface MatchEvent {
  event_id: number;
  match_id: number;
  player_id: number;
  assisted_by: number | null;
  event_type: EventType;
  minute: number;
  extra_minute: number;
  created_at: Date;
}
 
// ---------- API response shapes (joined data sent to the frontend) ----------
 
export interface MatchListItem {
  match_id: number;
  gameweek: number;
  match_date: Date;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: MatchStatus;
}
 
export interface MatchPlayer {
  player_id: number;
  full_name: string;
  position: Position | null;
  team_id: number;
  team_name: string;
}
 
export interface EventWithDetails {
  event_id: number;
  event_type: EventType;
  minute: number;
  extra_minute: number;
  player_id: number;
  player_name: string;
  team_name: string;
  assisted_by: number | null;
  assister_name: string | null;
}
 
export interface TopScorer {
  player_id: number;
  player_name: string;
  team_name: string;
  goals: number;
  rank: number;
}