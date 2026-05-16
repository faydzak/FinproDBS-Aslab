"use client";

import Link from "next/link";
import React, { useState } from "react";

type AdminSummary = {
  teams: number;
  players: number;
  matches: number;
};

type Team = {
  id: number;
  name: string;
};

type Player = {
  id: number;
  name: string;
  team: string;
  position: string;
};

type Match = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: string;
};

type AddMatchForm = {
  season: string;
  matchDate: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: string;
  awayScore: string;
  status: string;
};

type EditMatchForm = {
  matchId: string;
  homeScore: string;
  awayScore: string;
  status: string;
};

export default function AdminPage() {
  const [summary, setSummary] = useState<AdminSummary>({
    teams: 0,
    players: 0,
    matches: 0,
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [hasLoaded, setHasLoaded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [addForm, setAddForm] = useState<AddMatchForm>({
    season: "",
    matchDate: "",
    homeTeamId: "",
    awayTeamId: "",
    homeScore: "0",
    awayScore: "0",
    status: "scheduled",
  });

  const [editForm, setEditForm] = useState<EditMatchForm>({
    matchId: "",
    homeScore: "",
    awayScore: "",
    status: "finished",
  });

  const [playerIdToDelete, setPlayerIdToDelete] = useState("");

  const fetchAdminData = React.useCallback(async () => {
    try {
      const [summaryResponse, teamsResponse, playersResponse, matchesResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/admin/summary", {
            method: "GET",
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/teams", {
            method: "GET",
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/players", {
            method: "GET",
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/matches", {
            method: "GET",
            credentials: "include",
          }),
        ]);

      const summaryData = await summaryResponse.json();
      const teamsData = await teamsResponse.json();
      const playersData = await playersResponse.json();
      const matchesData = await matchesResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryData.error || "Failed to load admin summary");
      }

      if (!teamsResponse.ok) {
        throw new Error(teamsData.error || "Failed to load teams");
      }

      if (!playersResponse.ok) {
        throw new Error(playersData.error || "Failed to load players");
      }

      if (!matchesResponse.ok) {
        throw new Error(matchesData.error || "Failed to load matches");
      }

      setSummary(summaryData);
      setTeams(teamsData);
      setPlayers(playersData);
      setMatches(matchesData);
    } catch (error) {
      console.error("Admin data error:", error);
      setMessage(
        error instanceof Error ? error.message : "Unable to load admin data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  if (!hasLoaded) {
    setHasLoaded(true);
    void fetchAdminData();
  }

  const handleAddMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/admin/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          season: addForm.season,
          matchDate: addForm.matchDate,
          homeTeamId: Number(addForm.homeTeamId),
          awayTeamId: Number(addForm.awayTeamId),
          homeScore: Number(addForm.homeScore),
          awayScore: Number(addForm.awayScore),
          status: addForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add match");
      }

      setMessage("Match added successfully.");
      setAddForm({
        season: "",
        matchDate: "",
        homeTeamId: "",
        awayTeamId: "",
        homeScore: "0",
        awayScore: "0",
        status: "scheduled",
      });

      void fetchAdminData();
    } catch (error) {
      console.error("Add match error:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to add match.",
      );
    }
  };

  const handleEditMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/matches/${editForm.matchId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            homeScore:
              editForm.homeScore === ""
                ? undefined
                : Number(editForm.homeScore),
            awayScore:
              editForm.awayScore === ""
                ? undefined
                : Number(editForm.awayScore),
            status: editForm.status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update match");
      }

      setMessage("Match updated successfully.");
      setEditForm({
        matchId: "",
        homeScore: "",
        awayScore: "",
        status: "finished",
      });

      void fetchAdminData();
    } catch (error) {
      console.error("Edit match error:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to update match.",
      );
    }
  };

  const handleDeletePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/players/${playerIdToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete player");
      }

      setMessage("Player deleted successfully.");
      setPlayerIdToDelete("");
      void fetchAdminData();
    } catch (error) {
      console.error("Delete player error:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to delete player.",
      );
    }
  };

  const selectedMatch = matches.find(
    (match) => String(match.id) === editForm.matchId,
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition mb-6"
        >
          ← Back to home
        </Link>

        <div className="mb-8">
          <p className="text-emerald-400 font-semibold">Admin Dashboard</p>

          <h1 className="text-4xl font-bold mt-1">Management Panel</h1>

          <p className="text-slate-400 mt-2">
            Add matches, update match results and manage players.
          </p>
        </div>

        {message && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 text-slate-300">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-slate-400 text-sm">Teams</p>
            <h2 className="text-4xl font-black text-emerald-400 mt-3">
              {loading ? "..." : summary.teams}
            </h2>
          </article>

          <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-slate-400 text-sm">Players</p>
            <h2 className="text-4xl font-black text-blue-400 mt-3">
              {loading ? "..." : summary.players}
            </h2>
          </article>

          <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-slate-400 text-sm">Matches</p>
            <h2 className="text-4xl font-black text-yellow-400 mt-3">
              {loading ? "..." : summary.matches}
            </h2>
          </article>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleAddMatch}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-5">Add Match</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Season, e.g. 2025/2026"
                value={addForm.season}
                onChange={(e) =>
                  setAddForm({ ...addForm, season: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                required
              />

              <input
                type="date"
                value={addForm.matchDate}
                onChange={(e) =>
                  setAddForm({ ...addForm, matchDate: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                required
              />

              <select
                value={addForm.homeTeamId}
                onChange={(e) =>
                  setAddForm({ ...addForm, homeTeamId: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                required
              >
                <option value="">Select home team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <select
                value={addForm.awayTeamId}
                onChange={(e) =>
                  setAddForm({ ...addForm, awayTeamId: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                required
              >
                <option value="">Select away team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Home Score"
                value={addForm.homeScore}
                onChange={(e) =>
                  setAddForm({ ...addForm, homeScore: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                type="number"
                placeholder="Away Score"
                value={addForm.awayScore}
                onChange={(e) =>
                  setAddForm({ ...addForm, awayScore: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              />

              <select
                value={addForm.status}
                onChange={(e) =>
                  setAddForm({ ...addForm, status: e.target.value })
                }
                className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition"
            >
              Add Match
            </button>
          </form>

          <div className="space-y-8">
            <form
              onSubmit={handleEditMatch}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-5">Update Match Result</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={editForm.matchId}
                  onChange={(e) => {
                    const match = matches.find(
                      (item) => String(item.id) === e.target.value,
                    );

                    setEditForm({
                      matchId: e.target.value,
                      homeScore:
                        match?.homeScore === null ||
                        match?.homeScore === undefined
                          ? ""
                          : String(match.homeScore),
                      awayScore:
                        match?.awayScore === null ||
                        match?.awayScore === undefined
                          ? ""
                          : String(match.awayScore),
                      status: match?.status || "finished",
                    });
                  }}
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Select match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.id} — {match.homeTeam} vs {match.awayTeam} —{" "}
                      {match.matchDate}
                    </option>
                  ))}
                </select>

                {selectedMatch && (
                  <div className="md:col-span-2 bg-slate-800/70 border border-slate-700 rounded-2xl p-4">
                    <p className="text-sm text-slate-400">Selected match</p>
                    <p className="font-bold mt-1">
                      {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Current score: {selectedMatch.homeScore ?? "-"} -{" "}
                      {selectedMatch.awayScore ?? "-"} | Status:{" "}
                      {selectedMatch.status}
                    </p>
                  </div>
                )}

                <input
                  type="number"
                  placeholder="Home Score"
                  value={editForm.homeScore}
                  onChange={(e) =>
                    setEditForm({ ...editForm, homeScore: e.target.value })
                  }
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  type="number"
                  placeholder="Away Score"
                  value={editForm.awayScore}
                  onChange={(e) =>
                    setEditForm({ ...editForm, awayScore: e.target.value })
                  }
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="finished">Finished</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-5 bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-3 rounded-xl transition"
              >
                Update Match
              </button>
            </form>

            <form
              onSubmit={handleDeletePlayer}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-5">Delete Player</h2>

              <select
                value={playerIdToDelete}
                onChange={(e) => setPlayerIdToDelete(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                required
              >
                <option value="">Select player to delete</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    #{player.id} — {player.name} — {player.team} —{" "}
                    {player.position}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full mt-5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold px-5 py-3 rounded-xl transition"
              >
                Delete Player
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
