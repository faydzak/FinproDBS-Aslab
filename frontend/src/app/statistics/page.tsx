"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type TeamStatistic = {
  id: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

type TopScorer = {
  id: number;
  playerName: string;
  team: string;
  goals: number;
};

type StatisticsResponse = {
  teams: TeamStatistic[];
  topScorers: TopScorer[];
};

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsResponse>({
    teams: [],
    topScorers: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/statistics", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load statistics");
        }

        setStatistics(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatistics({
          teams: [],
          topScorers: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const totalGoals = statistics.teams.reduce(
    (sum, team) => sum + team.goalsFor,
    0,
  );

  const bestTeam = statistics.teams.reduce<TeamStatistic | null>(
    (best, team) => {
      if (!best || team.points > best.points) {
        return team;
      }

      return best;
    },
    null,
  );

  const bestScorer = statistics.topScorers[0];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition mb-6"
          >
            ← Back to home
          </Link>

          <p className="text-emerald-400 font-semibold">Premier League</p>

          <h1 className="text-4xl font-bold mt-1">Statistics</h1>

          <p className="text-slate-400 mt-2">
            Analyze team rankings, goals and player performance.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading statistics...</p>
        ) : statistics.teams.length === 0 &&
          statistics.topScorers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
            <p className="text-slate-400">No statistics found.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Total Goals</p>

                <h2 className="text-4xl font-bold mt-3 text-emerald-400">
                  {totalGoals}
                </h2>

                <p className="text-slate-500 mt-2">Goals scored by all teams</p>
              </article>

              <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Best Team</p>

                <h2 className="text-3xl font-bold mt-3">
                  {bestTeam?.team || "No team"}
                </h2>

                <p className="text-emerald-400 mt-2">
                  {bestTeam ? `${bestTeam.points} points` : "No points"}
                </p>
              </article>

              <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Top Scorer</p>

                <h2 className="text-3xl font-bold mt-3">
                  {bestScorer?.playerName || "No scorer"}
                </h2>

                <p className="text-emerald-400 mt-2">
                  {bestScorer ? `${bestScorer.goals} goals` : "No goals"}
                </p>
              </article>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold">League Table</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Ranking based on finished matches
                    </p>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold">
                    {statistics.teams.length} teams
                  </span>
                </div>

                {statistics.teams.length === 0 ? (
                  <p className="text-slate-400">No team statistics found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-slate-400 text-sm border-b border-slate-800">
                        <tr>
                          <th className="py-3 pr-4">#</th>
                          <th className="py-3 pr-4">Team</th>
                          <th className="py-3 pr-4">P</th>
                          <th className="py-3 pr-4">W</th>
                          <th className="py-3 pr-4">D</th>
                          <th className="py-3 pr-4">L</th>
                          <th className="py-3 pr-4">GF</th>
                          <th className="py-3 pr-4">GA</th>
                          <th className="py-3 pr-4">GD</th>
                          <th className="py-3 pr-4">Pts</th>
                        </tr>
                      </thead>

                      <tbody>
                        {statistics.teams.map((team, index) => (
                          <tr
                            key={team.id}
                            className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition"
                          >
                            <td className="py-4 pr-4 text-slate-400">
                              {index + 1}
                            </td>

                            <td className="py-4 pr-4 font-semibold">
                              {team.team}
                            </td>

                            <td className="py-4 pr-4 text-slate-300">
                              {team.played}
                            </td>

                            <td className="py-4 pr-4 text-emerald-400">
                              {team.wins}
                            </td>

                            <td className="py-4 pr-4 text-slate-300">
                              {team.draws}
                            </td>

                            <td className="py-4 pr-4 text-red-300">
                              {team.losses}
                            </td>

                            <td className="py-4 pr-4 text-slate-300">
                              {team.goalsFor}
                            </td>

                            <td className="py-4 pr-4 text-slate-300">
                              {team.goalsAgainst}
                            </td>

                            <td className="py-4 pr-4 text-slate-300">
                              {team.goalsFor - team.goalsAgainst}
                            </td>

                            <td className="py-4 pr-4 font-bold text-white">
                              {team.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold">Top Scorers</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Top 10 goal scorers
                    </p>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold">
                    Goals
                  </span>
                </div>

                {statistics.topScorers.length === 0 ? (
                  <p className="text-slate-400">No top scorers found.</p>
                ) : (
                  <div className="space-y-4">
                    {statistics.topScorers.map((player, index) => (
                      <article
                        key={player.id}
                        className="flex items-center justify-between bg-slate-800 hover:bg-slate-700/70 rounded-2xl p-4 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>

                          <div>
                            <h3 className="font-bold">{player.playerName}</h3>

                            <p className="text-sm text-slate-400">
                              {player.team || "Unknown team"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400">
                            {player.goals}
                          </p>

                          <p className="text-xs text-slate-400">goals</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
