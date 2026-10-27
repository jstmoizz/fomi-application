"use client";

import { useState } from "react";
import Image from "next/image";

// Before/after wipe. The range input drives it, so it works with keyboard and screen readers.
export default function CompareSlider({ before, after, beforeLabel, afterLabel }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative size-full select-none">
      <Image src={after.src} alt={afterLabel} fill sizes="60vw" placeholder="blur" blurDataURL={after.blur} className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before.src} alt={beforeLabel} fill sizes="60vw" placeholder="blur" blurDataURL={before.blur} className="object-cover" />
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[10px] font-bold text-ink shadow-float">
          ⇆
        </span>
      </span>
      <Tag className="left-3">{beforeLabel}</Tag>
      <Tag className="right-3">{afterLabel}</Tag>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

function Tag({ className, children }) {
  return (
    <span className={`pointer-events-none absolute top-3 max-w-[40%] truncate rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md ${className}`}>
      {children}
    </span>
  );
}
