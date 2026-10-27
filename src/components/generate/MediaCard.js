"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { Download, Expand, Heart, Play } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { fileName } from "@/lib/files";

export const ratio = (aspect) => aspect.replace(":", " / ");
export const isWide = (aspect) => aspect === "16:9";

// One generated image/video. The whole tile opens the lightbox; actions sit beside it (no nested buttons).
function MediaCard({ item, aspect, index, total, prompt, isVideo, duration, fresh, eager, liked, onOpen, onToggleFavorite }) {
  const [hovered, setHovered] = useState(false);
  const kind = isVideo ? "Video" : "Image";

  return (
    <figure
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group/card relative overflow-hidden rounded-[12px] bg-surface-2 shadow-card ${isWide(aspect) ? "col-span-2" : ""} ${fresh ? "animate-rise" : ""}`}
      style={{ aspectRatio: ratio(aspect), animationDelay: fresh ? `${index * 80}ms` : undefined }}
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`Open ${kind.toLowerCase()} ${index + 1} of ${total}`}
        className="absolute inset-0 block size-full cursor-zoom-in focus-visible:outline-offset-[-3px]"
      >
        <Image
          src={item.src}
          alt={`${kind} ${index + 1}: ${prompt.slice(0, 120)}`}
          fill
          sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw"
          placeholder="blur"
          blurDataURL={item.blur}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
        />
        {isVideo && hovered && (
          <video
            src={item.video}
            muted
            loop
            autoPlay
            playsInline
            aria-hidden="true"
            className="absolute inset-0 size-full animate-fade object-cover"
          />
        )}
      </button>

      {isVideo && (
        <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
          <Play size={9} fill="currentColor" aria-hidden="true" />
          0:{String(duration ?? item.duration).padStart(2, "0")}
        </span>
      )}

      {/* Actions: revealed on hover/focus on pointer devices, always visible on touch */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end gap-1.5 bg-linear-to-t from-black/45 to-transparent p-2 pt-8 opacity-0 transition-opacity duration-150 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:bg-none [@media(hover:none)]:opacity-100">
        <IconButton
          label={liked ? "Remove from favorites" : "Add to favorites"}
          icon={Heart}
          tone="glass"
          size={30}
          pressed={liked}
          onClick={() => onToggleFavorite(item.id)}
          className={liked ? "[&_svg]:fill-current [&_svg]:text-accent" : ""}
        />
        <a
          href={item.video ?? item.src}
          download={fileName(prompt, index, item.video ?? item.src)}
          aria-label={`Download ${kind.toLowerCase()} ${index + 1}`}
          className="grid size-[30px] place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-[background-color,transform] duration-150 hover:bg-black/65 active:scale-90"
        >
          <Download size={14} aria-hidden="true" />
        </a>
        <IconButton label="View full size" icon={Expand} tone="glass" size={30} onClick={() => onOpen(index)} className="max-md:hidden" />
      </div>
    </figure>
  );
}

export default memo(MediaCard);
