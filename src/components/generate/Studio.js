"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import HistoryStrip from "@/components/layout/HistoryStrip";
import TopNav from "@/components/layout/TopNav";
import { useToast } from "@/components/ui/Toast";
import { DEFAULT_SETTINGS } from "@/data/catalog";
import { useGenerations } from "@/hooks/useGenerations";
import GenerationFeed from "./GenerationFeed";
import PromptPanel from "./PromptPanel";

// Overlays are only needed after a click, so they load on demand.
const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });
const Gallery = dynamic(() => import("./Gallery"), { ssr: false });

const INITIAL_DRAFT = {
  mode: "image",
  prompt: "",
  settings: DEFAULT_SETTINGS,
  style: null,
  negativePrompt: "",
  seed: "",
};

function toParams(source) {
  const { type, prompt, model, aspect, count, duration, style, negativePrompt, seed } = source;
  return {
    type,
    prompt,
    model,
    aspect,
    count,
    style: style ?? null,
    negativePrompt: negativePrompt || undefined,
    seed,
    ...(type === "video" && { duration: duration ?? DEFAULT_SETTINGS.video.duration }),
  };
}

const scrollToBatch = (id) =>
  requestAnimationFrame(() => document.getElementById(`batch-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));

export default function Studio({ initialPage }) {
  const toast = useToast();
  const gen = useGenerations(initialPage);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [viewer, setViewer] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const textareaRef = useRef(null);
  const { batches, generate, retry, remove } = gen;

  const entries = useMemo(
    () => batches.filter((b) => !b.status || b.status === "done").flatMap((batch) => batch.items.map((item) => ({ item, batch }))),
    [batches],
  );
  const pendingCount = batches.filter((b) => b.status === "pending").length;

  // "/" jumps to the prompt from anywhere, like search in pro tools.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || /input|textarea|select/i.test(e.target.tagName)) return;
      e.preventDefault();
      textareaRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleGenerate = useCallback(() => {
    const id = generate(
      toParams({
        type: draft.mode,
        prompt: draft.prompt.trim(),
        ...draft.settings[draft.mode],
        style: draft.style,
        negativePrompt: draft.negativePrompt,
        seed: draft.seed === "" ? undefined : Number(draft.seed),
      }),
    );
    scrollToBatch(id);
  }, [draft, generate]);

  const focusPrompt = () =>
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      el?.focus();
      el?.setSelectionRange(el.value.length, el.value.length);
    });

  const handleReuse = useCallback(
    (batch) => {
      setDraft((d) => ({
        ...d,
        mode: batch.type,
        prompt: batch.prompt,
        style: batch.style ?? null,
        negativePrompt: batch.negativePrompt ?? "",
        settings: {
          ...d.settings,
          [batch.type]: {
            ...d.settings[batch.type],
            model: batch.model,
            aspect: batch.aspect,
            count: batch.count,
            ...(batch.duration && { duration: batch.duration }),
          },
        },
      }));
      focusPrompt();
      toast("Prompt and settings loaded");
    },
    [toast],
  );

  const handleVariations = useCallback(
    (batch) => {
      const id = generate(toParams({ ...batch, seed: undefined }));
      scrollToBatch(id);
    },
    [generate],
  );

  const handleDelete = useCallback(
    (batch) => {
      const undo = remove(batch.id);
      if (batch.status !== "error") toast("Generation deleted", { label: "Undo", onClick: undo });
    },
    [remove, toast],
  );

  const handleCopy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        toast("Prompt copied");
      } catch {
        toast("Couldn’t access the clipboard");
      }
    },
    [toast],
  );

  const handleOpen = useCallback(
    (batchId, index) => {
      const start = entries.findIndex((e) => e.batch.id === batchId) + index;
      setViewer({ entries, index: Math.max(0, start) });
    },
    [entries],
  );

  const handleJump = useCallback((id) => {
    scrollToBatch(id);
    setHighlightedId(id);
    setTimeout(() => setHighlightedId((h) => (h === id ? null : h)), 1400);
  }, []);

  const handleSuggestion = useCallback((text) => {
    setDraft((d) => ({ ...d, prompt: text }));
    focusPrompt();
  }, []);

  const handleUnavailable = useCallback((name) => toast(`${name} is coming soon`), [toast]);
  const handleMode = useCallback((mode) => setDraft((d) => ({ ...d, mode })), []);
  const openGallery = useCallback(() => setGalleryOpen(true), []);

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
      <TopNav mode={draft.mode} onModeChange={handleMode} onOpenGallery={openGallery} onUnavailable={handleUnavailable} />

      <div className="mx-auto grid w-full max-w-[2200px] flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-4 px-4 pb-56 md:min-h-0 md:grid-cols-[280px_minmax(0,1fr)] md:px-6 md:pb-4 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <HistoryStrip
          batches={batches}
          onSelect={handleJump}
          onViewAll={openGallery}
          className="relative z-20 mb-4 md:col-span-2 md:-mb-6"
        />

        <aside className="md:min-h-0 md:pt-10">
          <PromptPanel
            draft={draft}
            onChange={setDraft}
            onGenerate={handleGenerate}
            pendingCount={pendingCount}
            textareaRef={textareaRef}
          />
        </aside>

        <main id="main" tabIndex={-1} className="outline-none md:-mr-3 md:min-h-0 md:overflow-y-auto md:pr-3 md:pt-12">
          <GenerationFeed
            batches={batches}
            hasMore={gen.hasMore}
            loadingMore={gen.loadingMore}
            loadError={gen.loadError}
            onLoadMore={gen.loadMore}
            highlightedId={highlightedId}
            onSuggestion={handleSuggestion}
            onOpen={handleOpen}
            onReuse={handleReuse}
            onVariations={handleVariations}
            onDelete={handleDelete}
            onRetry={retry}
            onCopy={handleCopy}
          />
        </main>
      </div>

      {viewer && (
        <Lightbox
          entries={viewer.entries}
          startIndex={viewer.index}
          onClose={() => setViewer(null)}
          onReuse={handleReuse}
          onCopy={handleCopy}
        />
      )}
      {galleryOpen && (
        <Gallery entries={entries} onClose={() => setGalleryOpen(false)} onPick={(index) => setViewer({ entries, index })} />
      )}
    </div>
  );
}
