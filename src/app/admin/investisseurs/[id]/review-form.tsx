"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, FormMessage, inputClass } from "@/components/ui";
import { reviewKyc } from "@/lib/actions/admin";
import { idleState, type KycStatus } from "@/lib/domain";

export function ReviewForm({ investorId, status }: { investorId: string; status: KycStatus }) {
  const [state, formAction] = useActionState(reviewKyc, idleState);

  if (status === "incomplete") {
    return (
      <form action={formAction} className="space-y-3">
        <p className="text-sm text-ink-soft">
          Le questionnaire n&apos;est pas terminé : il n&apos;y a rien à valider. Vous pouvez seulement refuser le
          compte (spam, doublon…).
        </p>
        <input type="hidden" name="investor_id" value={investorId} />
        <NoteField error={state.errors?.note} defaultValue={String(state.values?.note ?? "")} />
        <FormMessage status={state.status} message={state.message} />
        <DecisionButton decision="rejected" label="Refuser le compte" tone="danger" />
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="investor_id" value={investorId} />
      <NoteField error={state.errors?.note} defaultValue={String(state.values?.note ?? "")} />
      <FormMessage status={state.status} message={state.message} />
      <div className="grid gap-2">
        {status !== "verified" ? <DecisionButton decision="verified" label="Valider le profil" tone="primary" /> : null}
        {status !== "rejected" ? <DecisionButton decision="rejected" label="Refuser" tone="danger" /> : null}
        {status !== "pending_review" ? (
          <DecisionButton decision="pending_review" label="Remettre en vérification" tone="neutral" />
        ) : null}
      </div>
    </form>
  );
}

function NoteField({ error, defaultValue }: { error?: string; defaultValue: string }) {
  return (
    <Field label="Note interne" htmlFor="kyc-note" error={error} hint="Obligatoire en cas de refus. Non visible par l'investisseur.">
      <textarea
        id="kyc-note"
        name="note"
        rows={3}
        maxLength={500}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className={inputClass}
      />
    </Field>
  );
}

const TONES = {
  primary: "bg-olive-600 text-white hover:bg-[#4a6128]",
  danger: "border border-terra-500 text-terra-600 hover:bg-terra-500 hover:text-white",
  neutral: "border border-sand-300 text-ink-soft hover:border-azur-500 hover:text-azur-700",
};

function DecisionButton({ decision, label, tone }: { decision: string; label: string; tone: keyof typeof TONES }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="decision"
      value={decision}
      disabled={pending}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${TONES[tone]}`}
    >
      {label}
    </button>
  );
}
