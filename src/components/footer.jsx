import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-6 py-6 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted font-mono">
      <span>&copy; {new Date().getFullYear()} Investo</span>
      <div className="flex items-center gap-4">
        <Link href="/about" className="hover:text-text transition-colors">
          About
        </Link>
        <Link href="/privacy" className="hover:text-text transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-text transition-colors">
          Terms
        </Link>
        <Link href="/status" className="hover:text-text transition-colors">
          Status
        </Link>
      </div>
    </footer>
  );
}
