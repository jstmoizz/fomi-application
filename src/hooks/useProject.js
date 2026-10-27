"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { createGeneration } from "@/lib/api";
import { interruptPending, load, save, stripFresh } from "@/lib/storage";

function reducer(state, action) {
  switch (action.type) {
    case "select":
      return { ...state, selectedId: action.id, itemIndex: 0, compare: false };
    case "item":
      return { ...state, itemIndex: action.index };
    case "compare":
      return { ...state, compare: action.on ?? !state.compare };
    case "add":
      return { ...state, nodes: [...state.nodes, action.node], selectedId: action.node.id, itemIndex: 0, compare: false };
    case "patch":
      return { ...state, nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, ...action.patch } : n)) };
    case "lock":
      return { ...state, locks: state.locks.map((l) => (l.id === action.id ? { ...l, on: !l.on } : l)) };
    case "hydrate":
      return { ...state, ...action.saved, nodes: interruptPending(action.saved.nodes), itemIndex: 0, compare: false };
    case "assign":
      return { ...state, slots: state.slots.map((s) => (s.id === action.slotId ? { ...s, ref: action.ref } : s)) };
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

/** Project state + derived lineage helpers. Generation reuses the shared mock API. */
export function useProject(project) {
  const [state, dispatch] = useReducer(reducer, {
    nodes: project.nodes,
    slots: project.slots,
    locks: project.locks,
    selectedId: project.resumeNodeId,
    itemIndex: 0,
    compare: false,
  });

  // Resume where the user left off: restore after hydration, then save every change.
  const storageKey = `fomi:project:${project.id}`;
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const saved = load(storageKey, null);
    if (saved?.nodes?.some((n) => n.id === saved.selectedId)) dispatch({ type: "hydrate", saved });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setRestored(true);
  }, [storageKey]);

  const { nodes, slots, locks, selectedId } = state;
  useEffect(() => {
    if (restored) save(storageKey, { nodes: nodes.map(stripFresh), slots, locks, selectedId });
  }, [restored, storageKey, nodes, slots, locks, selectedId]);

  const byId = useMemo(() => new Map(state.nodes.map((n) => [n.id, n])), [state.nodes]);
  const selected = byId.get(state.selectedId);

  // Path from root to the selected node — the "story" of how this result was made.
  const path = useMemo(() => {
    const out = [];
    for (let n = selected; n; n = byId.get(n.parentId)) out.unshift(n);
    return out;
  }, [selected, byId]);

  // Depth-first order, used for J/K navigation and rendering the tree.
  const ordered = useMemo(() => {
    const kids = new Map();
    for (const n of state.nodes) kids.set(n.parentId, [...(kids.get(n.parentId) ?? []), n]);
    const out = [];
    const walk = (parentId, depth) =>
      (kids.get(parentId) ?? []).forEach((n) => {
        out.push({ node: n, depth, childCount: kids.get(n.id)?.length ?? 0 });
        walk(n.id, depth + 1);
      });
    walk(null, 0);
    return out;
  }, [state.nodes]);

  const activeLocks = state.locks.filter((l) => l.on);

  /** Branches a new generation from `parent` with a short direction ("Warmer"). */
  const branch = useCallback(
    async (parent, direction) => {
      const id = `n${Date.now().toString(36)}`;
      const lockText = activeLocks.map((l) => l.prompt).join(", ");
      const prompt = [parent.prompt, direction, lockText].filter(Boolean).join(". ");
      const params = {
        type: parent.type,
        prompt,
        model: parent.model,
        aspect: parent.aspect,
        count: parent.type === "video" ? 2 : 4,
        ...(parent.type === "video" && { duration: parent.duration ?? 5 }),
      };
      dispatch({
        type: "add",
        node: { id, parentId: parent.id, direction, prompt, model: parent.model, aspect: parent.aspect, type: parent.type, duration: parent.duration, status: "pending", items: [], params },
      });
      try {
        const res = await createGeneration(params);
        dispatch({ type: "patch", id, patch: { status: "done", items: res.items, fresh: true } });
      } catch (e) {
        dispatch({ type: "patch", id, patch: { status: "error", error: e.message } });
      }
    },
    [activeLocks],
  );

  const retry = useCallback(async (node) => {
    dispatch({ type: "patch", id: node.id, patch: { status: "pending", error: null } });
    try {
      const res = await createGeneration(node.params);
      dispatch({ type: "patch", id: node.id, patch: { status: "done", items: res.items, fresh: true } });
    } catch (e) {
      dispatch({ type: "patch", id: node.id, patch: { status: "error", error: e.message } });
    }
  }, []);

  const resolveRef = useCallback((ref) => (ref ? byId.get(ref.nodeId)?.items[ref.index] : null), [byId]);

  return { ...state, dispatch, byId, selected, path, ordered, activeLocks, branch, retry, resolveRef };
}
