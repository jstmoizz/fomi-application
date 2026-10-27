import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">404</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">This page doesn’t exist</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-3">The link may be old, or the address has a typo. Your work is safe.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/" className={buttonClass({ variant: "primary" })}>
          Open the generator
        </Link>
        <Link href="/workspace" className={buttonClass()}>
          Open the workspace
        </Link>
      </div>
    </main>
  );
}
