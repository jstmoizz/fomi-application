"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { clearStored } from "@/lib/storage";

// Last line of defence: never a white screen. Saved local data is the likeliest culprit, so offer to reset it.
export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-danger">
        <TriangleAlert size={24} aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-3">
          Try again first. If it keeps happening, resetting the work saved in this browser usually fixes it.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={() => retry()}>
          <RotateCcw size={15} aria-hidden="true" /> Try again
        </Button>
        <Button
          onClick={() => {
            clearStored();
            location.reload();
          }}
        >
          Reset local data
        </Button>
      </div>
    </main>
  );
}
