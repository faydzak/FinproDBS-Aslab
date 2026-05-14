import type { Request, Response } from 'express';
import pool from '../db.js';

/**
 * GET /api/standings
 * League table. Sort order matches real PL: points → GD → goals scored.
 */
export async function getStandings(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      WITH team_matches AS (
        SELECT
          t.team_id,
          t.name AS team,
          t.short_code,
          CASE WHEN m.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END AS goals_for,
          CASE WHEN m.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END AS goals_against
        FROM teams t
        JOIN matches m
          ON m.status = 'finished'
         AND (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
      ),
      aggregated AS (
        SELECT
          team_id,
          team,
          short_code                                                          AS "shortCode",
          COUNT(*)::int                                                       AS played,
          COUNT(*) FILTER (WHERE goals_for > goals_against)::int              AS wins,
          COUNT(*) FILTER (WHERE goals_for = goals_against)::int              AS draws,
          COUNT(*) FILTER (WHERE goals_for < goals_against)::int              AS losses,
          COALESCE(SUM(goals_for), 0)::int                                    AS "goalsFor",
          COALESCE(SUM(goals_against), 0)::int                                AS "goalsAgainst",
          (COALESCE(SUM(goals_for), 0) - COALESCE(SUM(goals_against), 0))::int AS "goalDiff",
          (COUNT(*) FILTER (WHERE goals_for > goals_against) * 3
          + COUNT(*) FILTER (WHERE goals_for = goals_against))::int           AS points
        FROM team_matches
        GROUP BY team_id, team, short_code
      )
      SELECT
        RANK() OVER (ORDER BY points DESC, "goalDiff" DESC, "goalsFor" DESC)::int AS position,
        *
      FROM aggregated
      ORDER BY position, team
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[standings] getStandings failed', err);
    res.status(500).json({ error: 'Failed to load standings' });
  }
}