"use client";

import { useCallback, useRef, useState } from "react";
import { createGeneration, fetchGenerations } from "@/lib/api";

// Owns the generation history: optimistic pending batches, retries, removal with undo, pagination.
export function useGenerations(initialPage) {
  const [batches, setBatches] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const loading = useRef(false);

  const patch = (id, update) => setBatches((bs) => bs.map((b) => (b.id === id ? { ...b, ...update } : b)));

  const run = useCallback(async (id, params) => {
    try {
      const result = await createGeneration(params);
      // Keep the placeholder's id so React updates the same card in place.
      patch(id, { ...result, id, status: "done", fresh: true, error: null });
    } catch (e) {
      patch(id, { status: "error", error: e.message });
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

  return { batches, generate, retry, remove, loadMore, hasMore: cursor != null, loadingMore, loadError };
}
