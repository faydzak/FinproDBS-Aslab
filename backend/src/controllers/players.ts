import type { Request, Response } from 'express';
import pool from '../db.js';

export async function getAllPlayers(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT
        p.player_id                                              AS id,
        p.full_name                                              AS name,
        COALESCE(t.name, '')                                     AS team,
        p.position                                               AS position,
        COALESCE(p.nationality, '')                              AS nationality,
        COALESCE(EXTRACT(YEAR FROM AGE(p.date_of_birth))::int, 0) AS age,
        COUNT(*) FILTER (WHERE me.event_type = 'Goal')::int      AS goals,
        COUNT(*) FILTER (WHERE me.event_type = 'Assist')::int    AS assists
      FROM players p
      LEFT JOIN teams t        ON t.team_id = p.team_id
      LEFT JOIN match_events me ON me.player_id = p.player_id
      GROUP BY p.player_id, t.name
      ORDER BY p.full_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[players] getAllPlayers failed', err);
    res.status(500).json({ error: 'Failed to load players' });
  }
}

export async function getPlayerById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid player id' });
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT
        p.player_id                                              AS id,
        p.full_name                                              AS name,
        COALESCE(t.name, '')                                     AS team,
        p.position                                               AS position,
        COALESCE(p.nationality, '')                              AS nationality,
        COALESCE(EXTRACT(YEAR FROM AGE(p.date_of_birth))::int, 0) AS age,
        p.jersey_number                                          AS "jerseyNumber",
        COUNT(*) FILTER (WHERE me.event_type = 'Goal')::int      AS goals,
        COUNT(*) FILTER (WHERE me.event_type = 'Assist')::int    AS assists
      FROM players p
      LEFT JOIN teams t        ON t.team_id = p.team_id
      LEFT JOIN match_events me ON me.player_id = p.player_id
      WHERE p.player_id = $1
      GROUP BY p.player_id, t.name
      `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[players] getPlayerById failed', err);
    res.status(500).json({ error: 'Failed to load player' });
  }
}
