"use client";
import React, { useEffect, useState } from "react";

type Match = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  stadium: string;
  matchDate: string;
  status: "scheduled" | "finished" | "live";
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/matches");
        const data: Match[] = await response.json();

        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);

        // Données temporaires pour afficher le design avant que le backend soit prêt.
        setMatches([
          {
            id: 1,
            homeTeam: "Arsenal",
            awayTeam: "Chelsea",
            homeScore: 2,
            awayScore: 1,
            stadium: "Emirates Stadium",
            matchDate: "2026-05-18",
            status: "finished",
          },
          {
            id: 2,
            homeTeam: "Liverpool",
            awayTeam: "Manchester City",
            homeScore: null,
            awayScore: null,
            stadium: "Anfield",
            matchDate: "2026-05-22",
            status: "scheduled",
          },
          {
            id: 3,
            homeTeam: "Tottenham",
            awayTeam: "Manchester United",
            homeScore: 1,
            awayScore: 1,
            stadium: "Tottenham Hotspur Stadium",
            matchDate: "2026-05-20",
            status: "live",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((match) =>
    `${match.homeTeam} ${match.awayTeam}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-emerald-400 font-semibold">Premier League</p>

            <h1 className="text-4xl font-bold mt-1">Matches</h1>

            <p className="text-slate-400 mt-2">
              Manage and view Premier League match results.
            </p>
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition">
            + Add Match
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
          <input
            type="text"
            placeholder="Search by team name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        {loading ? (
          <p className="text-slate-400">Loading matches...</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <article
                key={match.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-emerald-500 transition"
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      match.status === "finished"
                        ? "bg-blue-500/20 text-blue-300"
                        : match.status === "live"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {match.status.toUpperCase()}
                  </span>

                  <span className="text-sm text-slate-400">
                    {match.matchDate}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>{match.homeTeam}</span>
                    <span>{match.homeScore ?? "-"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>{match.awayTeam}</span>
                    <span>{match.awayScore ?? "-"}</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800">
                  <p className="text-sm text-slate-400">Stadium</p>

                  <p className="font-medium">{match.stadium}</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-sm">
                    Edit
                  </button>

                  <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-xl text-sm">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
