# Lebna — crowdfunding immobilier en Tunisie

MVP de la plateforme : page d'accueil avec liste d'attente, comptes investisseurs avec questionnaire,
catalogue de projets et intentions d'investissement **non engageantes** (aucune collecte de fonds avant
l'agrément du CMF).

Stack : Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Supabase (Postgres, Auth, RLS).

## Démarrer

```bash
npm install
npm run dev
```

Les variables sont dans `.env` (non versionné ; modèle dans `.env.example`).

## Langues

Le site public existe en **arabe** (de droite à gauche), **français**, **anglais**, **allemand** et **italien** :
`/ar`, `/fr`, `/en`, `/de`, `/it`. La langue est choisie d'après le navigateur, puis mémorisée (cookie)
quand le visiteur change de langue avec le sélecteur du menu. Le back-office reste en français.

- Textes de l'interface : `src/i18n/dictionaries/` (`fr.ts` est la référence ; les autres fichiers doivent avoir
  exactement les mêmes clés, TypeScript le vérifie).
- Textes des projets : saisis en français dans le back-office, avec une section « Traductions » par langue.
  Un champ laissé vide affiche le texte français.
- Les e-mails envoyés par Supabase (confirmation d'inscription) restent dans la langue configurée dans
  Supabase (Authentication → Emails → Templates).

## Pages

| Route | Contenu |
| --- | --- |
| `/[lang]` | Accueil, chiffres du marché, modèles, liste d'attente |
| `/[lang]/projets`, `/[lang]/projets/[slug]` | Catalogue filtrable et fiche projet avec déclaration d'intention |
| `/[lang]/inscription`, `/[lang]/connexion` | Compte investisseur (e-mail + mot de passe) |
| `/[lang]/espace`, `/[lang]/espace/profil` | Tableau de bord, intentions, questionnaire investisseur |
| `/auth/confirm` | Retour des liens envoyés par e-mail par Supabase |
| `/admin` | Back-office (réservé aux administrateurs, voir ci-dessous) |

## Back-office

- **Tableau de bord** : chiffres clés, profils à vérifier, dernières inscriptions.
- **Projets** : créer, modifier, publier (statut), supprimer un projet sans intention.
- **Investisseurs** : file des questionnaires à vérifier, fiche complète, validation ou refus avec note interne.
  Si un investisseur modifie son identité après une décision, son profil repasse en vérification.
- **Liste d'attente** : recherche, filtre, retrait d'une inscription, export CSV (compatible Excel).

Donner l'accès (la personne doit d'abord avoir créé un compte sur le site) :

```bash
npm run admin -- add prenom@exemple.com
npm run admin -- list
npm run admin -- remove prenom@exemple.com
```

Les droits sont vérifiés dans la base (RLS et fonctions `is_admin()`, `admin_investors()`,
`admin_review_kyc()`) : un non-administrateur reçoit une page 404 et ne peut rien lire ni modifier.

## Base de données

- Schéma : `supabase/migrations/` (les deux migrations sont déjà appliquées sur le projet Supabase).
- Projets d'exemple : `supabase/seed.sql`, marqués `is_demo`. Pour les retirer :
  `delete from public.projects where is_demo;`

Tables : `waitlist`, `investor_profiles` (créé automatiquement à l'inscription), `projects`,
`investment_intents`. Toutes sont protégées par RLS ; les droits par défaut de Supabase ont été retirés.

Les pages projets sont mises en cache : une modification faite depuis le back-office apparaît tout de suite,
une modification faite directement dans Supabase après quelques minutes.

## Configuration Supabase à faire

Dans le tableau de bord Supabase, **Authentication → URL Configuration** :

- Site URL : l'URL du site (`http://localhost:3000` en local, puis le domaine de production).
- Redirect URLs : ajouter `http://localhost:3000/**` et `https://<domaine>/**`.

Mettre aussi `NEXT_PUBLIC_SITE_URL` à jour dans `.env` en production.

L'envoi d'e-mails intégré à Supabase est limité à quelques messages par heure : configurer un SMTP
(Authentication → Emails → SMTP Settings) avant d'ouvrir les inscriptions au public.
