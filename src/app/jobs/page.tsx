"use client";

import { useEffect, useState } from "react";
import SearchForm from "@/components/SearchForm";
import ResultsTable from "@/components/ResultsTable";
import ModeToggle from "@/components/ModeToggle";

type Job = {
  title: string;
  company: string;
  location: string;
  salary: number;
};

type Mode = "secure" | "vulnerable";

const EXAMPLES = [
  { keyword: "Engineer", company: "Initech" },
  { keyword: "Security", company: "" },
  { keyword: "Designer", company: "" },
  { keyword: "Software", company: "Aperture" },
];

export default function JobsPage() {
  const [keyword, setKeyword] = useState("");
  const [company, setCompany] = useState("");
  const [results, setResults] = useState<Job[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);
  const [canToggle, setCanToggle] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [sql, setSql] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mode")
      .then((res) => res.json())
      .then((data) => {
        setMode(data.mode);
        setCanToggle(data.canToggle);
      })
      .catch(() => {});
  }, []);

  async function runSearch(k: string, c: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ keyword: k, company: c });
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setMode(data.mode ?? null);
      setSql(data.sql ?? null);
      if (!res.ok) {
        setResults([]);
        setError(data.error ?? `Request failed (${res.status})`);
      } else {
        setResults(data.results ?? []);
      }
      setSearched(true);
    } catch {
      setResults([]);
      setError("Could not reach the server.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function runExample(k: string, c: string) {
    setKeyword(k);
    setCompany(c);
    runSearch(k, c);
  }

  async function handleModeChange(next: Mode) {
    setSwitching(true);
    try {
      const res = await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next }),
      });
      if (res.ok) {
        setMode(next);
        // Results from the previous mode are no longer representative.
        setResults([]);
        setSql(null);
        setError(null);
        setSearched(false);
      }
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Job Search
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Find roles by title and narrow them down by company.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {mode && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                  mode === "vulnerable"
                    ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900"
                    : "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-900"
                }`}
              >
                mode: {mode}
              </span>
            )}
            {canToggle && mode && (
              <ModeToggle mode={mode} onChange={handleModeChange} disabled={switching || loading} />
            )}
          </div>
        </div>

        {mode === "vulnerable" && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Vulnerable mode: your input is concatenated straight into the SQL query. See{" "}
            <a href="/exploits" className="font-medium underline">
              Exploits
            </a>{" "}
            for what that allows.
          </div>
        )}

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <SearchForm
            keyword={keyword}
            company={company}
            onKeywordChange={setKeyword}
            onCompanyChange={setCompany}
            onSubmit={() => runSearch(keyword, company)}
            loading={loading}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={`${ex.keyword}|${ex.company}`}
                type="button"
                onClick={() => runExample(ex.keyword, ex.company)}
                disabled={loading}
                className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {ex.keyword}
                {ex.company && ` · ${ex.company}`}
              </button>
            ))}
          </div>
        </div>

        {sql && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Executed SQL
            </p>
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
              <code>{sql}</code>
            </pre>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </div>
        )}

        {!error && searched && <ResultsTable results={results} />}
        {!searched && !error && (
          <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Enter a keyword or company and press Search.
          </p>
        )}
      </main>
    </div>
  );
}
