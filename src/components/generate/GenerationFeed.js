"use client";

import { memo, useEffect, useRef } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import GenerationBatch from "./GenerationBatch";

const SUGGESTIONS = [
  "Portrait of a ceramicist in her studio, window light, film grain",
  "Alpine lake at dawn with a lone wooden boat",
  "Neon cinema facade on a rainy night, 35mm still",
];

// The scrolling history of batches with infinite loading and empty / error states.
function GenerationFeed({
  batches,
  hasMore,
  loadingMore,
  loadError,
  onLoadMore,
  highlightedId,
  onSuggestion,
  ...handlers
}) {
  const sentinel = useRef(null);

  useEffect(() => {
    if (!hasMore || loadError) return;
    const el = sentinel.current;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && onLoadMore(), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadError, onLoadMore]);

  if (batches.length === 0 && !hasMore) return <EmptyState onSuggestion={onSuggestion} />;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <h1 className="sr-only">Your generations</h1>
      {batches.map((batch, i) => (
        <GenerationBatch key={batch.id} batch={batch} eager={i < 1} highlighted={batch.id === highlightedId} {...handlers} />
      ))}

      <div ref={sentinel} className="flex min-h-16 items-center justify-center pb-4 text-xs text-ink-3">
        {loadError ? (
          <div className="flex items-center gap-3" role="alert">
            <span>Couldn’t load older work.</span>
            <Button size="sm" onClick={onLoadMore}>
              <RotateCcw size={13} aria-hidden="true" /> Retry
            </Button>
          </div>
        ) : loadingMore ? (
          <span className="flex items-center gap-2" role="status">
            <Spinner size={14} /> Loading older work…
          </span>
        ) : (
          !hasMore && <span>That’s everything — you’re all caught up.</span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onSuggestion }) {
  return (
    <div className="flex min-h-[60dvh] animate-fade flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <Sparkles size={24} aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-ink">Nothing here yet</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-3">
          Describe what you want to see. Your generations land here, newest first.
        </p>
      </div>
      <ul className="flex max-w-lg flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onSuggestion(s)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-2 transition-[border-color,color,transform] duration-150 hover:border-line-strong hover:text-ink active:scale-95"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(GenerationFeed);
