"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Field, FormMessage, inputClass } from "@/components/ui";
import { signIn } from "@/lib/actions/auth";
import { idleState } from "@/lib/domain";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signIn, idleState);
  const linkFailed = searchParams.get("erreur") === "lien";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={searchParams.get("next") ?? "/espace"} />
      {linkFailed && state.status === "idle" ? (
        <FormMessage status="error" message="Ce lien de confirmation est invalide ou a expiré. Connectez-vous ou réinscrivez-vous." />
      ) : null}
      <Field label="E-mail" htmlFor="li-email">
        <input
          id="li-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={String(state.values?.email ?? "")}
          className={inputClass}
        />
      </Field>
      <Field label="Mot de passe" htmlFor="li-password">
        <input id="li-password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <FormMessage status={state.status} message={state.message} />
      <SubmitButton pendingLabel="Connexion…" className="w-full">
        Se connecter
      </SubmitButton>
    </form>
  );
}
