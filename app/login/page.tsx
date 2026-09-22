"use client";

import { FormEvent, useState } from "react";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error || "Login gagal.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/tools/audio-upload-approved";
    window.location.assign(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#16100d] px-6 text-[#fff4e4]">
      <form onSubmit={submit} className="w-full max-w-sm border border-[#e7a071]/30 bg-[#241813] p-7 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[.28em] text-[#e7a071]">Campucino Community</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[#cbbcaf]">Login diperlukan untuk mengakses Tools.</p>
        <label className="mt-7 block text-xs uppercase tracking-[.15em] text-[#cbbcaf]">Username<input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full border border-[#e7a071]/30 bg-[#16100d] px-3 py-3 text-sm outline-none focus:border-[#ffd08a]" autoComplete="username" /></label>
        <label className="mt-4 block text-xs uppercase tracking-[.15em] text-[#cbbcaf]">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full border border-[#e7a071]/30 bg-[#16100d] px-3 py-3 text-sm outline-none focus:border-[#ffd08a]" autoComplete="current-password" /></label>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="mt-6 w-full bg-[#ffd08a] px-4 py-3 text-sm font-semibold text-[#241813] disabled:opacity-60">{loading ? "Checking..." : "Login"}</button>
      </form>
    </main>
  );
}
