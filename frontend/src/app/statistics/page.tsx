"use client";

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
// TYPESCRIPT: expected backend response format.

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsResponse>({
    teams: [],
    topScorers: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/statistics");
        const data: StatisticsResponse = await response.json();

        setStatistics(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);

        // Temporary frontend data while backend is not ready.
        setStatistics({
          teams: [
            {
              id: 1,
              team: "Arsenal",
              played: 38,
              wins: 26,
              draws: 7,
              losses: 5,
              goalsFor: 88,
              goalsAgainst: 31,
              points: 85,
            },
            {
              id: 2,
              team: "Manchester City",
              played: 38,
              wins: 25,
              draws: 8,
              losses: 5,
              goalsFor: 91,
              goalsAgainst: 34,
              points: 83,
            },
            {
              id: 3,
              team: "Liverpool",
              played: 38,
              wins: 24,
              draws: 9,
              losses: 5,
              goalsFor: 86,
              goalsAgainst: 41,
              points: 81,
            },
          ],
          topScorers: [
            {
              id: 1,
              playerName: "Erling Haaland",
              team: "Manchester City",
              goals: 27,
            },
            {
              id: 2,
              playerName: "Mohamed Salah",
              team: "Liverpool",
              goals: 19,
            },
            {
              id: 3,
              playerName: "Bukayo Saka",
              team: "Arsenal",
              goals: 14,
            },
          ],
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

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-emerald-400 font-semibold">Premier League</p>

          <h1 className="text-4xl font-bold mt-1">Statistics</h1>

          <p className="text-slate-400 mt-2">
            Analyze team rankings, goals and player performance.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading statistics...</p>
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

                <h2 className="text-3xl font-bold mt-3">{bestTeam?.team}</h2>

                <p className="text-emerald-400 mt-2">
                  {bestTeam?.points} points
                </p>
              </article>

              <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Teams Tracked</p>

                <h2 className="text-4xl font-bold mt-3">
                  {statistics.teams.length}
                </h2>

                <p className="text-slate-500 mt-2">Premier League clubs</p>
              </article>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-5">League Table</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-slate-400 text-sm border-b border-slate-800">
                      <tr>
                        <th className="py-3">Team</th>
                        <th className="py-3">P</th>
                        <th className="py-3">W</th>
                        <th className="py-3">D</th>
                        <th className="py-3">L</th>
                        <th className="py-3">GF</th>
                        <th className="py-3">GA</th>
                        <th className="py-3">Pts</th>
                      </tr>
                    </thead>

                    <tbody>
                      {statistics.teams.map((team) => (
                        <tr
                          key={team.id}
                          className="border-b border-slate-800 last:border-0"
                        >
                          <td className="py-4 font-semibold">{team.team}</td>

                          <td className="py-4 text-slate-300">{team.played}</td>

                          <td className="py-4 text-emerald-400">{team.wins}</td>

                          <td className="py-4 text-slate-300">{team.draws}</td>

                          <td className="py-4 text-red-300">{team.losses}</td>

                          <td className="py-4 text-slate-300">
                            {team.goalsFor}
                          </td>

                          <td className="py-4 text-slate-300">
                            {team.goalsAgainst}
                          </td>

                          <td className="py-4 font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-5">Top Scorers</h2>

                <div className="space-y-4">
                  {statistics.topScorers.map((player, index) => (
                    <article
                      key={player.id}
                      className="flex items-center justify-between bg-slate-800 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="font-bold">{player.playerName}</h3>

                          <p className="text-sm text-slate-400">
                            {player.team}
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
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
