import type { ReactNode } from "react";
import type { KycStatus } from "@/lib/domain";
import { labels } from "./admin-i18n";

// Small presentational pieces shared by the back-office pages.

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-azur-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-sand-200 bg-sand-50 text-xs tracking-wide text-muted uppercase">
          <tr>
            {head.map((label) => (
              <th key={label} scope="col" className="px-4 py-3 font-semibold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-200">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-muted">
        {children}
      </td>
    </tr>
  );
}

const KYC_TONES: Record<KycStatus, string> = {
  incomplete: "bg-sand-200 text-ink-soft",
  pending_review: "bg-amber-50 text-amber-700",
  verified: "bg-olive-50 text-olive-600",
  rejected: "bg-terra-50 text-terra-600",
};

export function KycBadge({ status }: { status: KycStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${KYC_TONES[status]}`}>
      {labels.kyc[status].label}
    </span>
  );
}

export function TableSkeleton() {
  return <div className="h-80 animate-pulse rounded-2xl bg-sand-100" aria-hidden="true" />;
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Tunis" }).format(
    new Date(iso),
  );
}
