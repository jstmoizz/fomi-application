"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Columns2, Command, GitBranch, Image as ImageIcon, Lock, MoonStar, Target, Wand2 } from "lucide-react";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import media from "@/data/media.json";
import { NUDGES } from "@/data/project";
import { useProject } from "@/hooks/useProject";
import BriefPanel from "./BriefPanel";
import DirectionComposer from "./DirectionComposer";
import LineagePanel from "./LineagePanel";
import Stage from "./Stage";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

const VIEWS = [
  { id: "lineage", label: "Lineage", icon: GitBranch },
  { id: "stage", label: "Stage", icon: ImageIcon },
  { id: "brief", label: "Brief", icon: Target },
];

const isTyping = (el) => /input|textarea|select/i.test(el.tagName) || el.isContentEditable;

export default function WorkspaceApp({ project }) {
  const p = useProject(project);
  const { dispatch, selected, ordered, itemIndex, slots, byId, branch } = p;
  const toast = useToast();
  const router = useRouter();
  const composerRef = useRef(null);
  const [view, setView] = useState("stage"); // small screens show one panel at a time
  const [briefOpen, setBriefOpen] = useState(false); // lg–xl: brief is a drawer
  const [paletteOpen, setPaletteOpen] = useState(false);

  const parent = byId.get(selected.parentId);
  const current = useMemo(
    () => (selected.status === "done" ? { node: selected, ref: { nodeId: selected.id, index: itemIndex } } : null),
    [selected, itemIndex],
  );
  const filled = slots.filter((s) => s.ref).length;

  const select = useCallback((id) => dispatch({ type: "select", id }), [dispatch]);
  const toggleLock = useCallback((id) => dispatch({ type: "lock", id }), [dispatch]);

  const assign = useCallback(
    (slotId, ref) => {
      const slot = slots.find((s) => s.id === slotId);
      const previous = slot.ref;
      dispatch({ type: "assign", slotId, ref });
      if (ref) toast(`Placed in ${slot.name}`, { label: "Undo", onClick: () => dispatch({ type: "assign", slotId, ref: previous }) });
    },
    [slots, dispatch, toast],
  );

  const doBranch = useCallback(
    (direction) => {
      branch(selected, direction);
      setView("stage");
    },
    [branch, selected],
  );

  const moveNode = useCallback(
    (d) => {
      const i = ordered.findIndex((o) => o.node.id === selected.id);
      const next = ordered[Math.min(ordered.length - 1, Math.max(0, i + d))];
      select(next.node.id);
    },
    [ordered, selected.id, select],
  );

  // Keyboard-first: ⌘K palette, J/K iterations, ←/→ options, C compare, 1–4 place in slot, / direct.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || document.querySelector("dialog[open]")) return;
      const count = selected.items.length;
      const key = e.key.toLowerCase();
      if (key === "j") moveNode(1);
      else if (key === "k") moveNode(-1);
      else if (e.key === "ArrowRight" && count) dispatch({ type: "item", index: (itemIndex + 1) % count });
      else if (e.key === "ArrowLeft" && count) dispatch({ type: "item", index: (itemIndex - 1 + count) % count });
      else if (key === "c") dispatch({ type: "compare" });
      else if (/^[1-9]$/.test(e.key) && current && slots[+e.key - 1]) assign(slots[+e.key - 1].id, current.ref);
      else if (e.key === "/") composerRef.current?.focus();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveNode, dispatch, itemIndex, selected.items.length, current, slots, assign]);

  const commands = useMemo(
    () => [
      { id: "focus", group: "Direct", label: "Write a direction for the next iteration", shortcut: "/", icon: Wand2, run: () => composerRef.current?.focus() },
      ...NUDGES.map((n) => ({ id: `nudge-${n}`, group: "Direct", label: `Branch: ${n}`, icon: GitBranch, run: () => doBranch(n) })),
      { id: "compare", group: "View", label: "Compare with parent", shortcut: "C", icon: Columns2, run: () => dispatch({ type: "compare", on: true }) },
      ...ordered.map(({ node }) => ({ id: `go-${node.id}`, group: "Iterations", label: node.direction, icon: GitBranch, run: () => select(node.id) })),
      ...(current
        ? slots.map((s, i) => ({ id: `slot-${s.id}`, group: "Deliverables", label: `Place current in ${s.name} (${s.aspect})`, shortcut: String(i + 1), icon: Target, run: () => assign(s.id, current.ref) }))
        : []),
      ...p.locks.map((l) => ({ id: `lock-${l.id}`, group: "Locks", label: `${l.on ? "Unlock" : "Lock"} ${l.kind.toLowerCase()}: ${l.label}`, icon: Lock, run: () => toggleLock(l.id) })),
      { id: "theme", group: "App", label: "Toggle dark mode", icon: MoonStar, run: () => document.querySelector("[aria-label='Toggle dark mode']")?.click() },
      { id: "classic", group: "App", label: "Open the classic generator", icon: ArrowLeft, run: () => router.push("/") },
    ],
    [ordered, slots, current, p.locks, doBranch, dispatch, select, assign, toggleLock, router],
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 px-3 md:px-4">
        <Link href="/" aria-label="Back to Fomi" className="rounded-lg p-1">
          <Logo />
        </Link>
        <span aria-hidden="true" className="h-5 w-px bg-line" />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">
            <span className="font-normal text-ink-3 max-sm:hidden">{project.client} / </span>
            {project.name}
          </h1>
          <p className="truncate text-[11px] leading-tight text-ink-3">Resumed where you left off · edited {project.lastEdited}</p>
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="ml-auto flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs text-ink-3 shadow-card transition-[border-color,color] duration-150 hover:border-line-strong hover:text-ink md:w-64"
        >
          <Command size={14} aria-hidden="true" />
          <span className="max-md:sr-only">Search or run a command</span>
          <kbd className="ml-auto rounded border border-line px-1 font-sans text-[10px] max-md:hidden">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={() => setBriefOpen((v) => !v)}
          aria-expanded={briefOpen}
          className="hidden h-9 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-xs font-medium text-ink transition-colors hover:bg-panel-strong lg:flex xl:hidden"
        >
          <Target size={14} aria-hidden="true" /> {filled}/{slots.length} deliverables
        </button>
        <ThemeToggle />
        <Image src={media["woman-14"].src} alt="Your account" width={32} height={32} className="size-8 rounded-full object-cover max-sm:hidden" />
      </header>

      <div className="grid min-h-0 flex-1 gap-3 px-3 pb-3 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_320px]">
        <LineagePanel
          ordered={ordered}
          selectedId={selected.id}
          onSelect={(id) => {
            select(id);
            setView("stage");
          }}
          className={view === "lineage" ? "" : "max-lg:hidden"}
        />

        <Stage
          node={selected}
          path={p.path}
          itemIndex={itemIndex}
          compare={p.compare}
          parent={parent}
          onSelectNode={select}
          onItem={(index) => dispatch({ type: "item", index })}
          onCompare={() => dispatch({ type: "compare" })}
          onRetry={p.retry}
          className={view === "stage" ? "" : "max-lg:hidden"}
        >
          <DirectionComposer node={selected} activeLocks={p.activeLocks} onBranch={doBranch} onToggleLock={toggleLock} inputRef={composerRef} />
        </Stage>

        {/* Brief: tab on mobile, drawer on lg, fixed column on xl */}
        <BriefPanel
          project={project}
          slots={slots}
          locks={p.locks}
          current={current}
          resolveRef={p.resolveRef}
          onAssign={assign}
          onToggleLock={toggleLock}
          onClose={() => setBriefOpen(false)}
          className={`${view === "brief" ? "" : "max-lg:hidden"} lg:max-xl:fixed lg:max-xl:bottom-3 lg:max-xl:right-3 lg:max-xl:top-16 lg:max-xl:z-40 lg:max-xl:w-[340px] lg:max-xl:shadow-float lg:max-xl:transition-[transform,opacity] lg:max-xl:duration-300 lg:max-xl:ease-out ${
            briefOpen ? "" : "lg:max-xl:pointer-events-none lg:max-xl:translate-x-[110%] lg:max-xl:opacity-0"
          }`}
        />
      </div>

      {/* Mobile/tablet: one panel at a time, switched from a bottom bar */}
      <nav aria-label="Workspace panels" className="shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="flex h-14">
          {VIEWS.map((v) => (
            <li key={v.id} className="flex-1">
              <button
                type="button"
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className="flex size-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-3 transition-colors aria-[current=page]:text-ink"
              >
                <v.icon size={18} aria-hidden="true" />
                {v.label}
                {v.id === "brief" && <span className="sr-only">({filled} of {slots.length} deliverables)</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {paletteOpen && <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
