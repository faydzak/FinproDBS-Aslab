import Papa from 'papaparse';
import pool from './db.js';


//  FPL season to import. 2024-25 is fully complete.

const SEASON = '2024-25';
const SEASON_TAG = '2024/25';                      // matches the DB column format

const BASE = `https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/${SEASON}`;
const TEAMS_CSV_URL    = `${BASE}/teams.csv`;
const PLAYERS_CSV_URL  = `${BASE}/players_raw.csv`;
const FIXTURES_CSV_URL = `${BASE}/fixtures.csv`;
const MERGED_GW_URL    = `${BASE}/gws/merged_gw.csv`;

// ---------- helpers ----------

async function fetchAndParseCSV(url: string): Promise<any[]> {
  const response = await fetch(url);
  const text = await response.text();
  return Papa.parse<any>(text, { header: true, skipEmptyLines: true }).data;
}

/**
 * Spread N goals evenly across 90 minutes so the UI shows a realistic
 * timeline. 3 goals → minutes [23, 45, 68]. Not real timing data — the
 * FPL CSVs only aggregate per gameweek, not per minute.
 */
function spreadMinutes(count: number): number[] {
  const minutes: number[] = [];
  for (let i = 1; i <= count; i++) {
    minutes.push(Math.round((i * 90) / (count + 1)));
  }
  return minutes;
}

// ---------- stadium data ----------
// FPL data has no venues, so we hardcode them. Matched to 2024-25 lineup.

const STADIUMS: { teamName: string; stadium: string; city: string; capacity: number }[] = [
  { teamName: 'Arsenal',       stadium: 'Emirates Stadium',          city: 'London',         capacity: 60704 },
  { teamName: 'Aston Villa',   stadium: 'Villa Park',                city: 'Birmingham',     capacity: 42682 },
  { teamName: 'Bournemouth',   stadium: 'Vitality Stadium',          city: 'Bournemouth',    capacity: 11307 },
  { teamName: 'Brentford',     stadium: 'Gtech Community Stadium',   city: 'London',         capacity: 17250 },
  { teamName: 'Brighton',      stadium: 'American Express Stadium',  city: 'Brighton',       capacity: 31876 },
  { teamName: 'Chelsea',       stadium: 'Stamford Bridge',           city: 'London',         capacity: 40173 },
  { teamName: 'Crystal Palace',stadium: 'Selhurst Park',             city: 'London',         capacity: 25486 },
  { teamName: 'Everton',       stadium: 'Goodison Park',             city: 'Liverpool',      capacity: 39414 },
  { teamName: 'Fulham',        stadium: 'Craven Cottage',            city: 'London',         capacity: 29589 },
  { teamName: 'Ipswich',       stadium: 'Portman Road',              city: 'Ipswich',        capacity: 30311 },
  { teamName: 'Leicester',     stadium: 'King Power Stadium',        city: 'Leicester',      capacity: 32312 },
  { teamName: 'Liverpool',     stadium: 'Anfield',                   city: 'Liverpool',      capacity: 61276 },
  { teamName: 'Man City',      stadium: 'Etihad Stadium',            city: 'Manchester',     capacity: 53400 },
  { teamName: 'Man Utd',       stadium: 'Old Trafford',              city: 'Manchester',     capacity: 74310 },
  { teamName: 'Newcastle',     stadium: "St James' Park",            city: 'Newcastle',      capacity: 52305 },
  { teamName: "Nott'm Forest", stadium: 'City Ground',               city: 'Nottingham',     capacity: 30445 },
  { teamName: 'Southampton',   stadium: "St Mary's Stadium",         city: 'Southampton',    capacity: 32384 },
  { teamName: 'Spurs',         stadium: 'Tottenham Hotspur Stadium', city: 'London',         capacity: 62850 },
  { teamName: 'West Ham',      stadium: 'London Stadium',            city: 'London',         capacity: 62500 },
  { teamName: 'Wolves',        stadium: 'Molineux Stadium',          city: 'Wolverhampton',  capacity: 31750 },
];

