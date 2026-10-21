"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Field, FormMessage, inputClass } from "@/components/ui";
import { saveIntent, withdrawIntent } from "@/lib/actions/intents";
import { formatTND, idleState } from "@/lib/domain";

export function IntentForm({
  projectId,
  slug,
  minTicket,
  targetAmount,
  currentAmount,
}: {
  projectId: string;
  slug: string;
  minTicket: number;
  targetAmount: number;
  currentAmount: number | null;
}) {
  const [state, formAction] = useActionState(saveIntent, idleState);
  const amount = state.values?.amount ?? (currentAmount != null ? String(currentAmount) : "");

  return (
    <div className="space-y-4">
      {currentAmount != null ? (
        <p className="rounded-xl bg-azur-50 px-4 py-3 text-azur-800">
          Vous avez déclaré <strong>{formatTND(currentAmount)}</strong>. Vous pouvez modifier ou retirer cette
          intention à tout moment.
        </p>
      ) : null}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />
        <Field
          label="Montant envisagé (DT)"
          htmlFor="intent-amount"
          error={state.errors?.amount}
          hint={`Entre ${formatTND(minTicket)} et ${formatTND(targetAmount)}`}
        >
          <input
            id="intent-amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={minTicket}
            max={targetAmount}
            step="any"
            required
            defaultValue={String(amount)}
            aria-invalid={Boolean(state.errors?.amount)}
            className={inputClass}
          />
        </Field>
        <FormMessage status={state.status} message={state.message} />
        <SubmitButton pendingLabel="Enregistrement…" className="w-full">
          {currentAmount != null ? "Mettre à jour" : "Déclarer mon intention"}
        </SubmitButton>
        <p className="text-xs text-muted">Non engageante : aucun paiement ne vous sera demandé avant l&apos;agrément.</p>
      </form>
      {currentAmount != null ? (
        <form action={withdrawIntent}>
          <input type="hidden" name="project_id" value={projectId} />
          <button type="submit" className="w-full text-sm font-medium text-terra-600 hover:underline">
            Retirer mon intention
          </button>
        </form>
      ) : null}
    </div>
  );
}
