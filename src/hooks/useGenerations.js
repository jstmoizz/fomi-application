"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createGeneration, fetchGenerations } from "@/lib/api";
import { load, mergeBatches, save, stripFresh } from "@/lib/storage";

const STORAGE_KEY = "fomi:batches";
// Batches the user made in this browser (server history is re-fetched, so only these need saving).
const isOwn = (b) => b.id.startsWith("p") && b.status === "done";

// Owns the generation history: optimistic pending batches, cancel, retries, removal with undo, pagination, persistence.
export function useGenerations(initialPage) {
  const [batches, setBatches] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [restored, setRestored] = useState(false);
  const loading = useRef(false);
  const controllers = useRef(new Map());

  // Restore after hydration; the page itself is prerendered without them.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setBatches((bs) => mergeBatches(load(STORAGE_KEY, []), bs));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) save(STORAGE_KEY, batches.filter(isOwn).map(stripFresh));
  }, [batches, restored]);

  const patch = (id, update) => setBatches((bs) => bs.map((b) => (b.id === id ? { ...b, ...update } : b)));

  const run = useCallback(async (id, params) => {
    const controller = new AbortController();
    controllers.current.set(id, controller);
    try {
      const result = await createGeneration(params, controller.signal);
      // Keep the placeholder's id so React updates the same card in place.
      patch(id, { ...result, id, status: "done", fresh: true, error: null });
    } catch (e) {
      if (e.name !== "AbortError") patch(id, { status: "error", error: e.message });
    } finally {
      controllers.current.delete(id);
    }
  }, []);

  const generate = useCallback(
    (params) => {
      const id = `p${Date.now().toString(36)}`;
      setBatches((bs) => [{ id, ...params, status: "pending", params, items: [] }, ...bs]);
      run(id, params);
      return id;
    },
    [run],
  );

  const retry = useCallback(
    (batch) => {
      patch(batch.id, { status: "pending", error: null });
      run(batch.id, batch.params);
    },
    [run],
  );

  const cancel = useCallback((id) => {
    controllers.current.get(id)?.abort();
    setBatches((bs) => bs.filter((b) => b.id !== id));
  }, []);

  /** Removes a batch and returns a function that puts it back where it was. */
  const remove = useCallback((id) => {
    let removed;
    let index = -1;
    setBatches((bs) => {
      index = bs.findIndex((b) => b.id === id);
      removed = bs[index];
      return bs.filter((b) => b.id !== id);
    });
    return () =>
      setBatches((bs) => {
        if (!removed || bs.some((b) => b.id === id)) return bs;
        const next = [...bs];
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
  }, []);

  const loadMore = useCallback(async () => {
    if (loading.current || cursor == null) return;
    loading.current = true;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const page = await fetchGenerations(cursor);
      setBatches((bs) => [...bs, ...page.items.filter((b) => !bs.some((x) => x.id === b.id))]);
      setCursor(page.nextCursor);
    } catch (e) {
      setLoadError(e.message);
    } finally {
      loading.current = false;
      setLoadingMore(false);
    }
  }, [cursor]);

  return { batches, generate, retry, cancel, remove, loadMore, hasMore: cursor != null, loadingMore, loadError };
}
