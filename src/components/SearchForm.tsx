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
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
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
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-md bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
