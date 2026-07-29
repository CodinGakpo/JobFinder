type Job = {
  title: string;
  company: string;
  location: string;
  salary: number;
};

export default function ResultsTable({ results }: { results: Job[] }) {
  if (results.length === 0) {
    return <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">No results.</p>;
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-left dark:border-zinc-700">
            <th className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Title</th>
            <th className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Company</th>
            <th className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Location</th>
            <th className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Salary</th>
          </tr>
        </thead>
        <tbody>
          {results.map((job, i) => (
            <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">{job.title}</td>
              <td className="py-2 pr-4">{job.company}</td>
              <td className="py-2 pr-4">{job.location}</td>
              <td className="py-2 pr-4">
                {typeof job.salary === "number" ? `$${job.salary.toLocaleString()}` : job.salary}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
