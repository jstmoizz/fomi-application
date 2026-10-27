import Studio from "@/components/generate/Studio";
import { ToastProvider } from "@/components/ui/Toast";
import { getGenerationsPage } from "@/data/generations";

// First page of history is rendered on the server, so the feed is never empty on load.
// Older pages and new generations go through /api/generations.
export default function Home() {
  return (
    <ToastProvider>
      <Studio initialPage={getGenerationsPage(0)} />
    </ToastProvider>
  );
}
