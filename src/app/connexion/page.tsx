import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-azur-900">Connexion</h1>
        <p className="mt-2 text-sm text-ink-soft">Accédez à votre espace investisseur.</p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-sand-100" />}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-azur-700 hover:text-azur-800">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
