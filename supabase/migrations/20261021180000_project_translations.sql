-- Project texts in other languages. The base columns hold the French text; this column holds
-- { "ar": { "title", "tagline", "description", "highlights": [], "risks": [] }, "en": {...}, ... }.
-- Missing languages or fields fall back to the French text on the site.

alter table public.projects
  add column translations jsonb not null default '{}'::jsonb
  check (jsonb_typeof(translations) = 'object');
