"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Player = {
  id: number;
  name: string;
  position: string;
};

type TeamDetail = {
  id: number;
  name: string;
  shortCode: string;
  stadium: string;
  city: string;
  capacity: number | null;
  players: Player[];
};

export default function TeamDetailPage() {
  const params = useParams();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${params.id}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load team");
        }

        setTeam(data);
      } catch (error) {
        console.error("Error fetching team:", error);
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchTeam();
  }, [params.id]);

  const filteredPlayers = team?.players.filter((p) =>
    `${p.name} ${p.position}`.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
        <p className="text-slate-400">Loading team...</p>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
        <p className="text-slate-400">Team not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <section className="max-w-5xl mx-auto">
        <Link
          href="/teams"
          className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition mb-6"
        >
          ← Back to teams
        </Link>

        {/* Team header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center text-xl font-black">
              {team.shortCode}
            </div>
            <div className="flex-1">
              <p className="text-emerald-400 font-semibold text-sm">Premier League Club</p>
              <h1 className="text-4xl font-bold mt-1">{team.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Stadium</p>
              <p className="font-semibold">{team.stadium || "Unknown"}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">City</p>
              <p className="font-semibold">{team.city || "Unknown"}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Capacity</p>
              <p className="font-semibold">
                {team.capacity ? team.capacity.toLocaleString() : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Squad */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold">Squad</h2>
          <p className="text-slate-400 text-sm">{team.players.length} players</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6">
          <input
            type="text"
            placeholder="Search by name or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {filteredPlayers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No players found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-300 text-sm">
                  <tr>
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player, idx) => (
                    <tr
                      key={player.id}
                      className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                    >
                      <td className="px-6 py-4 text-slate-500 text-sm">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold">{player.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                          {player.position || "Unknown"}
                        </span>
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