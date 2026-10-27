"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Copy, Download, Heart, RefreshCw, WandSparkles, X } from "lucide-react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { modelName } from "@/data/catalog";
import { ratio } from "./MediaCard";

// Full-screen viewer over a flat list of {item, batch}. Native <dialog> gives focus trap + Esc.
export default function Lightbox({ entries, startIndex, onClose, onReuse, onVariations, onCopy, favorites, onToggleFavorite }) {
  const dialog = useRef(null);
  const [index, setIndex] = useState(startIndex);
  const touchX = useRef(null);
  const { item, batch } = entries[index];
  const isVideo = batch.type === "video";
  const liked = favorites.includes(item.id);
  const go = (d) => setIndex((i) => (i + d + entries.length) % entries.length);

  useEffect(() => {
    dialog.current.showModal();
  }, []);

  function onKeyDown(e) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
      aria-label="Media viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none animate-fade bg-transparent p-0 text-white"
    >
      <div className="flex h-full flex-col lg:flex-row">
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center p-4 pt-16 lg:p-14"
          onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <div
            key={item.id}
            className="relative max-h-full w-auto max-w-full animate-rise overflow-hidden rounded-xl bg-white/5 shadow-2xl"
            style={{ aspectRatio: ratio(batch.aspect), height: "min(100%, 80dvh)" }}
          >
            {isVideo ? (
              <video src={item.video} poster={item.src} controls autoPlay loop playsInline className="size-full object-cover" />
            ) : (
              <Image
                src={item.src}
                alt={batch.prompt.slice(0, 160)}
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                placeholder="blur"
                blurDataURL={item.blur}
                className="object-cover"
              />
            )}
          </div>

          {entries.length > 1 && (
            <>
              <NavButton side="left" label="Previous" icon={ChevronLeft} onClick={() => go(-1)} />
              <NavButton side="right" label="Next" icon={ChevronRight} onClick={() => go(1)} />
            </>
          )}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs tabular-nums text-white/80 lg:hidden">
            {index + 1} / {entries.length}
          </span>
        </div>

        <aside className="flex max-h-[38dvh] shrink-0 flex-col gap-4 overflow-y-auto bg-[#17120f] p-5 lg:max-h-none lg:w-[340px]">
          <div className="flex items-center justify-between">
            <span className="text-xs tabular-nums text-white/60">
              {index + 1} of {entries.length}
            </span>
            <IconButton label="Close" icon={X} tone="glass" onClick={() => dialog.current.close()} tooltip="bottom" autoFocus />
          </div>
          <p className="text-[13px] leading-relaxed text-white/85">{batch.prompt}</p>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Meta label="Model" value={modelName(batch.model)} />
            <Meta label="Ratio" value={batch.aspect} />
            {batch.style && <Meta label="Style" value={batch.style} />}
            <Meta label="Size" value={`${item.width} × ${item.height}`} />
          </dl>
          <div className="mt-auto flex flex-wrap gap-2">
            <a
              href={item.video ?? item.src}
              download
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-b from-accent-from to-accent-to px-4 text-sm font-medium text-white transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              <Download size={15} aria-hidden="true" /> Download
            </a>
            <Button
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
              onClick={() => {
                dialog.current.close();
                onReuse(batch);
              }}
            >
              <WandSparkles size={15} aria-hidden="true" /> Reuse
            </Button>
            <Button
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
              onClick={() => {
                dialog.current.close();
                onVariations(batch);
              }}
            >
              <RefreshCw size={15} aria-hidden="true" /> More like this
            </Button>
            <IconButton
              label={liked ? "Remove from favorites" : "Add to favorites"}
              icon={Heart}
              tone="glass"
              size={40}
              pressed={liked}
              onClick={() => onToggleFavorite(item.id)}
              className={liked ? "[&_svg]:fill-current [&_svg]:text-accent" : ""}
            />
            <IconButton label="Copy prompt" icon={Copy} tone="glass" size={40} onClick={() => onCopy(batch.prompt)} />
          </div>
        </aside>
      </div>
    </dialog>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <dt className="text-white/50">{label}</dt>
      <dd className="mt-0.5 font-medium text-white/90">{value}</dd>
    </div>
  );
}

function NavButton({ side, label, icon, onClick }) {
  return (
    <span className={`absolute top-1/2 -translate-y-1/2 max-md:hidden ${side === "left" ? "left-4" : "right-4"}`}>
      <IconButton label={label} icon={icon} tone="glass" size={44} tooltip={false} onClick={onClick} />
    </span>
  );
}
