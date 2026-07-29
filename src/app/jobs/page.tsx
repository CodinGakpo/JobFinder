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

  async function handleSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ keyword, company });
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setMode(data.mode ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Job Search</h1>
        {mode && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === "vulnerable"
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            }`}
          >
            mode: {mode}
          </span>
        )}
      </div>
      <div className="mt-6">
        <SearchForm
          keyword={keyword}
          company={company}
          onKeywordChange={setKeyword}
          onCompanyChange={setCompany}
          onSubmit={handleSearch}
          loading={loading}
        />
      </div>
      <ResultsTable results={results} />
    </main>
  );
}
