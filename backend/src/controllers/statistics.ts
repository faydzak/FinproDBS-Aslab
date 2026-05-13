import type { Request, Response } from 'express';
import pool from '../db.js';

export async function getStatistics(_req: Request, res: Response): Promise<void> {
  try {
    const teamsQuery = pool.query(`
      WITH team_matches AS (
        SELECT
          t.team_id,
          t.name AS team,
          CASE WHEN m.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END AS goals_for,
          CASE WHEN m.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END AS goals_against
        FROM teams t
        JOIN matches m
          ON m.status = 'finished'
         AND (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
      )
      SELECT
        team_id                                                            AS id,
        team                                                               AS team,
        COUNT(*)::int                                                      AS played,
        COUNT(*) FILTER (WHERE goals_for > goals_against)::int             AS wins,
        COUNT(*) FILTER (WHERE goals_for = goals_against)::int             AS draws,
        COUNT(*) FILTER (WHERE goals_for < goals_against)::int             AS losses,
        COALESCE(SUM(goals_for), 0)::int                                   AS "goalsFor",
        COALESCE(SUM(goals_against), 0)::int                               AS "goalsAgainst",
        (COUNT(*) FILTER (WHERE goals_for > goals_against) * 3
        + COUNT(*) FILTER (WHERE goals_for = goals_against))::int          AS points
      FROM team_matches
      GROUP BY team_id, team
      ORDER BY points DESC, ("goalsFor" - "goalsAgainst") DESC, "goalsFor" DESC
    `);

    const topScorersQuery = pool.query(`
      SELECT
        p.player_id          AS id,
        p.full_name          AS "playerName",
        COALESCE(t.name, '') AS team,
        COUNT(*)::int        AS goals
      FROM match_events me
      JOIN players p ON p.player_id = me.player_id
      LEFT JOIN teams t ON t.team_id = p.team_id
      WHERE me.event_type = 'Goal'
      GROUP BY p.player_id, t.name
      ORDER BY goals DESC, p.full_name ASC
      LIMIT 10
    `);

    const [teamsResult, topScorersResult] = await Promise.all([teamsQuery, topScorersQuery]);

    res.json({
      teams: teamsResult.rows,
      topScorers: topScorersResult.rows,
    });
  } catch (err) {
    console.error('[statistics] getStatistics failed', err);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
}
