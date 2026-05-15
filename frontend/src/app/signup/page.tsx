"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SignupForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center text-3xl">
            ⚽
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">
            Join the Premier League Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Your username"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}