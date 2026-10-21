import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, getInvestorProfile } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil investisseur" };

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/espace" className="text-sm font-medium text-azur-700 hover:text-azur-800">
        ← Mon espace
      </Link>
      <h1 className="mt-4 font-display text-4xl font-semibold text-azur-900">Questionnaire investisseur</h1>
      <p className="mt-3 text-ink-soft">
        La réglementation demande de connaître votre situation et votre expérience avant tout investissement. Vos
        réponses restent confidentielles et ne sont visibles que par vous et l&apos;équipe de conformité.
      </p>
      <Suspense fallback={<div className="mt-8 h-[40rem] animate-pulse rounded-3xl bg-sand-100" />}>
        <ProfileSection />
      </Suspense>
    </main>
  );
}

async function ProfileSection() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/espace/profil");

  const profile = await getInvestorProfile();
  if (!profile) redirect("/espace");

  return <ProfileForm profile={profile} />;
}
