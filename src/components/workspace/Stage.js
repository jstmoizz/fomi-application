"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight, Columns2, Download, RotateCcw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import CompareSlider from "./CompareSlider";

const ratio = (aspect) => aspect.split(":").map(Number);

// The selected iteration, big. Breadcrumb shows how it was made; compare shows what the last direction changed.
export default function Stage({ node, path, itemIndex, compare, parent, onSelectNode, onItem, onCompare, onRetry, children, className = "" }) {
  const [w, h] = ratio(node.aspect);
  const item = node.items[itemIndex];
  const parentItem = parent?.items[Math.min(itemIndex, parent.items.length - 1)];
  const canCompare = node.status === "done" && node.type === "image" && parent?.status === "done" && parent.type === "image";
  const crumbs = useRef(null);

  // On narrow screens keep the current step (the end of the path) in view.
  useEffect(() => {
    crumbs.current?.scrollTo({ left: crumbs.current.scrollWidth });
  }, [node.id]);

  return (
    <main id="main" aria-label="Stage" className={`flex min-h-0 min-w-0 flex-col gap-3 ${className}`}>
      <header className="flex min-h-10 flex-wrap items-center gap-2">
        <nav aria-label="Iteration path" className="min-w-0 flex-1">
          <ol ref={crumbs} className="no-scrollbar flex items-center gap-1 overflow-x-auto text-xs">
            {path.map((n, i) => (
              <Fragment key={n.id}>
                {i > 0 && <ChevronRight size={12} aria-hidden="true" className="shrink-0 text-ink-3" />}
                <li className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectNode(n.id)}
                    aria-current={n.id === node.id ? "step" : undefined}
                    className="rounded-full px-2.5 py-1 text-ink-3 transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current=step]:bg-surface aria-[current=step]:font-semibold aria-[current=step]:text-ink aria-[current=step]:shadow-card"
                  >
                    {n.direction}
                  </button>
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={compare ? "primary" : "secondary"}
            onClick={() => onCompare()}
            disabled={!canCompare}
            aria-pressed={compare}
            title={canCompare ? "Compare with parent (C)" : "Needs a parent image to compare against"}
          >
            <Columns2 size={14} aria-hidden="true" /> Compare
          </Button>
          {item && (
            <a
              href={item.video ?? item.src}
              download
              aria-label="Download current"
              className="grid size-8 place-items-center rounded-full border border-line bg-surface text-ink-2 transition-[background-color,transform] duration-150 hover:bg-surface-2 hover:text-ink active:scale-90"
            >
              <Download size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </header>

      {/* Viewer: sized with container units so any aspect ratio fits without cropping */}
      <div className="relative min-h-[240px] flex-1 [container-type:size]">
        <div
          key={`${node.id}-${node.status}`}
          className="absolute left-1/2 top-1/2 aspect-(--r) -translate-x-1/2 -translate-y-1/2 animate-fade overflow-hidden rounded-[18px] bg-surface-2 shadow-float"
          style={{ "--r": `${w} / ${h}`, width: `min(100cqw, calc(100cqh * ${w / h}))` }}
        >
          {node.status === "pending" ? (
            <div className="skeleton grid size-full place-items-center" role="status">
              <span className="flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-xs font-medium text-ink-2 backdrop-blur">
                <Spinner size={12} className="text-accent" /> Directing “{node.direction}”…
              </span>
            </div>
          ) : node.status === "error" ? (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
              <TriangleAlert className="text-danger" aria-hidden="true" />
              <p className="text-sm text-ink-2" role="alert">{node.error}</p>
              <Button size="sm" variant="primary" onClick={() => onRetry(node)}>
                <RotateCcw size={13} aria-hidden="true" /> Retry
              </Button>
            </div>
          ) : compare && canCompare ? (
            <CompareSlider before={parentItem} after={item} beforeLabel={parent.direction} afterLabel={node.direction} />
          ) : node.type === "video" ? (
            <video key={item.id} src={item.video} poster={item.src} autoPlay muted loop playsInline controls className="size-full object-cover" />
          ) : (
            <Image
              key={item.id}
              src={item.src}
              alt={`${node.direction}, option ${itemIndex + 1}`}
              fill
              sizes="(min-width: 1280px) 50vw, 100vw"
              placeholder="blur"
              blurDataURL={item.blur}
              fetchPriority="high"
              className="animate-fade object-cover"
            />
          )}
        </div>
      </div>

      {/* Filmstrip of this iteration's options */}
      <div role="group" aria-label="Options in this iteration" className="flex items-center justify-center gap-2">
        {node.status === "pending"
          ? Array.from({ length: node.params?.count ?? 4 }, (_, i) => <span key={i} className="skeleton size-12 rounded-xl" />)
          : node.items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => onItem(i)}
                aria-pressed={i === itemIndex}
                aria-label={`Option ${i + 1}`}
                className={`relative size-12 overflow-hidden rounded-xl ring-offset-2 ring-offset-bg transition-[transform,box-shadow,opacity] duration-150 hover:-translate-y-0.5 aria-pressed:ring-2 aria-pressed:ring-accent ${
                  i === itemIndex ? "" : "opacity-70 hover:opacity-100"
                } ${node.fresh ? "animate-rise" : ""}`}
                style={{ animationDelay: node.fresh ? `${i * 70}ms` : undefined }}
              >
                <Image src={it.src} alt="" width={96} height={96} sizes="48px" placeholder="blur" blurDataURL={it.blur} className="size-full object-cover" />
              </button>
            ))}
        {node.status === "done" && (
          <span className="ml-1 hidden text-[10px] text-ink-3 sm:block">
            <kbd className="font-sans">←</kbd> <kbd className="font-sans">→</kbd>
          </span>
        )}
      </div>

      {children}
    </main>
  );
}

