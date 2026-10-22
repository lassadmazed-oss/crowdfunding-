"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { ChoiceCard, Field, FormMessage, inputClass } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { saveProfile } from "@/lib/actions/profile";
import {
  ASSET_RANGE_CODES,
  COUNTRY_CODES,
  EXPERIENCE_CODES,
  INCOME_RANGE_CODES,
  idleState,
  type InvestorProfile,
} from "@/lib/domain";

export function ProfileForm({
  profile,
  locale,
  t,
  labels,
}: {
  profile: InvestorProfile;
  locale: Locale;
  t: Dictionary["profile"];
  labels: Dictionary["labels"];
}) {
  const [state, formAction] = useActionState(saveProfile, idleState);
  const errors = state.errors ?? {};
  // After a failed submit, show what was typed; otherwise what is saved.
  const value = (name: keyof InvestorProfile | "risk_ack") => {
    if (state.values && name in state.values) return String(state.values[name] ?? "");
    const saved = name === "risk_ack" ? profile.risk_acknowledged_at : profile[name];
    return saved == null ? "" : String(saved);
  };
  const [residency, setResidency] = useState(value("residency") || "resident");
  const defaultAbroad = locale === "de" ? "DE" : locale === "it" ? "IT" : "FR";

  return (
    <form action={formAction} className="mt-8 space-y-8" noValidate>
      <input type="hidden" name="lang" value={locale} />
      <Section title={t.identity}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.fullName} htmlFor="pf-name" error={errors.full_name}>
            <input id="pf-name" name="full_name" autoComplete="name" defaultValue={value("full_name")} aria-invalid={Boolean(errors.full_name)} className={inputClass} />
          </Field>
          <Field label={t.phone} htmlFor="pf-phone" error={errors.phone}>
            <input id="pf-phone" name="phone" type="tel" dir="ltr" autoComplete="tel" placeholder={t.phonePlaceholder} defaultValue={value("phone")} aria-invalid={Boolean(errors.phone)} className={inputClass} />
          </Field>
          <Field label={t.birthDate} htmlFor="pf-birth" error={errors.birth_date}>
            <input id="pf-birth" name="birth_date" type="date" autoComplete="bday" defaultValue={value("birth_date")} aria-invalid={Boolean(errors.birth_date)} className={inputClass} />
          </Field>
          <Field label={t.profession} htmlFor="pf-profession" error={errors.profession}>
            <input id="pf-profession" name="profession" autoComplete="organization-title" defaultValue={value("profession")} aria-invalid={Boolean(errors.profession)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title={t.residence}>
        <div className="grid gap-2 sm:grid-cols-2" onChange={(event) => setResidency((event.target as HTMLInputElement).value)}>
          <ChoiceCard name="residency" value="resident" title={t.resident} defaultChecked={residency === "resident"} />
          <ChoiceCard
            name="residency"
            value="non_resident"
            title={t.nonResident}
            description={t.nonResidentHint}
            defaultChecked={residency === "non_resident"}
          />
        </div>
        {errors.residency ? <p className="text-sm text-terra-600">{errors.residency}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.country} htmlFor="pf-country" error={errors.country}>
            <select
              id="pf-country"
              name="country"
              key={residency}
              defaultValue={residency === "resident" ? "TN" : value("country") === "TN" ? defaultAbroad : value("country") || defaultAbroad}
              aria-invalid={Boolean(errors.country)}
              className={inputClass}
            >
              {COUNTRY_CODES.filter((code) => (residency === "resident" ? code === "TN" : code !== "TN")).map((code) => (
                <option key={code} value={code}>
                  {labels.countries[code]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.city} htmlFor="pf-city">
            <input id="pf-city" name="city" autoComplete="address-level2" defaultValue={value("city")} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title={t.finances} description={t.financesHint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.income} htmlFor="pf-income" error={errors.annual_income_range}>
            <select id="pf-income" name="annual_income_range" defaultValue={value("annual_income_range")} aria-invalid={Boolean(errors.annual_income_range)} className={inputClass}>
              <option value="" disabled>
                —
              </option>
              {INCOME_RANGE_CODES.map((code) => (
                <option key={code} value={code}>
                  {labels.incomeRanges[code]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.assets} htmlFor="pf-assets" error={errors.investable_assets_range}>
            <select id="pf-assets" name="investable_assets_range" defaultValue={value("investable_assets_range")} aria-invalid={Boolean(errors.investable_assets_range)} className={inputClass}>
              <option value="" disabled>
                —
              </option>
              {ASSET_RANGE_CODES.map((code) => (
                <option key={code} value={code}>
                  {labels.assetRanges[code]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title={t.experience}>
        <div className="grid gap-2">
          {EXPERIENCE_CODES.map((code) => (
            <ChoiceCard key={code} name="experience_level" value={code} title={labels.experience[code]} defaultChecked={value("experience_level") === code} />
          ))}
        </div>
        {errors.experience_level ? <p className="text-sm text-terra-600">{errors.experience_level}</p> : null}
        <ChoiceCard
          type="checkbox"
          name="prefers_sukuk"
          value="on"
          title={t.sukuk}
          defaultChecked={value("prefers_sukuk") === "true" || value("prefers_sukuk") === "on"}
        />
      </Section>

      <Section title={t.risks}>
        <label className="flex gap-3 rounded-xl border border-terra-100 bg-terra-50 p-4 text-sm text-ink">
          <input type="checkbox" name="risk_ack" defaultChecked={value("risk_ack") !== ""} className="mt-0.5 size-4 shrink-0 accent-terra-500" />
          <span className="space-y-1.5">
            <span className="block font-medium">{t.riskIntro}</span>
            {t.riskItems.map((item) => (
              <span key={item} className="block">
                • {item}
              </span>
            ))}
            {errors.risk_ack ? <span className="block text-terra-600">{errors.risk_ack}</span> : null}
          </span>
        </label>
      </Section>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton pendingLabel={t.pending} className="w-full sm:w-auto">
        {t.submit}
      </SubmitButton>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-3xl border border-sand-200 bg-white p-6 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </fieldset>
  );
}