// ---------- main ----------

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('⬇  Fetching CSVs from GitHub...');
    const [teamsData, playersData, fixturesData, gwData] = await Promise.all([
      fetchAndParseCSV(TEAMS_CSV_URL),
      fetchAndParseCSV(PLAYERS_CSV_URL),
      fetchAndParseCSV(FIXTURES_CSV_URL),
      fetchAndParseCSV(MERGED_GW_URL),
    ]);

    console.log('🧹 Clearing old data...');
    // Order matters: events → matches → players → teams → stadiums
    await client.query('TRUNCATE TABLE match_events, matches, players, teams, stadiums RESTART IDENTITY CASCADE');

    // ---- 1. STADIUMS ----
    console.log(`  Injecting ${STADIUMS.length} stadiums...`);
    const stadiumIdByTeamName = new Map<string, number>();
    for (const s of STADIUMS) {
      const r = await client.query(
        `INSERT INTO stadiums (name, city, capacity)
         VALUES ($1, $2, $3)
         RETURNING stadium_id`,
        [s.stadium, s.city, s.capacity],
      );
      stadiumIdByTeamName.set(s.teamName, r.rows[0].stadium_id);
    }

    // ---- 2. TEAMS ----
    console.log(` Injecting ${teamsData.length} teams...`);
    const teamIdMap = new Map<number, number>();             // FPL team id → DB team_id
    for (const team of teamsData) {
      const stadiumId = stadiumIdByTeamName.get(team.name) ?? null;
      const r = await client.query(
        `INSERT INTO teams (name, short_code, stadium_id)
         VALUES ($1, $2, $3)
         RETURNING team_id`,
        [team.name, team.short_name, stadiumId],
      );
      teamIdMap.set(Number(team.id), r.rows[0].team_id);
    }

    // ---- 3. PLAYERS ----
    console.log(`🏃 Injecting ${playersData.length} players...`);
    const positionMap: Record<string, string> = { '1': 'GK', '2': 'DF', '3': 'MF', '4': 'FW' };
    const playerIdMap = new Map<number, number>();           // FPL element id → DB player_id

    for (const player of playersData) {
      const dbTeamId = teamIdMap.get(Number(player.team));
      if (!dbTeamId) continue;

      const fullName = `${player.first_name} ${player.second_name}`.trim();
      const position = positionMap[player.element_type] || 'MF';

      const r = await client.query(
        `INSERT INTO players (full_name, position, team_id, jersey_number)
         VALUES ($1, $2, $3, NULL)
         RETURNING player_id`,
        [fullName, position, dbTeamId],
      );
      playerIdMap.set(Number(player.id), r.rows[0].player_id);
    }

    // ---- 4. MATCHES (FIXTURES) ----
    console.log(` Injecting fixtures...`);
    const matchIdMap = new Map<number, number>();            // FPL fixture id → DB match_id
    let matchCount = 0;

    for (const f of fixturesData) {
      const homeId = teamIdMap.get(Number(f.team_h));
      const awayId = teamIdMap.get(Number(f.team_a));
      if (!homeId || !awayId) continue;
      if (!f.kickoff_time) continue;                          // skip TBD fixtures

      const finished = String(f.finished).toLowerCase() === 'true';
      const r = await client.query(
        `INSERT INTO matches
            (season, match_date, home_team_id, away_team_id, home_score, away_score, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING match_id`,
        [
          SEASON_TAG,
          f.kickoff_time,
          homeId,
          awayId,
          Number(f.team_h_score) || 0,
          Number(f.team_a_score) || 0,
          finished ? 'finished' : 'scheduled',
        ],
      );
      matchIdMap.set(Number(f.id), r.rows[0].match_id);
      matchCount++;
    }
    console.log(`   ✓ ${matchCount} matches`);

    // ---- 5. MATCH EVENTS (GOALS + ASSISTS) ----
    console.log(` Synthesising goal/assist events from gameweek data...`);

    // Group gameweek rows by fixture so we can spread minutes within each match.
    type Contribution = { playerExtId: number; goals: number; assists: number };
    const byFixture = new Map<number, Contribution[]>();

    for (const row of gwData) {
      const fixtureId = Number(row.fixture);
      const goals     = Number(row.goals_scored) || 0;
      const assists   = Number(row.assists)      || 0;
      if (goals === 0 && assists === 0) continue;

      const list = byFixture.get(fixtureId) ?? [];
      list.push({ playerExtId: Number(row.element), goals, assists });
      byFixture.set(fixtureId, list);
    }

    let goalCount = 0;
    let assistCount = 0;

    for (const [fixtureExtId, contributions] of byFixture) {
      const matchId = matchIdMap.get(fixtureExtId);
      if (!matchId) continue;

      const totalGoals = contributions.reduce((sum, c) => sum + c.goals, 0);
      const goalMinutes = spreadMinutes(totalGoals);
      let goalSlot = 0;

      // Insert goals
      for (const c of contributions) {
        const playerId = playerIdMap.get(c.playerExtId);
        if (!playerId || c.goals === 0) continue;
        for (let i = 0; i < c.goals; i++) {
          const minute = goalMinutes[goalSlot++] ?? 90;
          await client.query(
            `INSERT INTO match_events (match_id, player_id, event_type, minute)
             VALUES ($1, $2, 'Goal', $3)`,
            [matchId, playerId, minute],
          );
          goalCount++;
        }
      }

      // Insert assists as separate rows. Your schema's event_type allows
      // 'Goal' or 'Assist' but has no FK to a specific goal — keeping it
      // simple matches the existing controller's expectations.
      for (const c of contributions) {
        const playerId = playerIdMap.get(c.playerExtId);
        if (!playerId || c.assists === 0) continue;
        // Spread assists across the same window
        const assistMinutes = spreadMinutes(c.assists);
        for (let i = 0; i < c.assists; i++) {
          await client.query(
            `INSERT INTO match_events (match_id, player_id, event_type, minute)
             VALUES ($1, $2, 'Assist', $3)`,
            [matchId, playerId, assistMinutes[i] ?? 90],
          );
          assistCount++;
        }
      }
    }
    console.log(`   ✓ ${goalCount} goals, ${assistCount} assists`);

    console.log('\n Done. FPL 2024-25 data injected into your database.');
  } catch (error) {
    console.error(' Error injecting data:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedDatabase();