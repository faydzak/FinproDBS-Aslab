"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
        const response = await fetch("http://localhost:4000/api/matches", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load matches");
        }

        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((match) =>
    `${match.homeTeam} ${match.awayTeam} ${match.stadium} ${match.matchDate}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const groupedByDate = filteredMatches.reduce<Record<string, Match[]>>((acc, match) => {
    const date = match.matchDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort();

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

            <h1 className="text-4xl font-bold mt-1">Matches</h1>

            <p className="text-slate-400 mt-2">
              Manage and view Premier League match results.
            </p>
          </div>

          {/* <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition">
            + Add Match
          </button> */}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
          <input
            type="text"
            placeholder="Search by team name, stadium, date, year..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />

          <p className="text-slate-400 text-sm mt-3">
            {filteredMatches.length} matches across {dates.length} matchdays
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading matches...</p>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
            <p className="text-slate-400">No matches found.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {dates.map((date) => (
              <section key={date}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                  <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-sm font-semibold">
                    {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="text-slate-600 text-sm font-normal">{groupedByDate[date].length} matches</span>
                </h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groupedByDate[date].map((match) => (
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
                        <span className="text-sm text-slate-400">{match.matchDate}</span>
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
                        <p className="font-medium">{match.stadium || "Unknown stadium"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
