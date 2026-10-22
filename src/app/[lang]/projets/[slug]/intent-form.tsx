"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Field, FormMessage, inputClass } from "@/components/ui";
import { LOCALE_INFO, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { fill, formatTND } from "@/i18n/format";
import { saveIntent, withdrawIntent } from "@/lib/actions/intents";
import { idleState } from "@/lib/domain";

export function IntentForm({
  locale,
  t,
  projectId,
  slug,
  minTicket,
  targetAmount,
  currentAmount,
}: {
  locale: Locale;
  t: Dictionary["intent"];
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
          {fill(t.current, { amount: formatTND(currentAmount, locale) })}
        </p>
      ) : null}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="lang" value={locale} />
        <input type="hidden" name="slug" value={slug} />
        <Field
          label={fill(t.amountLabel, { currency: LOCALE_INFO[locale].currency })}
          htmlFor="intent-amount"
          error={state.errors?.amount}
          hint={fill(t.amountHint, { min: formatTND(minTicket, locale), max: formatTND(targetAmount, locale) })}
        >
          <input
            id="intent-amount"
            name="amount"
            type="number"
            dir="ltr"
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
        <SubmitButton pendingLabel={t.saving} className="w-full">
          {currentAmount != null ? t.update : t.declare}
        </SubmitButton>
        <p className="text-xs text-muted">{t.nonBinding}</p>
      </form>
      {currentAmount != null ? (
        <form action={withdrawIntent}>
          <input type="hidden" name="project_id" value={projectId} />
          <button type="submit" className="w-full text-sm font-medium text-terra-600 hover:underline">
            {t.withdraw}
          </button>
        </form>
      ) : null}
    </div>
  );
}
