"use client";

import Link from "next/link";
import React from "react";

const pages = [
  {
    href: "/matches",
    label: "Matches",
    subtitle: "View all Premier League match results and fixtures",
    accent: "emerald",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20M2 12h20M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" />
      </svg>
    ),
  },
  {
    href: "/players",
    label: "Players",
    subtitle: "Browse player profiles and performance statistics",
    accent: "blue",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/teams",
    label: "Teams",
    subtitle: "Explore all clubs, their squads and points tally",
    accent: "violet",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "Standings",
    subtitle: "Live league table sorted by points and goal difference",
    accent: "amber",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    href: "/statistics",
    label: "Statistics",
    subtitle: "Top scorers, assists leaders, and league-wide stats",
    accent: "rose",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

const accentMap: Record<string, { border: string; text: string; bg: string; badge: string }> = {
  emerald: {
    border: "hover:border-emerald-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  blue: {
    border: "hover:border-blue-500",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    badge: "bg-blue-500/20 text-blue-300",
  },
  violet: {
    border: "hover:border-violet-500",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    badge: "bg-violet-500/20 text-violet-300",
  },
  amber: {
    border: "hover:border-amber-500",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    badge: "bg-amber-500/20 text-amber-300",
  },
  rose: {
    border: "hover:border-rose-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    badge: "bg-rose-500/20 text-rose-300",
  },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <section className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-emerald-400 font-semibold mb-1">Premier League</p>
          <h1 className="text-5xl font-bold mb-3">Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Your hub for Premier League data — matches, players, teams, and standings.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {pages.map((page) => {
            const accent = accentMap[page.accent];
            return (
              <Link
                key={page.href}
                href={page.href}
                className={`group bg-slate-900 border border-slate-800 ${accent.border} rounded-3xl p-7 shadow-xl transition-all duration-200 hover:shadow-2xl flex flex-col gap-5`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${accent.bg} ${accent.text} flex items-center justify-center`}>
                  {page.icon}
                </div>

                {/* Label + subtitle */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1 group-hover:text-white transition">
                    {page.label}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {page.subtitle}
                  </p>
                </div>

                {/* Arrow */}
                <div className={`flex items-center gap-2 text-sm font-semibold ${accent.text}`}>
                  View {page.label}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}