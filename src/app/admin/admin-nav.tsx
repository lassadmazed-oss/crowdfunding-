"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/investisseurs", label: "Investisseurs" },
  { href: "/admin/liste-attente", label: "Liste d'attente" },
];

// Reading the path is runtime data, so the layout wraps this in Suspense with AdminNavLinks as fallback.
export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

export function AdminNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex flex-wrap gap-1 text-sm font-medium">
      {LINKS.map((link) => {
        const active = pathname !== null && (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 ${active ? "bg-azur-700 text-white" : "text-ink-soft hover:bg-sand-100 hover:text-ink"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
