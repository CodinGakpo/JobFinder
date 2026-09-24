"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/jobs");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Sign-in failed");
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  }

  const input =
    "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <div className="flex flex-1 items-start justify-center bg-gradient-to-b from-indigo-50 to-white px-6 py-16 dark:from-zinc-900 dark:to-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Signing in unlocks the secure / vulnerable mode switch.
        </p>
        <p className="mt-2 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Demo credentials: <code>demo</code> / <code>jobfinder-demo</code>
        </p>
        <label htmlFor="username" className="mt-5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={input}
        />
        <label htmlFor="password" className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-10 w-full rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
