import type { Request, Response } from 'express';
import pool from '../db.js';

export async function getAllMatches(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT
        m.match_id                                AS id,
        ht.name                                   AS "homeTeam",
        at.name                                   AS "awayTeam",
        m.home_score                              AS "homeScore",
        m.away_score                              AS "awayScore",
        COALESCE(s.name, '')                      AS stadium,
        TO_CHAR(m.match_date, 'YYYY-MM-DD')       AS "matchDate",
        m.status                                  AS status
      FROM matches m
      JOIN teams ht        ON ht.team_id = m.home_team_id
      JOIN teams at        ON at.team_id = m.away_team_id
      LEFT JOIN stadiums s ON s.stadium_id = ht.stadium_id
      ORDER BY m.match_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[matches] getAllMatches failed', err);
    res.status(500).json({ error: 'Failed to load matches' });
  }
}

export async function getMatchById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid match id' });
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT
        m.match_id                                AS id,
        ht.name                                   AS "homeTeam",
        at.name                                   AS "awayTeam",
        m.home_score                              AS "homeScore",
        m.away_score                              AS "awayScore",
        COALESCE(s.name, '')                      AS stadium,
        TO_CHAR(m.match_date, 'YYYY-MM-DD')       AS "matchDate",
        m.status                                  AS status,
        m.season                                  AS season
      FROM matches m
      JOIN teams ht        ON ht.team_id = m.home_team_id
      JOIN teams at        ON at.team_id = m.away_team_id
      LEFT JOIN stadiums s ON s.stadium_id = ht.stadium_id
      WHERE m.match_id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[matches] getMatchById failed', err);
    res.status(500).json({ error: 'Failed to load match' });
  }
}
