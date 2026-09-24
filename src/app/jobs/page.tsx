"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ResultsTable from "@/components/ResultsTable";

type Job = {
  title: string;
  company: string;
  location: string;
  salary: number;
};

export default function JobsPage() {
  const [keyword, setKeyword] = useState("");
  const [company, setCompany] = useState("");
  const [results, setResults] = useState<Job[]>([]);
  const [mode, setMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ keyword, company });
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setMode(data.mode ?? null);
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

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Job Search
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Find roles by title and narrow them down by company.
            </p>
          </div>
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
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <SearchForm
            keyword={keyword}
            company={company}
            onKeywordChange={setKeyword}
            onCompanyChange={setCompany}
            onSubmit={handleSearch}
            loading={loading}
          />
        </div>

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
