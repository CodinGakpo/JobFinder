"use client";

type Mode = "secure" | "vulnerable";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  disabled: boolean;
};

export default function ModeToggle({ mode, onChange, disabled }: Props) {
  const base = "px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed";
  const active = {
    secure: "bg-green-600 text-white",
    vulnerable: "bg-red-600 text-white",
  };
  const idle = "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800";

  return (
    <div
      role="group"
      aria-label="Search mode"
      className="inline-flex overflow-hidden rounded-full border border-zinc-300 dark:border-zinc-700"
    >
      {(["secure", "vulnerable"] as const).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          disabled={disabled}
          onClick={() => mode !== m && onChange(m)}
          className={`${base} ${mode === m ? active[m] : idle}`}
        >
          {m === "secure" ? "Secure" : "Vulnerable"}
        </button>
      ))}
    </div>
  );
}
