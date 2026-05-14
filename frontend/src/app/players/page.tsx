"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
  team: string;
  position: string;
  goals: number;
  assists: number;
};

const PLAYERS_PER_PAGE = 10;

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PLAYERS_PER_PAGE);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/players", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load players");
        }

        setPlayers(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching players:", error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((player) =>
    `${player.name} ${player.team} ${player.position}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const visiblePlayers = filteredPlayers.slice(0, visibleCount);
  const hasMorePlayers = visibleCount < filteredPlayers.length;

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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-emerald-400 font-semibold">Premier League</p>

              <h1 className="text-4xl font-bold mt-1">Players</h1>

              <p className="text-slate-400 mt-2">
                View player profiles and performance statistics.
              </p>
            </div>

            {/* <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition">
              + Add Player
            </button> */}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
          <input
            type="text"
            placeholder="Search by player, team, or position..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PLAYERS_PER_PAGE);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />

          <p className="text-slate-400 text-sm mt-3">
            Showing {visiblePlayers.length} of {filteredPlayers.length} players
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <p className="p-6 text-slate-400">Loading players...</p>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No players found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-300 text-sm">
                  <tr>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Goals</th>
                    <th className="px-6 py-4">Assists</th>
                    {/* <th className="px-6 py-4">Actions</th> */}
                  </tr>
                </thead>

                <tbody>
                  {visiblePlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                    >
                      <td className="px-6 py-4 font-semibold">{player.name}</td>

                      <td className="px-6 py-4 text-slate-300">
                        {player.team || "Unknown team"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                          {player.position || "Unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {player.goals}
                      </td>

                      <td className="px-6 py-4 font-bold text-blue-400">
                        {player.assists}
                      </td>

                      {/* <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm transition">
                            Edit
                          </button>

                          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg text-sm transition">
                            Delete
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && hasMorePlayers && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() =>
                setVisibleCount((previous) => previous + PLAYERS_PER_PAGE)
              }
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition"
            >
              See more
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
