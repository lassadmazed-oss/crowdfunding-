import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand";
import { AdminNav, AdminNavLinks } from "./admin-nav";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s · Back-office Lebna" },
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Lebna", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0e2b4c",
  viewportFit: "cover",
};

// Root layout of the back-office (French only, separate from the translated public site).
// Navigation only: each page checks admin rights itself (see lib/admin.ts).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full font-sans safe-x safe-bottom">
        {/* Dark strip under the status bar when installed (white status bar text); empty in a browser. */}
        <div className="bg-azur-900 safe-top" />
        <header className="border-b border-sand-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Logo href="/admin" label="Back-office Lebna" />
              <span className="rounded-full bg-terra-50 px-2.5 py-1 text-xs font-semibold text-terra-600">Back-office</span>
            </div>
            <Link href="/fr" className="text-sm font-medium text-azur-700 hover:text-azur-800">
              Voir le site ↗
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-sand-200 pb-4">
            <Suspense fallback={<AdminNavLinks pathname={null} />}>
              <AdminNav />
            </Suspense>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
