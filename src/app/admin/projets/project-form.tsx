"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Field, FormMessage, inputClass } from "@/components/ui";
import { saveProject } from "@/lib/actions/admin";
import type { AdminProject } from "@/lib/admin";
import { GOVERNORATES, INSTRUMENTS, MODELS, MODEL_ORDER, STATUSES, STATUS_ORDER, idleState } from "@/lib/domain";

const STATUS_HINTS: Record<string, string> = {
  draft: "Invisible sur le site",
  coming_soon: "Visible, intentions ouvertes",
  open: "Visible, intentions ouvertes",
  funded: "Visible, intentions fermées",
  closed: "Visible, intentions fermées",
};

export function ProjectForm({ project }: { project?: AdminProject }) {
  const [state, formAction] = useActionState(saveProject, idleState);
  const errors = state.errors ?? {};
  // After a failed submit show what was typed, otherwise what is saved.
  const value = (name: string): string => {
    if (state.values && name in state.values) return String(state.values[name] ?? "");
    if (!project) return "";
    const saved = project[name as keyof AdminProject];
    if (Array.isArray(saved)) return saved.join("\n");
    if (typeof saved === "boolean") return saved ? "on" : "";
    return saved == null ? "" : String(saved);
  };
  const props = (name: string) => ({
    id: `pj-${name}`,
    name,
    defaultValue: value(name),
    "aria-invalid": Boolean(errors[name]),
    className: inputClass,
  });

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <Card title="Présentation">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre" htmlFor="pj-title" error={errors.title}>
            <input {...props("title")} />
          </Field>
          <Field
            label="Adresse de la page"
            htmlFor="pj-slug"
            error={errors.slug}
            hint="Ex. residence-yasmine-ennasr. Laissez vide pour la générer depuis le titre."
          >
            <input {...props("slug")} placeholder="genere-depuis-le-titre" />
          </Field>
        </div>
        <Field label="Accroche" htmlFor="pj-tagline" hint="Une phrase affichée sous le titre (160 caractères max.)">
          <input {...props("tagline")} maxLength={160} />
        </Field>
        <Field label="Description" htmlFor="pj-description">
          <textarea {...props("description")} rows={6} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Points forts" htmlFor="pj-highlights" hint="Un par ligne">
            <textarea {...props("highlights")} rows={4} />
          </Field>
          <Field label="Risques" htmlFor="pj-risks" error={errors.risks} hint="Un par ligne, obligatoire pour publier">
            <textarea {...props("risks")} rows={4} />
          </Field>
        </div>
      </Card>

      <Card title="Localisation et porteur">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ville" htmlFor="pj-city" error={errors.city}>
            <input {...props("city")} />
          </Field>
          <Field label="Gouvernorat" htmlFor="pj-governorate" error={errors.governorate}>
            <select {...props("governorate")}>
              <option value="">Choisir…</option>
              {GOVERNORATES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Porteur du projet" htmlFor="pj-developer_name">
            <input {...props("developer_name")} />
          </Field>
        </div>
      </Card>

      <Card title="Financement">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Type de projet" htmlFor="pj-model" error={errors.model}>
            <select {...props("model")}>
              <option value="">Choisir…</option>
              {MODEL_ORDER.map((model) => (
                <option key={model} value={model}>
                  {MODELS[model].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Instrument" htmlFor="pj-instrument" error={errors.instrument}>
            <select {...props("instrument")}>
              <option value="">Choisir…</option>
              {Object.entries(INSTRUMENTS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Objectif de collecte (DT)" htmlFor="pj-target_amount" error={errors.target_amount}>
            <input {...props("target_amount")} inputMode="decimal" />
          </Field>
          <Field label="Ticket minimum (DT)" htmlFor="pj-min_ticket" error={errors.min_ticket}>
            <input {...props("min_ticket")} inputMode="decimal" />
          </Field>
          <Field label="Rendement cible (% par an)" htmlFor="pj-target_return_pct" error={errors.target_return_pct}>
            <input {...props("target_return_pct")} inputMode="decimal" />
          </Field>
          <Field label="Durée (mois)" htmlFor="pj-duration_months" error={errors.duration_months}>
            <input {...props("duration_months")} inputMode="numeric" />
          </Field>
        </div>
      </Card>

      <Card title="Publication">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Statut" htmlFor="pj-status" error={errors.status}>
            <select {...props("status")} defaultValue={value("status") || "draft"}>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUSES[status]} — {STATUS_HINTS[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ouverture prévue" htmlFor="pj-opens_on" error={errors.opens_on} hint="Laisser vide : « Dès l'agrément »">
            <input {...props("opens_on")} type="date" />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" name="is_demo" defaultChecked={value("is_demo") === "on"} className="size-4 accent-azur-700" />
          Projet d&apos;exemple (affiche le badge « Exemple » et l&apos;avertissement)
        </label>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-sand-200 bg-sand-50/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <SubmitButton pendingLabel="Enregistrement…">{project ? "Enregistrer les modifications" : "Créer le projet"}</SubmitButton>
        <div className="min-w-0 flex-1">
          <FormMessage status={state.status} message={state.message} />
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-sand-200 bg-white p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-semibold text-ink">{title}</h2>
      {children}
    </fieldset>
  );
}
