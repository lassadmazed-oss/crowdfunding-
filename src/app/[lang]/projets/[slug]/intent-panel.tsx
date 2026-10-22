import Link from "next/link";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCurrentUser, getInvestorProfile, getMyIntents } from "@/lib/auth";
import { isCollecting, type Project } from "@/lib/domain";
import { IntentForm } from "./intent-form";

// What the visitor can do on a project depends on who they are, so this part renders per request.
export async function IntentPanel({ project, t, locale }: { project: Project; t: Dictionary; locale: Locale }) {
  if (!isCollecting(project.status)) {
    return <Panel title={t.intent.closedTitle}>{t.intent.closedText}</Panel>;
  }

  const user = await getCurrentUser();
  const next = encodeURIComponent(`/${locale}/projets/${project.slug}`);
  if (!user) {
    return (
      <Panel title={t.intent.guestTitle}>
        <p>{t.intent.guestText}</p>
        <div className="mt-4 grid gap-2">
          <Link href={`/${locale}/inscription`} className={buttonClass}>
            {t.intent.createAccount}
          </Link>
          <Link href={`/${locale}/connexion?next=${next}`} className={secondaryButtonClass}>
            {t.intent.haveAccount}
          </Link>
        </div>
      </Panel>
    );
  }

  const profile = await getInvestorProfile();
  if (!profile || profile.kyc_status === "incomplete") {
    return (
      <Panel title={t.intent.incompleteTitle}>
        <p>{t.intent.incompleteText}</p>
        <Link href={`/${locale}/espace/profil`} className={`${buttonClass} mt-4 w-full`}>
          {t.intent.completeProfile}
        </Link>
      </Panel>
    );
  }
  if (profile.kyc_status === "rejected") {
    return <Panel title={t.intent.rejectedTitle}>{t.intent.rejectedText}</Panel>;
  }

  const intents = await getMyIntents();
  const current = intents.find((intent) => intent.project.id === project.id);

  return (
    <Panel title={current ? t.intent.yourIntent : t.intent.declareTitle}>
      <IntentForm
        locale={locale}
        t={t.intent}
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
