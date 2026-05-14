import type { Request, Response } from 'express';
import pool from '../db.js';

/**
 * GET /api/teams
 * Grid of clubs with computed points (3 for a win, 1 for a draw).
 */
export async function getAllTeams(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      WITH team_matches AS (
        SELECT
          t.team_id,
          CASE WHEN m.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END AS goals_for,
          CASE WHEN m.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END AS goals_against
        FROM teams t
        JOIN matches m
          ON m.status = 'finished'
         AND (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
      )
      SELECT
        t.team_id                                  AS id,
        t.name                                     AS name,
        t.short_code                               AS "shortCode",
        COALESCE(s.name, '')                       AS stadium,
        (COALESCE(SUM(CASE WHEN tm.goals_for > tm.goals_against THEN 1 END), 0) * 3
        + COALESCE(SUM(CASE WHEN tm.goals_for = tm.goals_against THEN 1 END), 0))::int AS points
      FROM teams t
      LEFT JOIN stadiums s ON s.stadium_id = t.stadium_id
      LEFT JOIN team_matches tm ON tm.team_id = t.team_id
      GROUP BY t.team_id, t.name, t.short_code, s.name
      ORDER BY points DESC, t.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[teams] getAllTeams failed', err);
    res.status(500).json({ error: 'Failed to load teams' });
  }
}

/**
 * GET /api/teams/:id
 * Single team + full squad.
 */
export async function getTeamById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid team id' });
    return;
  }

  try {
    const teamResult = await pool.query(
      `
      SELECT
        t.team_id              AS id,
        t.name                 AS name,
        t.short_code           AS "shortCode",
        COALESCE(s.name, '')   AS stadium,
        COALESCE(s.city, '')   AS city,
        s.capacity             AS capacity
      FROM teams t
      LEFT JOIN stadiums s ON s.stadium_id = t.stadium_id
      WHERE t.team_id = $1
      `,
      [id],
    );

    if (teamResult.rows.length === 0) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const playersResult = await pool.query(
      `
      SELECT
        player_id    AS id,
        full_name    AS name,
        position     AS position
      FROM players
      WHERE team_id = $1
      ORDER BY full_name ASC
      `,
      [id],
    );

    res.json({
      ...teamResult.rows[0],
      players: playersResult.rows,
    });
  } catch (err) {
    console.error('[teams] getTeamById failed', err);
    res.status(500).json({ error: 'Failed to load team' });
  }
}