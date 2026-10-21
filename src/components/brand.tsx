import Link from "next/link";

export function BrickMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="2" y="18" width="13" height="10" rx="2" className="fill-azur-700" />
      <rect x="17" y="18" width="13" height="10" rx="2" className="fill-azur-500" />
      <rect x="9.5" y="5" width="13" height="10" rx="2" className="fill-terra-500" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Lebna, accueil">
      <BrickMark />
      <span className="font-display text-2xl font-semibold tracking-tight text-azur-900">Lebna</span>
      <span className="hidden font-display text-lg text-terra-500 sm:inline" lang="ar" dir="rtl">
        لبنة
      </span>
    </Link>
  );
}
