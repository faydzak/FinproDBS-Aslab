import type { Request, Response } from 'express';
import pool from '../db.js';

/**
 * GET /api/dashboard
 
 */
export async function getDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const [teams, players, matches, topScorer, latestMatch] = await Promise.all([
      pool.query<{ count: string }>('SELECT COUNT(*) FROM teams'),
      pool.query<{ count: string }>('SELECT COUNT(*) FROM players'),
      pool.query<{ count: string }>('SELECT COUNT(*) FROM matches'),
      pool.query(`
        SELECT
          p.full_name                AS "playerName",
          COALESCE(t.name, '')       AS team,
          COUNT(*)::int              AS goals
        FROM match_events me
        JOIN players p ON p.player_id = me.player_id
        LEFT JOIN teams t ON t.team_id = p.team_id
        WHERE me.event_type = 'Goal'
        GROUP BY p.full_name, t.name
        ORDER BY goals DESC
        LIMIT 1
      `),
      pool.query(`
        SELECT
          m.match_id                                  AS id,
          ht.name                                     AS "homeTeam",
          at.name                                     AS "awayTeam",
          m.home_score                                AS "homeScore",
          m.away_score                                AS "awayScore",
          TO_CHAR(m.match_date, 'YYYY-MM-DD')         AS "matchDate"
        FROM matches m
        JOIN teams ht ON ht.team_id = m.home_team_id
        JOIN teams at ON at.team_id = m.away_team_id
        WHERE m.status = 'finished'
        ORDER BY m.match_date DESC
        LIMIT 1
      `),
    ]);

    res.json({
      totalTeams:   Number(teams.rows[0]?.count   ?? 0),
      totalPlayers: Number(players.rows[0]?.count ?? 0),
      totalMatches: Number(matches.rows[0]?.count ?? 0),
      topScorer:    topScorer.rows[0]   ?? null,
      latestMatch:  latestMatch.rows[0] ?? null,
    });
  } catch (err) {
    console.error('[dashboard] getDashboard failed', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}