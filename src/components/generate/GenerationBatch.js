"use client";

import { memo, useCallback, useState } from "react";
import { Copy, RefreshCw, RotateCcw, Trash2, TriangleAlert, Video, WandSparkles, X } from "lucide-react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Spinner from "@/components/ui/Spinner";
import { modelName } from "@/data/catalog";
import MediaCard, { isWide, ratio } from "./MediaCard";

// One prompt + its results. Prompt card sits beside the grid on wide screens, above it otherwise.
function GenerationBatch({ batch, eager, highlighted, favorites, onOpen, onReuse, onVariations, onDelete, onRetry, onCancel, onCopy, onToggleFavorite }) {
  const { status = "done", aspect, prompt } = batch;
  const isVideo = batch.type === "video";
  const open = useCallback((index) => onOpen(batch.id, index), [onOpen, batch.id]);

  return (
    <article
      id={`batch-${batch.id}`}
      aria-labelledby={`batch-${batch.id}-prompt`}
      aria-busy={status === "pending"}
      className={`grid scroll-mt-20 gap-3 md:scroll-mt-12 rounded-[18px] transition-[box-shadow,background-color] duration-700 xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)] ${
        highlighted ? "bg-accent-soft/60 shadow-[0_0_0_8px_var(--accent-soft)]" : ""
      }`}
    >
      <PromptCard
        batch={batch}
        status={status}
        isVideo={isVideo}
        onReuse={onReuse}
        onVariations={onVariations}
        onDelete={onDelete}
        onCancel={onCancel}
        onCopy={onCopy}
      />

      {status === "error" ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-line-strong p-6 text-center">
          <TriangleAlert size={22} className="text-danger" aria-hidden="true" />
          <p className="text-sm text-ink-2" role="alert">
            {batch.error}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => onRetry(batch)}>
              <RotateCcw size={13} aria-hidden="true" /> Retry
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(batch)}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 content-start gap-2 sm:gap-3 lg:grid-cols-4">
          {status === "pending"
            ? Array.from({ length: batch.count }, (_, i) => (
                <div
                  key={i}
                  className={`skeleton relative overflow-hidden rounded-[12px] ${isWide(aspect) ? "col-span-2" : ""}`}
                  style={{ aspectRatio: ratio(aspect), animationDelay: `${i * 120}ms` }}
                />
              ))
            : batch.items.map((item, i) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  aspect={aspect}
                  index={i}
                  total={batch.items.length}
                  prompt={prompt}
                  isVideo={isVideo}
                  duration={batch.duration}
                  fresh={batch.fresh}
                  eager={eager}
                  liked={favorites.includes(item.id)}
                  onOpen={open}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
        </div>
      )}
    </article>
  );
}

function PromptCard({ batch, status, isVideo, onReuse, onVariations, onDelete, onCancel, onCopy }) {
  const [expanded, setExpanded] = useState(false);
  const long = batch.prompt.length > 160;
  const done = status === "done";

  return (
    <div className="flex h-fit flex-col gap-3 rounded-[14px] bg-panel p-3 xl:sticky xl:top-0">
      <p
        id={`batch-${batch.id}-prompt`}
        className={`text-xs leading-relaxed text-ink-2 ${expanded ? "" : "line-clamp-3 xl:line-clamp-[10]"}`}
      >
        {batch.prompt}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="-mt-2 self-start rounded text-[11px] font-medium text-ink-3 underline-offset-2 hover:text-ink hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      {status === "pending" && (
        <div className="flex flex-col gap-2" role="status">
          <span className="flex items-center gap-2 text-[11px] font-medium text-ink-2">
            <Spinner size={12} className="text-accent" />
            {isVideo ? "Rendering video…" : "Generating…"}
            <button
              type="button"
              onClick={() => onCancel(batch.id)}
              className="ml-auto flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-ink-3 transition-colors duration-150 hover:bg-panel-strong hover:text-ink"
            >
              <X size={11} aria-hidden="true" /> Cancel
            </button>
          </span>
          <span className="h-1 overflow-hidden rounded-full bg-panel-strong" aria-hidden="true">
            {/* Eases toward ~90% and waits, like a real queue; finishes when the batch lands. */}
            <span
              className="block h-full origin-left rounded-full bg-accent transition-transform ease-out"
              style={{ animation: `grow ${isVideo ? 4 : 2.6}s cubic-bezier(.1,.7,.2,1) forwards` }}
            />
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-surface px-2 py-1 text-[10px] font-semibold text-ink shadow-card">
          {modelName(batch.model)}
        </span>
        <span className="rounded-md px-1.5 py-1 text-[10px] text-ink-3">{batch.aspect}</span>
        {isVideo && batch.duration && <span className="rounded-md px-1.5 py-1 text-[10px] text-ink-3">{batch.duration}s</span>}
        {isVideo && <Video size={12} className="text-ink-3" aria-label="Video" />}
        {batch.style && <span className="rounded-md px-1.5 py-1 text-[10px] text-ink-3">{batch.style}</span>}
      </div>

      {done && (
        <div className="-mx-1 -mb-1 flex items-center gap-0.5 border-t border-line pt-2">
          <IconButton label="Copy prompt" icon={Copy} size={30} onClick={() => onCopy(batch.prompt)} />
          <IconButton label="Reuse settings" icon={WandSparkles} size={30} onClick={() => onReuse(batch)} />
          <IconButton label="More like this" icon={RefreshCw} size={30} onClick={() => onVariations(batch)} />
          <IconButton label="Delete" icon={Trash2} size={30} onClick={() => onDelete(batch)} className="ml-auto hover:text-danger" />
        </div>
      )}
    </div>
  );
}

export default memo(GenerationBatch);
