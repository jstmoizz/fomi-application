// Icon-only button: `label` is required — it is the accessible name and the hover tooltip.
const tones = {
  default: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  glass: "bg-black/45 text-white backdrop-blur-md hover:bg-black/65",
  solid: "bg-surface text-ink border border-line shadow-card hover:bg-surface-2",
};

export default function IconButton({
  label,
  icon: Icon,
  tone = "default",
  size = 36,
  tooltip = "top",
  className = "",
  pressed,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={`group/tip relative inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-out active:scale-90 disabled:pointer-events-none disabled:opacity-40 ${tones[tone]} ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.9} aria-hidden="true" />
      {tooltip && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-bg opacity-0 transition-opacity delay-0 duration-150 group-hover/tip:opacity-100 group-hover/tip:delay-300 group-focus-visible/tip:opacity-100 ${
            tooltip === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
}
