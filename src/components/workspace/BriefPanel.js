"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Lock, Plus, Target, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import media from "@/data/media.json";

// What this project must ship (slots) and what must stay true (locks). The finish line, always visible.
function BriefPanel({ project, slots, locks, current, resolveRef, onAssign, onToggleLock, onClose, className = "" }) {
  const [briefOpen, setBriefOpen] = useState(false);
  const filled = slots.filter((s) => s.ref).length;

  return (
    <aside aria-label="Brief" className={`flex min-h-0 flex-col overflow-y-auto rounded-[20px] bg-surface shadow-card ${className}`}>
      <section className="border-b border-line p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold">Brief</h2>
          {onClose && <IconButton label="Close brief" icon={X} size={30} onClick={onClose} tooltip={false} className="max-lg:hidden xl:hidden" />}
        </div>
        <p className={`mt-1.5 text-xs leading-relaxed text-ink-2 ${briefOpen ? "" : "line-clamp-2"}`}>{project.brief}</p>
        <button
          type="button"
          onClick={() => setBriefOpen((v) => !v)}
          aria-expanded={briefOpen}
          className="mt-1 text-[11px] font-medium text-ink-3 hover:text-ink"
        >
          {briefOpen ? "Less" : "More"}
        </button>
      </section>

      <section className="border-b border-line p-4" aria-labelledby="slots-title">
        <div className="flex items-center justify-between">
          <h2 id="slots-title" className="flex items-center gap-2 text-sm font-semibold">
            <Target size={15} aria-hidden="true" className="text-accent" /> Deliverables
          </h2>
          <span className="text-xs tabular-nums text-ink-3">
            {filled}/{slots.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label="Deliverables filled" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={slots.length}>
          <span className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${(filled / slots.length) * 100}%` }} />
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3">
          {slots.map((slot, i) => {
            const item = resolveRef(slot.ref);
            const matches = current?.node.aspect === slot.aspect;
            return (
              <li key={slot.id} className="flex flex-col gap-1.5">
                <div
                  className={`group relative grid h-28 place-items-center overflow-hidden rounded-xl ${item ? "bg-surface-2" : "border border-dashed border-line-strong"}`}
                >
                  {item ? (
                    <>
                      <span className="relative h-full" style={{ aspectRatio: slot.aspect.replace(":", " / ") }}>
                        <Image key={item.id} src={item.src} alt="" fill sizes="140px" placeholder="blur" blurDataURL={item.blur} className="animate-rise object-cover" />
                      </span>
                      <CheckCircle2 size={16} aria-label="Filled" className="absolute right-1.5 top-1.5 fill-surface text-accent" />
                      <button
                        type="button"
                        onClick={() => onAssign(slot.id, null)}
                        className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-black/55 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                      >
                        Clear
                      </button>
                    </>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-14 rounded-md border border-line-strong bg-surface-2"
                      style={{ aspectRatio: slot.aspect.replace(":", " / ") }}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium text-ink">{slot.name}</span>
                    <span className="text-[10px] text-ink-3">
                      {slot.aspect} <kbd className="ml-1 rounded border border-line px-1 font-sans">{i + 1}</kbd>
                    </span>
                  </span>
                  {current && (
                    <button
                      type="button"
                      onClick={() => onAssign(slot.id, current.ref)}
                      title={matches ? `Place current in ${slot.name}` : `Place current (format differs from ${slot.aspect})`}
                      aria-label={`Place current in ${slot.name}`}
                      className={`grid size-7 shrink-0 place-items-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 ${
                        matches ? "bg-accent-soft text-ink hover:bg-panel-strong" : "text-ink-3 hover:bg-surface-2"
                      }`}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="p-4" aria-labelledby="locks-title">
        <h2 id="locks-title" className="flex items-center gap-2 text-sm font-semibold">
          <Lock size={14} aria-hidden="true" className="text-accent" /> Locks
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-3">Carried into every new iteration, so the campaign stays consistent.</p>
        <ul className="mt-3 flex flex-col gap-1">
          {locks.map((lock) => (
            <li key={lock.id}>
              <button
                type="button"
                role="switch"
                aria-checked={lock.on}
                onClick={() => onToggleLock(lock.id)}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors duration-150 hover:bg-surface-2"
              >
                <LockVisual lock={lock} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-wide text-ink-3">{lock.kind}</span>
                  <span className="block truncate text-xs font-medium text-ink">{lock.label}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${lock.on ? "bg-accent" : "bg-line-strong"}`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ease-out ${lock.on ? "translate-x-[18px]" : "translate-x-0.5"}`}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function LockVisual({ lock }) {
  if (lock.thumb) {
    const m = media[lock.thumb];
    return <Image src={m.src} alt="" width={64} height={64} className="size-8 shrink-0 rounded-lg object-cover" />;
  }
  if (lock.swatches) {
    return (
      <span className="grid size-8 shrink-0 grid-cols-2 overflow-hidden rounded-lg" aria-hidden="true">
        {lock.swatches.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </span>
    );
  }
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-[10px] font-semibold text-ink-2" aria-hidden="true">
      {lock.kind.slice(0, 2)}
    </span>
  );
}

export default memo(BriefPanel);
