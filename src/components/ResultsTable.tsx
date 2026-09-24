"use client";

type Job = {
  title: string;
  company: string;
  location: string;
  salary: number;
};

import { useState } from "react";

type SortKey = keyof Job;

export default function ResultsTable({ results }: { results: Job[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);

  const rows = sort
    ? [...results].sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return cmp * sort.dir;
      })
    : results;

  function toggleSort(key: SortKey) {
    setSort((cur) => (cur?.key === key ? { key, dir: cur.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  if (results.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No results.</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Try a different keyword or clear the company filter.
        </p>
      </div>
    );
  }

  const th = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

  return (
    <div className="mt-8">
      <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
        {results.length} {results.length === 1 ? "job" : "jobs"} found
      </p>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
              {(
                [
                  ["title", "Title", ""],
                  ["company", "Company", ""],
                  ["location", "Location", ""],
                  ["salary", "Salary", "text-right"],
                ] as const
              ).map(([key, label, align]) => (
                <th
                  key={key}
                  className={`${th} ${align}`}
                  aria-sort={sort?.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                >
                  <button type="button" onClick={() => toggleSort(key)} className="uppercase tracking-wide hover:text-zinc-900 dark:hover:text-zinc-100">
                    {label}
                    {sort?.key === key ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((job, i) => (
              <tr key={i} className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-zinc-800/60">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{job.title}</td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{job.company}</td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{job.location}</td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {typeof job.salary === "number" ? `$${job.salary.toLocaleString()}` : job.salary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
