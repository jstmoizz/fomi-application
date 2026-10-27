"use client";

import { useId, useState } from "react";
import { CornerDownLeft, GitBranch, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { NUDGES } from "@/data/project";

// You don't rewrite the prompt — you give a direction. The new iteration branches from what's on stage.
export default function DirectionComposer({ node, activeLocks, onBranch, onToggleLock, inputRef }) {
  const [direction, setDirection] = useState("");
  const id = useId();

  function submit(text) {
    const value = text.trim();
    if (!value) return;
    onBranch(value);
    setDirection("");
  }

  return (
    <div className="rounded-[20px] border border-line bg-surface p-2 shadow-float">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(direction);
        }}
        className="flex items-center gap-2"
      >
        <GitBranch size={16} aria-hidden="true" className="ml-2 shrink-0 text-accent" />
        <label htmlFor={id} className="sr-only">
          Direction for the next iteration
        </label>
        <input
          id={id}
          ref={inputRef}
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder={`Direct from “${node.direction}” — e.g. softer shadows, look off-camera`}
          autoComplete="off"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
        />
        <Button type="submit" variant="primary" disabled={!direction.trim()} className="shrink-0">
          Branch <CornerDownLeft size={14} aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line px-1 pt-2">
        {activeLocks.map((lock) => (
          <button
            key={lock.id}
            type="button"
            onClick={() => onToggleLock(lock.id)}
            title={`Locked: ${lock.prompt}. Click to unlock.`}
            className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-1 text-[11px] font-medium text-ink-2 transition-[background-color,transform] duration-150 hover:bg-panel-strong active:scale-95"
          >
            <Lock size={10} aria-hidden="true" /> {lock.label}
          </button>
        ))}
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-line" />
        <span className="sr-only">Quick directions:</span>
        {NUDGES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => submit(n)}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-2 transition-[border-color,color,transform] duration-150 hover:border-line-strong hover:text-ink active:scale-95"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
