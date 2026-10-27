import Image from "next/image";
import Link from "next/link";
import { Folder, Headphones, House, Image as ImageIcon, Images, PenLine, Video } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import media from "@/data/media.json";

const TABS = [
  { id: "home", label: "Home", icon: House },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "edit", label: "Edit", icon: PenLine },
  { id: "assets", label: "Assets", icon: Folder },
];

// Image/Video switch the composer mode; the other sections are not built yet and say so.
export default function TopNav({ mode, onModeChange, onOpenGallery, onUnavailable }) {
  const active = TABS.findIndex((t) => t.id === mode);

  const tabs = TABS.map((tab) => {
    const isMode = tab.id === "image" || tab.id === "video";
    const isActive = tab.id === mode;
    return (
      <li key={tab.id} className="flex flex-1 justify-center">
        <button
          type="button"
          aria-current={isActive ? "page" : undefined}
          onClick={() => (isMode ? onModeChange(tab.id) : onUnavailable(tab.label))}
          className={`group/tab relative flex h-11 w-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150 md:h-9 md:w-11 ${
            isActive ? "text-ink" : "text-ink-3 hover:text-ink"
          }`}
        >
          <tab.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" className="transition-transform duration-150 group-active/tab:scale-90" />
          <span className="text-[10px] font-medium md:sr-only">{tab.label}</span>
          {!isMode && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-full z-50 mt-2 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-bg opacity-0 transition-opacity duration-150 group-hover/tab:opacity-100 group-hover/tab:delay-300 md:block"
            >
              {tab.label} · coming soon
            </span>
          )}
        </button>
      </li>
    );
  });

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-xl md:static md:bg-transparent md:backdrop-blur-none">
        <div className="relative mx-auto flex h-16 max-w-[2200px] items-center gap-4 px-4 md:px-6">
          <Link href="/" aria-label="Fomi home" className="flex items-center rounded-lg">
            <Logo />
          </Link>

          {/* Desktop/tablet: centered tabs with a sliding indicator on a track, as in the mockup. */}
          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <div className="relative mx-auto mb-1.5 h-1.5 w-[248px] overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span
                className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-accent transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${active * 100}%)` }}
              />
            </div>
            <ul className="flex w-[248px]">{tabs}</ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenGallery}
              className="flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink active:scale-95"
            >
              <Images size={16} aria-hidden="true" />
              <span className="max-lg:sr-only">Gallery</span>
            </button>
            <a
              href="mailto:support@fomi.art"
              className="flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink active:scale-95"
            >
              <Headphones size={16} aria-hidden="true" />
              <span className="max-lg:sr-only">Support</span>
            </a>
            <ThemeToggle />
            <Image
              src={media["woman-14"].src}
              alt="Your account"
              width={32}
              height={32}
              className="ml-1 size-8 rounded-full object-cover ring-2 ring-surface"
            />
          </div>
        </div>
      </header>

      {/* Mobile: the same tabs as a thumb-reachable bottom bar. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="relative h-1 bg-transparent" aria-hidden="true">
          <span
            className="absolute inset-y-0 left-0 w-1/5 px-6 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${active * 100}%)` }}
          >
            <span className="block h-full rounded-b-full bg-accent" />
          </span>
        </div>
        <ul className="flex h-14 items-center px-2">{tabs}</ul>
      </nav>
    </>
  );
}

