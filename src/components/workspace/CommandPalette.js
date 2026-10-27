"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

// ⌘K: every action in one searchable list, each with its shortcut so users learn the fast path.
export default function CommandPalette({ commands, onClose }) {
  const dialog = useRef(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const q = query.trim().toLowerCase();
  const results = q ? commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q)) : commands;

  useEffect(() => {
    dialog.current.showModal();
  }, []);

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  function run(cmd) {
    dialog.current.close();
    cmd.run();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + d + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
      aria-label="Command palette"
      className="mx-auto mt-[12vh] w-[min(92vw,560px)] animate-rise overflow-hidden rounded-[20px] bg-surface p-0 text-ink shadow-float"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={16} aria-hidden="true" className="text-ink-3" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search iterations, locks, slots, actions…"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
          aria-label="Command"
          className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3"
        />
        <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-ink-3">Esc</kbd>
      </div>
      <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-3">No matches for “{query}”</li>}
        {results.map((cmd, i) => {
          const header = cmd.group !== results[i - 1]?.group ? cmd.group : null;
          return (
            <li key={cmd.id} role="presentation">
              {header && <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-ink-3">{header}</div>}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => run(cmd)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-2 aria-selected:bg-accent-soft aria-selected:text-ink"
              >
                {cmd.icon && <cmd.icon size={15} aria-hidden="true" className="shrink-0 text-ink-3" />}
                <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                {cmd.shortcut && <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-[10px] text-ink-3">{cmd.shortcut}</kbd>}
                {i === active && <CornerDownLeft size={13} aria-hidden="true" className="text-ink-3" />}
              </div>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
