import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Créer un compte investisseur" };

export default function SignupPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <h1 className="font-display text-4xl font-semibold text-azur-900">Créer votre compte investisseur</h1>
        <p className="text-ink-soft">
          Un compte vous permet de compléter votre profil investisseur et de déclarer votre intérêt pour les projets,
          sans aucun engagement.
        </p>
        <ol className="space-y-3 text-sm text-ink-soft">
          <li className="flex gap-3">
            <Step n={1} /> Créez votre compte et confirmez votre e-mail.
          </li>
          <li className="flex gap-3">
            <Step n={2} /> Répondez au questionnaire investisseur (3 minutes).
          </li>
          <li className="flex gap-3">
            <Step n={3} /> Déclarez vos intentions sur les projets qui vous intéressent.
          </li>
        </ol>
      </div>
      <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-semibold text-azur-700 hover:text-azur-800">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-terra-500 text-xs font-semibold text-white">
      {n}
    </span>
  );
}
