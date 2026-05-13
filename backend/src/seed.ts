import Papa from 'papaparse';
import pool from './db.js';

// Raw GitHub URLs from Vaastav's 2024-25 repository
const TEAMS_CSV_URL = 'https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/2024-25/teams.csv';
const PLAYERS_CSV_URL = 'https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/2024-25/players_raw.csv';

// Helper function to fetch and parse CSVs
async function fetchAndParseCSV(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return Papa.parse<any>(text, { header: true, skipEmptyLines: true }).data;
}

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('⬇ Fetching data from GitHub...');
    const teamsData = await fetchAndParseCSV(TEAMS_CSV_URL);
    const playersData = await fetchAndParseCSV(PLAYERS_CSV_URL);

    // Optional: Clear existing data so you don't get duplicate errors if you run this twice
    console.log(' Clearing old teams and players...');
    await client.query('TRUNCATE TABLE players, teams CASCADE');

    console.log(` Injecting ${teamsData.length} Teams...`);
    // FPL uses specific numeric IDs for teams (e.g., Arsenal = 1). 
    // We need to map Vaastav's FPL Team ID to your database's generated team_id
    const teamIdMap = new Map<number, number>();

    for (const team of teamsData) {
      const result = await client.query(
        `INSERT INTO teams (name, short_code) 
         VALUES ($1, $2) 
         RETURNING team_id`,
        [team.name, team.short_name]
      );
      // Save the mapping for when we insert players
      teamIdMap.set(Number(team.id), result.rows[0].team_id);
    }

    console.log(`🏃‍♂️ Injecting ${playersData.length} Players...`);
    // FPL position mapping: 1=GK, 2=DF, 3=MF, 4=FW
    const positionMap: Record<string, string> = { '1': 'GK', '2': 'DF', '3': 'MF', '4': 'FW' };

    for (const player of playersData) {
      // Find the database team_id we generated earlier
      const dbTeamId = teamIdMap.get(Number(player.team));
      if (!dbTeamId) continue;

      const fullName = `${player.first_name} ${player.second_name}`.trim();
      const position = positionMap[player.element_type] || 'MF';

      // Note: We insert NULL for jersey_number because FPL data doesn't reliably provide it,
      // and your UNIQUE constraint safely allows multiple NULLs.
      await client.query(
        `INSERT INTO players (full_name, position, team_id, jersey_number) 
         VALUES ($1, $2, $3, NULL)`,
        [fullName, position, dbTeamId]
      );
    }

    console.log(' Success! FPL Data injected into your Neon database.');
  } catch (error) {
    console.error(' Error injecting data:', error);
  } finally {
    client.release(); // Return connection to the pool
    process.exit(0);  // Close the script
  }
}

seedDatabase();