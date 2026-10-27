"use client";

import { memo } from "react";
import Image from "next/image";
import { GitBranch, Play, TriangleAlert } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { modelName } from "@/data/catalog";

const INDENT = 16;

// The project's iteration history as a tree: every direction you tried, nothing lost.
function LineagePanel({ ordered, selectedId, onSelect, className = "" }) {
  return (
    <nav aria-label="Lineage" className={`flex min-h-0 flex-col rounded-[20px] bg-surface shadow-card ${className}`}>
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <GitBranch size={15} aria-hidden="true" className="text-accent" /> Lineage
        </h2>
        <span className="text-[11px] tabular-nums text-ink-3">{ordered.length} iterations</span>
      </header>
      <p className="px-4 pb-3 text-[11px] leading-relaxed text-ink-3">
        Each step remembers its parent. Branch from any point — <kbd className="font-sans font-semibold">J</kbd>/<kbd className="font-sans font-semibold">K</kbd> to move.
      </p>

      <ol className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {ordered.map(({ node, depth }, i) => {
          const isRoot = depth === 0;
          return (
            <li key={node.id} className={isRoot && i > 0 ? "mt-3 border-t border-line pt-3" : ""}>
              <button
                type="button"
                onClick={() => onSelect(node.id)}
                aria-current={node.id === selectedId ? "true" : undefined}
                className="group relative flex w-full items-center gap-2.5 rounded-xl py-1.5 pr-2 text-left transition-colors duration-150 hover:bg-surface-2 aria-[current=true]:bg-accent-soft"
                style={{ paddingLeft: 8 + depth * INDENT }}
              >
                {depth > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-1/2 w-2.5 rounded-bl-md border-b border-l border-line-strong"
                    style={{ left: depth * INDENT - 4 }}
                  />
                )}
                <Thumb node={node} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-xs ${isRoot ? "font-semibold text-ink" : "font-medium text-ink-2"}`}>
                    {node.direction}
                  </span>
                  <span className="block truncate text-[10px] text-ink-3 group-aria-[current=true]:text-ink-2">
                    {node.status === "pending"
                      ? "Generating…"
                      : node.status === "error"
                        ? "Failed — open to retry"
                        : `${modelName(node.model)} · ${node.aspect} · ${node.items.length}`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Thumb({ node }) {
  const item = node.items[0];
  return (
    <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
      {node.status === "pending" ? (
        <span className="skeleton grid size-full place-items-center text-accent">
          <Spinner size={12} />
        </span>
      ) : node.status === "error" ? (
        <TriangleAlert size={14} className="text-danger" aria-hidden="true" />
      ) : (
        <>
          <Image src={item.src} alt="" width={72} height={72} sizes="36px" placeholder="blur" blurDataURL={item.blur} className="size-full object-cover" />
          {node.type === "video" && <Play size={9} fill="currentColor" aria-hidden="true" className="absolute bottom-0.5 right-0.5 text-white drop-shadow" />}
        </>
      )}
    </span>
  );
}

export default memo(LineagePanel);
