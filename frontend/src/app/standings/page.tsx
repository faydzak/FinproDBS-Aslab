"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type Standing = {
  position: number;
  team_id: number;
  team: string;
  shortCode: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/standings", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load standings");
        }

        setStandings(data);
      } catch (error) {
        console.error("Error fetching standings:", error);
        setStandings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const positionStyle = (pos: number) => {
    if (pos <= 4) return "text-emerald-400"; // Champions League
    if (pos === 5) return "text-blue-400";   // Europa League
    if (pos >= standings.length - 2) return "text-red-400"; // Relegation
    return "text-slate-300";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition mb-6"
        >
          ← Back to home
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-emerald-400 font-semibold">Premier League</p>
            <h1 className="text-4xl font-bold mt-1">Standings</h1>
            <p className="text-slate-400 mt-2">
              League table sorted by points, goal difference, and goals scored.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Champions League (Top 4)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            Europa League (5th)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Relegation (Bottom 3)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <p className="p-6 text-slate-400">Loading standings...</p>
          ) : standings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No standings available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="px-5 py-4 w-10">#</th>
                    <th className="px-5 py-4">Club</th>
                    <th className="px-5 py-4 text-center">MP</th>
                    <th className="px-5 py-4 text-center">W</th>
                    <th className="px-5 py-4 text-center">D</th>
                    <th className="px-5 py-4 text-center">L</th>
                    <th className="px-5 py-4 text-center">GF</th>
                    <th className="px-5 py-4 text-center">GA</th>
                    <th className="px-5 py-4 text-center">GD</th>
                    <th className="px-5 py-4 text-center font-bold text-white">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr
                      key={row.team_id}
                      className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                    >
                      <td className={`px-5 py-4 font-bold ${positionStyle(row.position)}`}>
                        {row.position}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-2 py-0.5 rounded-md hidden sm:inline">
                            {row.shortCode}
                          </span>
                          <Link
                            href={`/teams/${row.team_id}`}
                            className="font-semibold hover:text-emerald-400 transition"
                          >
                            {row.team}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-slate-300">{row.played}</td>
                      <td className="px-5 py-4 text-center text-emerald-400 font-medium">{row.wins}</td>
                      <td className="px-5 py-4 text-center text-slate-300">{row.draws}</td>
                      <td className="px-5 py-4 text-center text-red-400 font-medium">{row.losses}</td>
                      <td className="px-5 py-4 text-center text-slate-300">{row.goalsFor}</td>
                      <td className="px-5 py-4 text-center text-slate-300">{row.goalsAgainst}</td>
                      <td className="px-5 py-4 text-center text-slate-300">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="px-5 py-4 text-center font-black text-white text-base">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}