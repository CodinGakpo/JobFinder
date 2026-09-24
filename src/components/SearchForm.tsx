"use client";

type Props = {
  keyword: string;
  company: string;
  onKeywordChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export default function SearchForm({
  keyword,
  company,
  onKeywordChange,
  onCompanyChange,
  onSubmit,
  loading,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="keyword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Keyword
        </label>
        <input
          id="keyword"
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="e.g. Engineer"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="company" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="e.g. Initech"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
