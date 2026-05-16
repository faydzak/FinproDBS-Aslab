import type { Request, Response } from "express";
import pool from "../db.js";

// -------- GET /api/admin/summary --------
export async function getAdminSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const [teams, players, matches] = await Promise.all([
      pool.query<{ count: string }>("SELECT COUNT(*) FROM teams"),
      pool.query<{ count: string }>("SELECT COUNT(*) FROM players"),
      pool.query<{ count: string }>("SELECT COUNT(*) FROM matches"),
    ]);
    res.json({
      teams: Number(teams.rows[0]?.count ?? 0),
      players: Number(players.rows[0]?.count ?? 0),
      matches: Number(matches.rows[0]?.count ?? 0),
    });
  } catch (err) {
    console.error("[admin] getAdminSummary failed", err);
    res.status(500).json({ error: "Failed to load admin summary" });
  }
}

// -------- POST /api/admin/matches --------
export async function addMatch(req: Request, res: Response): Promise<void> {
  const {
    season,
    matchDate,
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    status,
  } = req.body as {
    season?: string;
    matchDate?: string;
    homeTeamId?: number;
    awayTeamId?: number;
    homeScore?: number;
    awayScore?: number;
    status?: string;
  };

  if (!season || !matchDate || !homeTeamId || !awayTeamId) {
    res.status(400).json({
      error: "season, matchDate, homeTeamId, awayTeamId are required",
    });
    return;
  }
  if (homeTeamId === awayTeamId) {
    res.status(400).json({ error: "home and away teams must differ" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO matches (season, match_date, home_team_id, away_team_id, home_score, away_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING match_id AS id`,
      [
        season,
        matchDate,
        homeTeamId,
        awayTeamId,
        homeScore ?? 0,
        awayScore ?? 0,
        status ?? "scheduled",
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[admin] addMatch failed", err);
    res.status(500).json({ error: "Failed to add match" });
  }
}

// -------- PUT /api/admin/matches/:id --------
export async function editMatchResult(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params["id"]);
  const { homeScore, awayScore, status } = req.body as {
    homeScore?: number;
    awayScore?: number;
    status?: string;
  };

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid match id" });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE matches
          SET home_score = COALESCE($1, home_score),
              away_score = COALESCE($2, away_score),
              status     = COALESCE($3, status)
        WHERE match_id = $4
        RETURNING match_id AS id, home_score AS "homeScore", away_score AS "awayScore", status`,
      [homeScore ?? null, awayScore ?? null, status ?? null, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[admin] editMatchResult failed", err);
    res.status(500).json({ error: "Failed to update match" });
  }
}

// -------- DELETE /api/admin/players/:id --------
export async function deletePlayer(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid player id" });
    return;
  }

  // We first use a transaction to safely delete related match events first,
  // then delete the player to avoid foreign key constraint errors.
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Delete all match events linked to this player
    await client.query("DELETE FROM match_events WHERE player_id = $1", [id]);

    // Delete the player
    const result = await client.query(
      "DELETE FROM players WHERE player_id = $1 RETURNING player_id",
      [id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      res.status(404).json({ error: "Player not found" });
      return;
    }

    await client.query("COMMIT");

    res.status(204).end();
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("[admin] deletePlayer failed", err);

    res.status(500).json({ error: "Failed to delete player" });
  } finally {
    client.release();
  }
}
