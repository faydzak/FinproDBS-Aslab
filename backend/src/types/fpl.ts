export interface FplTeamCsvRow {
  id: string;
  name: string;
  short_name: string;
  strength: string;
}
 
export interface FplPlayerCsvRow {
  id: string;
  first_name: string;
  second_name: string;
  team: string;
  element_type: string;
  now_cost: string;
}
 
export interface FplFixtureCsvRow {
  id: string;
  event: string;                 // gameweek number
  kickoff_time: string;
  team_h: string;
  team_a: string;
  team_h_score: string;
  team_a_score: string;
  finished: string;              // 'True' | 'False'
}
 
export interface FplGameweekCsvRow {
  element: string;               // player external id
  fixture: string;               // match external id
  goals_scored: string;
  assists: string;
  minutes: string;
}