"use client";

import Link from "next/link";
import useAuth from "@/app/context/useAuth";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuth();
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative px-6 py-24">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 h-96 w-96 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 h-96 w-96 bg-blue-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* NAVBAR */}
          <nav className="flex items-center justify-between mb-24">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl">
                ⚽
              </div>
              <div>
                <h1 className="font-black text-xl">Premier League Platform</h1>
                <p className="text-slate-400 text-sm">
                  Football Match Management & Statistics
                </p>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2">
                  <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold leading-none">
                      {user.username}
                    </p>
                    <p className="text-slate-400 text-sm capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500 hover:bg-red-500/10 flex items-center justify-center transition"
                >
                  <LogOut className="text-red-400" size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="border border-slate-700 hover:border-emerald-500 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-2xl transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* HERO CONTENT */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="uppercase tracking-[0.3em] text-emerald-400 font-semibold text-sm">
                Premier League Database System
              </p>

              <h2 className="text-6xl md:text-7xl font-black leading-tight mt-6">
                Football Statistics
                <span className="text-emerald-400"> Reimagined</span>
              </h2>

              <p className="text-slate-400 text-lg mt-8 leading-relaxed max-w-2xl">
                Manage Premier League matches, players, clubs and advanced
                statistics through a modern football analytics dashboard powered
                by PostgreSQL, Node.js and Next.js.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  href="/dashboard"
                  className="border border-slate-700 hover:border-emerald-500 hover:bg-slate-900 px-8 py-4 rounded-2xl transition"
              >
                Dashboard
                </Link>
                <Link
                  href="/matches"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl transition"
              >
                Explore Matches
                </Link>
                <Link
                  href="/players"
                  className="border border-slate-700 hover:border-emerald-500 hover:bg-slate-900 px-8 py-4 rounded-2xl transition"
              >
                View Players
                </Link>
                <Link
                  href="/teams"
                  className="border border-slate-700 hover:border-emerald-500 hover:bg-slate-900 px-8 py-4 rounded-2xl transition"
              >
                View Teams
                </Link>
                <Link
                  href="/standings"
                  className="border border-slate-700 hover:border-emerald-500 hover:bg-slate-900 px-8 py-4 rounded-2xl transition"
              >
                Standings
                </Link>
                <Link
                  href="/statistics"
                  className="border border-slate-700 hover:border-emerald-500 hover:bg-slate-900 px-8 py-4 rounded-2xl transition"
              >
                View Statistics
              </Link>
            </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-6 mt-16">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-4xl font-black text-emerald-400">20</h3>
                  <p className="text-slate-400 mt-2">Premier League Teams</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-4xl font-black text-blue-400">380</h3>
                  <p className="text-slate-400 mt-2">Matches Per Season</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-4xl font-black text-yellow-400">500+</h3>
                  <p className="text-slate-400 mt-2">Player Statistics</p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="relative">
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-slate-400 text-sm">Featured Match</p>
                    <h3 className="text-2xl font-bold mt-1">Arsenal vs Chelsea</h3>
                  </div>
                  <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-semibold">
                    LIVE
                  </span>
                </div>

                <div className="bg-slate-800 rounded-3xl p-8">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-red-500 flex items-center justify-center text-3xl mx-auto">
                        A
                      </div>
                      <h4 className="font-bold mt-4">Arsenal</h4>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Emirates Stadium</p>
                      <h2 className="text-6xl font-black my-4">2 - 1</h2>
                      <p className="text-emerald-400 font-semibold">76 &apos;</p>
                    </div>
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-3xl mx-auto">
                        C
                      </div>
                      <h4 className="font-bold mt-4">Chelsea</h4>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-slate-800 rounded-2xl p-4 text-center">
                    <p className="text-slate-400 text-sm">Possession</p>
                    <h4 className="text-2xl font-bold mt-2">61%</h4>
                  </div>
                  <div className="bg-slate-800 rounded-2xl p-4 text-center">
                    <p className="text-slate-400 text-sm">Shots</p>
                    <h4 className="text-2xl font-bold mt-2">18</h4>
                  </div>
                  <div className="bg-slate-800 rounded-2xl p-4 text-center">
                    <p className="text-slate-400 text-sm">Corners</p>
                    <h4 className="text-2xl font-bold mt-2">7</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}