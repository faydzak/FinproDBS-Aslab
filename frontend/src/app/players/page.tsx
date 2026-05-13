"use client";

import React, { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
  team: string;
  position: string;
  nationality: string;
  age: number;
  goals: number;
  assists: number;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/players");
        const data: Player[] = await response.json();

        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);

        // Temporary data while backend is not ready.
        setPlayers([
          {
            id: 1,
            name: "Erling Haaland",
            team: "Manchester City",
            position: "Forward",
            nationality: "Norway",
            age: 25,
            goals: 27,
            assists: 5,
          },
          {
            id: 2,
            name: "Bukayo Saka",
            team: "Arsenal",
            position: "Winger",
            nationality: "England",
            age: 24,
            goals: 14,
            assists: 11,
          },
          {
            id: 3,
            name: "Mohamed Salah",
            team: "Liverpool",
            position: "Forward",
            nationality: "Egypt",
            age: 33,
            goals: 19,
            assists: 10,
          },
        ]);
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

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-emerald-400 font-semibold">Premier League</p>

            <h1 className="text-4xl font-bold mt-1">Players</h1>

            <p className="text-slate-400 mt-2">
              View player profiles and performance statistics.
            </p>
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition">
            + Add Player
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
          <input
            type="text"
            placeholder="Search by player, team or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <p className="p-6 text-slate-400">Loading players...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-300 text-sm">
                  <tr>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Nationality</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Goals</th>
                    <th className="px-6 py-4">Assists</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                    >
                      <td className="px-6 py-4 font-semibold">{player.name}</td>

                      <td className="px-6 py-4 text-slate-300">
                        {player.team}
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                          {player.position}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {player.nationality}
                      </td>

                      <td className="px-6 py-4 text-slate-300">{player.age}</td>

                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {player.goals}
                      </td>

                      <td className="px-6 py-4 font-bold text-blue-400">
                        {player.assists}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm">
                            Edit
                          </button>

                          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg text-sm">
                            Delete
                          </button>
                        </div>
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
