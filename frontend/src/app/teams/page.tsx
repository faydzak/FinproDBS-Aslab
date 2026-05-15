"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type Team = {
  id: number;
  name: string;
  shortCode: string;
  stadium: string;
  points: number;
};

const TEAMS_PER_PAGE = 12;

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(TEAMS_PER_PAGE);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/teams", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load teams");
        }

        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((team) =>
    `${team.name} ${team.shortCode} ${team.stadium}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const visibleTeams = filteredTeams.slice(0, visibleCount);
  const hasMoreTeams = visibleCount < filteredTeams.length;

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
            <h1 className="text-4xl font-bold mt-1">Teams</h1>
            <p className="text-slate-400 mt-2">
              Explore all clubs, their stadiums and points tally.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
          <input
            type="text"
            placeholder="Search by team name, short code or stadium..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(TEAMS_PER_PAGE);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
          <p className="text-slate-400 text-sm mt-3">
            Showing {visibleTeams.length} of {filteredTeams.length} teams
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-slate-400">Loading teams...</p>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
            <p className="text-slate-400">No teams found.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl p-6 shadow-xl transition flex flex-col gap-4"
                >
                  {/* Badge + points */}
                  <div className="flex items-center justify-between">
                    <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-3 py-1 rounded-full">
                      {team.shortCode}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      <span className="text-emerald-400 font-bold text-base">{team.points}</span> pts
                    </span>
                  </div>

                  {/* Team name */}
                  <div>
                    <h2 className="text-xl font-bold group-hover:text-emerald-400 transition">
                      {team.name}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {team.stadium || "Unknown stadium"}
                    </p>
                  </div>

                  {/* View squad link */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mt-auto">
                    View squad
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>

            {hasMoreTeams && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((prev) => prev + TEAMS_PER_PAGE)}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition"
                >
                  See more
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}