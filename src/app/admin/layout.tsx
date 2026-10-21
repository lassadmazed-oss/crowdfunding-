import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav, AdminNavLinks } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s · Back-office Lebna" },
  robots: { index: false, follow: false },
};

// Navigation only: each page checks admin rights itself (see lib/admin.ts).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-4">
        <p className="font-display text-xl font-semibold text-azur-900">Back-office</p>
        <Suspense fallback={<AdminNavLinks pathname={null} />}>
          <AdminNav />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
