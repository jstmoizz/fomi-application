"use client";

import { memo, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, TriangleAlert } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

// Recent generations as a quick-jump rail. One thumbnail per batch, newest first.
function HistoryStrip({ batches, onSelect, onViewAll, className = "" }) {
  const scroller = useRef(null);
  const scrollBy = (dir) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section
      aria-label="History"
      className={`group/strip relative flex items-center gap-2 rounded-[18px] bg-surface p-2 shadow-float ${className}`}
    >
      <button
        type="button"
        onClick={onViewAll}
        className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-line text-center transition-[border-color,transform] duration-150 hover:border-line-strong active:scale-95"
      >
        <span className="text-xs font-semibold text-ink">History</span>
        <span className="text-[10px] text-ink-3">View all</span>
      </button>
      <span aria-hidden="true" className="h-10 w-px shrink-0 bg-line" />

      <ol
        ref={scroller}
        className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth px-0.5 py-0.5 [mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-24px),transparent)]"
      >
        {batches.map((batch) => (
          <li key={batch.id}>
            <Thumb batch={batch} onSelect={onSelect} />
          </li>
        ))}
      </ol>

      <div className="pointer-events-none absolute inset-y-0 right-2 hidden items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/strip:pointer-events-auto group-hover/strip:opacity-100 md:flex">
        <ArrowButton label="Scroll history left" icon={ChevronLeft} onClick={() => scrollBy(-1)} />
        <ArrowButton label="Scroll history right" icon={ChevronRight} onClick={() => scrollBy(1)} />
      </div>
    </section>
  );
}

function Thumb({ batch, onSelect }) {
  const item = batch.items[0];
  const label = `Jump to: ${batch.prompt.slice(0, 60)}${batch.prompt.length > 60 ? "…" : ""}`;
  return (
    <button
      type="button"
      onClick={() => onSelect(batch.id)}
      aria-label={label}
      title={batch.prompt}
      className="relative block size-14 overflow-hidden rounded-xl bg-surface-2 transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95"
    >
      {batch.status === "pending" ? (
        <span className="skeleton grid size-full place-items-center text-ink-3">
          <Spinner size={14} />
        </span>
      ) : batch.status === "error" ? (
        <span className="grid size-full place-items-center text-danger">
          <TriangleAlert size={16} aria-hidden="true" />
        </span>
      ) : (
        <>
          <Image
            src={item.src}
            alt=""
            width={112}
            height={112}
            sizes="56px"
            placeholder="blur"
            blurDataURL={item.blur}
            className="size-full object-cover"
          />
          {batch.type === "video" && (
            <Play size={12} fill="currentColor" aria-hidden="true" className="absolute bottom-1 right-1 text-white drop-shadow" />
          )}
        </>
      )}
    </button>
  );
}

function ArrowButton({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={-1}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full border border-line bg-surface text-ink shadow-card transition-[background-color,transform] duration-150 hover:bg-surface-2 active:scale-90"
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}

export default memo(HistoryStrip);
