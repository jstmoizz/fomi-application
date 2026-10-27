"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
];

// Everything you've made in one masonry view. Picking a tile hands off to the lightbox.
export default function Gallery({ entries, onClose, onPick }) {
  const dialog = useRef(null);
  const [filter, setFilter] = useState("all");
  const shown = entries.map((e, i) => ({ ...e, i })).filter((e) => filter === "all" || e.batch.type === filter);

  useEffect(() => {
    dialog.current.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="gallery-title"
      className="m-auto h-[min(92dvh,1000px)] w-[min(96vw,1400px)] max-w-none animate-rise overflow-hidden rounded-[24px] bg-bg p-0 text-ink shadow-float"
    >
      <div className="flex h-full flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
          <h2 id="gallery-title" className="mr-auto text-base font-semibold">
            Gallery <span className="ml-1 text-sm font-normal text-ink-3">{shown.length}</span>
          </h2>
          <SegmentedControl label="Filter" name="gallery-filter" value={filter} onChange={setFilter} options={FILTERS} className="w-60" />
          <IconButton label="Close gallery" icon={X} onClick={() => dialog.current.close()} tooltip="bottom" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4 2xl:columns-5">
            {shown.map(({ item, batch, i }) => (
              <li key={item.id} className="mb-3 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => {
                    dialog.current.close();
                    onPick(i);
                  }}
                  className="group relative block w-full overflow-hidden rounded-xl bg-surface-2"
                  style={{ aspectRatio: batch.aspect.replace(":", " / ") }}
                  aria-label={`Open: ${batch.prompt.slice(0, 80)}`}
                >
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    placeholder="blur"
                    blurDataURL={item.blur}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  {batch.type === "video" && (
                    <Play size={14} fill="currentColor" aria-hidden="true" className="absolute left-2 top-2 text-white drop-shadow" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
