import type { ReactNode } from "react";

// Shared form styling. Plain components (no hooks) so Server and Client Components can both use them.

export const inputClass =
  "block w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-ink shadow-sm outline-none " +
  "placeholder:text-muted/70 focus:border-azur-500 focus:ring-3 focus:ring-azur-100 " +
  "aria-[invalid=true]:border-terra-500 aria-[invalid=true]:ring-terra-100";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-azur-700 px-5 py-3 font-semibold text-white " +
  "shadow-sm transition hover:bg-azur-800 focus-visible:outline-3 focus-visible:outline-offset-2 " +
  "focus-visible:outline-azur-500 disabled:cursor-wait disabled:opacity-70";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-5 py-3 " +
  "font-semibold text-ink transition hover:border-azur-500 hover:text-azur-700";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-terra-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormMessage({ status, message }: { status: "idle" | "success" | "error"; message?: string }) {
  if (!message) return null;
  const tone =
    status === "success" ? "border-olive-600/30 bg-olive-50 text-olive-600" : "border-terra-400/40 bg-terra-50 text-terra-600";
  return (
    <p role={status === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
      {message}
    </p>
  );
}

export function ChoiceCard({
  name,
  value,
  type = "radio",
  defaultChecked,
  title,
  description,
}: {
  name: string;
  value: string;
  type?: "radio" | "checkbox";
  defaultChecked?: boolean;
  title: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-sand-300 bg-white p-3.5 transition has-checked:border-azur-500 has-checked:bg-azur-50">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-azur-700"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description ? <span className="mt-0.5 block text-sm text-muted">{description}</span> : null}
      </span>
    </label>
  );
}
