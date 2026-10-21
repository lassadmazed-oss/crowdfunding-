import Link from "next/link";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import { getCurrentUser, getInvestorProfile, getMyIntents } from "@/lib/auth";
import { isCollecting, type Project } from "@/lib/domain";
import { IntentForm } from "./intent-form";

// What the visitor can do on a project depends on who they are, so this part renders per request.
export async function IntentPanel({ project }: { project: Project }) {
  if (!isCollecting(project.status)) {
    return <Panel title="Collecte terminée">Ce projet ne recueille plus d&apos;intentions.</Panel>;
  }

  const user = await getCurrentUser();
  const next = encodeURIComponent(`/projets/${project.slug}`);
  if (!user) {
    return (
      <Panel title="Intéressé par ce projet ?">
        <p>Créez votre compte investisseur pour déclarer une intention, sans engagement.</p>
        <div className="mt-4 grid gap-2">
          <Link href="/inscription" className={buttonClass}>
            Créer un compte
          </Link>
          <Link href={`/connexion?next=${next}`} className={secondaryButtonClass}>
            J&apos;ai déjà un compte
          </Link>
        </div>
      </Panel>
    );
  }

  const profile = await getInvestorProfile();
  if (!profile || profile.kyc_status === "incomplete") {
    return (
      <Panel title="Dernière étape">
        <p>Complétez votre questionnaire investisseur pour déclarer une intention sur ce projet.</p>
        <Link href="/espace/profil" className={`${buttonClass} mt-4 w-full`}>
          Compléter mon profil
        </Link>
      </Panel>
    );
  }
  if (profile.kyc_status === "rejected") {
    return <Panel title="Profil non validé">Contactez-nous pour en savoir plus sur votre profil.</Panel>;
  }

  const intents = await getMyIntents();
  const current = intents.find((intent) => intent.project.id === project.id);

  return (
    <Panel title={current ? "Votre intention" : "Déclarer mon intention"}>
      <IntentForm
        projectId={project.id}
        slug={project.slug}
        minTicket={project.min_ticket}
        targetAmount={project.target_amount}
        currentAmount={current?.amount ?? null}
      />
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5 text-sm leading-relaxed text-ink-soft shadow-sm">
      <h2 className="mb-2 font-display text-xl font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}
