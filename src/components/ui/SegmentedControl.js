// Radio group styled as a segmented control with a sliding thumb.
export default function SegmentedControl({ label, name, value, onChange, options, className = "" }) {
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  return (
    <fieldset className={`relative flex rounded-full bg-surface p-1 shadow-card ${className}`}>
      <legend className="sr-only">{label}</legend>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-full bg-panel-strong transition-transform duration-250 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <label
          key={o.id}
          className="relative z-10 flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-medium text-ink-3 transition-colors duration-150 has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-accent"
        >
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={o.id === value}
            onChange={() => onChange(o.id)}
            className="sr-only"
          />
          {o.icon && <o.icon size={14} aria-hidden="true" />}
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
