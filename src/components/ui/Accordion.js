import { ChevronDown } from "lucide-react";

// Native <details>: accessible and keyboard-operable by default. Height animates
// where the browser supports ::details-content; elsewhere it just opens.
export default function Accordion({ title, badge, children, defaultOpen = false }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[18px] bg-surface shadow-card [interpolate-size:allow-keywords] [&::details-content]:h-0 [&::details-content]:overflow-clip [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-250 [&::details-content]:[transition-behavior:allow-discrete] [&[open]::details-content]:h-auto"
    >
      <summary className="flex h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-[18px] px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {badge && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-ink-2">{badge}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="text-ink-3 transition-transform duration-250 ease-out group-open:rotate-180"
        />
      </summary>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}
