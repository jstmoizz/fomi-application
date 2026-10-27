"use client";

import { useEffect, useState } from "react";

// localStorage that never throws: private mode, blocked site data or a full quota just mean nothing is saved.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * useState that survives reloads. Reads after mount so prerendered HTML hydrates cleanly,
 * and only writes once the saved value has been read (so the default never overwrites it).
 * `revive(saved, initial)` can repair data saved by an older version of the app.
 */
export function useStoredState(key, initial, revive = (saved) => saved) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setValue((v) => {
      const saved = load(key, undefined);
      return saved === undefined ? v : revive(saved, v);
    });
    setReady(true);
    // revive is read once on mount, like `initial`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (ready) save(key, value);
  }, [key, value, ready]);

  return [value, setValue, ready];
}

export function clearStored(prefix = "fomi:") {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/** Saved batches first (they are the newest), then server batches not already present. */
export function mergeBatches(saved, current) {
  const ids = new Set(saved.map((b) => b.id));
  return [...saved, ...current.filter((b) => !ids.has(b.id))];
}

/** A request in flight can't survive a reload; bring it back as a retryable error instead of a stuck spinner. */
export function interruptPending(nodes) {
  return nodes.map((n) => (n.status === "pending" ? { ...n, status: "error", error: "Interrupted by a reload. Retry to finish it." } : n));
}

/** Drops the one-shot entrance animation flag so restored work doesn't re-animate. */
export const stripFresh = ({ fresh, ...rest }) => rest;
