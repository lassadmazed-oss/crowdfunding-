-- Demo projects so the pages have content before real partners sign.
-- Every row is flagged is_demo = true and shown with an "Exemple" badge; figures are illustrative.
-- Remove with: delete from public.projects where is_demo;

insert into public.projects (
  slug, title, tagline, city, governorate, model, instrument, status,
  target_amount, min_ticket, target_return_pct, duration_months, developer_name,
  description, highlights, risks, is_demo, opens_on
) values
(
  'residence-yasmine-ennasr',
  'Résidence Yasmine',
  'Financer l''achèvement de 24 appartements à Ennasr',
  'Ennasr', 'Ariana', 'developer_financing', 'bonds', 'open',
  600000, 500, 11.00, 18, 'Promoteur partenaire (exemple)',
  'Le gros œuvre est terminé et 60 % des lots sont déjà réservés. Les fonds complètent les fonds propres exigés par la banque pour financer les finitions. Les investisseurs sont remboursés à la vente des appartements.',
  array['Gros œuvre terminé', '60 % des lots réservés', 'Garantie hypothécaire de premier rang (prévue)'],
  array['Retard de chantier ou de ventes', 'Défaillance du promoteur', 'Capital non garanti, pas de revente avant l''échéance'],
  true, null
),
(
  'dar-diaspora-sahloul',
  'Dar Diaspora — Sahloul',
  '6 appartements meublés loués près des universités de Sousse',
  'Sousse', 'Sousse', 'rental', 'shares', 'coming_soon',
  900000, 1000, 8.50, 60, 'Société de projet Lebna Sahloul (exemple)',
  'Une société de projet achète six appartements et les loue à des étudiants et jeunes actifs. Les loyers nets sont distribués chaque année ; les appartements sont revendus à l''échéance.',
  array['Demande locative étudiante forte', 'Gestion locative déléguée', 'Accessible aux Tunisiens résidents à l''étranger'],
  array['Vacance locative', 'Baisse des prix à la revente', 'Risque de change pour les investisseurs non-résidents'],
  true, date '2027-01-15'
),
(
  'sakan-step-sfax',
  'Sakan Step — Sfax El Jadida',
  'Trois familles deviennent propriétaires pas à pas',
  'Sfax', 'Sfax', 'rent_to_own', 'sukuk', 'coming_soon',
  450000, 500, 7.00, 120, 'Société de projet Lebna Sfax (exemple)',
  'La société achète trois appartements. Chaque famille paie un loyer et rachète des parts chaque mois jusqu''à devenir pleinement propriétaire. Structure en sukuk, conforme à la finance islamique.',
  array['Accès à la propriété sans crédit bancaire', 'Revenus réguliers', 'Structure sukuk'],
  array['Défaut de paiement d''une famille', 'Cadre juridique de la location-accession à valider', 'Durée longue (10 ans)'],
  true, date '2027-03-01'
),
(
  'dar-medina-tunis',
  'Dar Lebna — Médina de Tunis',
  'Restaurer une maison traditionnelle en maison d''hôtes',
  'Tunis', 'Tunis', 'hospitality', 'shares', 'coming_soon',
  750000, 1000, 9.00, 72, 'Société de projet Dar Lebna (exemple)',
  'Restauration d''une dar du XIXe siècle en maison d''hôtes de 8 chambres, exploitée par un gestionnaire spécialisé. Les investisseurs perçoivent une part du résultat d''exploitation.',
  array['Patrimoine architectural', 'Tourisme culturel en croissance', 'Exploitant expérimenté'],
  array['Saisonnalité du tourisme', 'Dépassement du budget de restauration', 'Autorisations patrimoniales'],
  true, date '2027-04-01'
);
