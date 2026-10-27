import { ChevronDown } from "lucide-react";

// Native <select> styled as a pill: keyboard, screen-reader and mobile pickers for free.
// `label` is the accessible name, shown as a muted prefix ("Model  Fomi 2") unless `hideLabel`.
export default function Select({ label, hideLabel = false, value, onChange, options, className = "" }) {
  return (
    <label
      className={`relative flex h-9 min-w-0 items-center gap-1.5 rounded-full border border-line bg-surface pl-3 pr-8 text-xs shadow-card transition-colors duration-150 hover:border-line-strong focus-within:border-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${className}`}
    >
      <span className={hideLabel ? "sr-only" : "shrink-0 text-ink-3"}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="truncate font-semibold text-ink">
        {options.find((o) => String(o.value) === String(value))?.label}
      </span>
      <ChevronDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 text-ink-3 transition-transform duration-150 peer-focus:rotate-180"
      />
    </label>
  );
}
