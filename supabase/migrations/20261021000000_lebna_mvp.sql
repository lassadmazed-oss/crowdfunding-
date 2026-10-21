-- Lebna MVP: waitlist, investor profiles, projects and non-binding investment intents.
-- No money moves through the platform until it is licensed (CMF / BCT): intents are declarations only.
--
-- Supabase's default privileges grant anon/authenticated full access to new tables and functions,
-- so every object below revokes them and grants back only what the app needs. RLS is the second layer.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.residency as enum ('resident', 'non_resident');
create type public.project_model as enum ('developer_financing', 'rental', 'rent_to_own', 'hospitality');
create type public.project_status as enum ('draft', 'coming_soon', 'open', 'funded', 'closed');
create type public.instrument as enum ('shares', 'sukuk', 'bonds', 'loan');
create type public.kyc_status as enum ('incomplete', 'pending_review', 'verified', 'rejected');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Waitlist: anyone can join, nobody can read it back through the API
-- ---------------------------------------------------------------------------
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  full_name text check (length(full_name) <= 120),
  country text not null default 'TN' check (country ~ '^[A-Z]{2}$'),
  residency public.residency not null,
  city text check (length(city) <= 80),
  ticket_range text check (ticket_range in ('lt_1k', '1k_5k', '5k_20k', 'gt_20k')),
  interests public.project_model[] not null default '{}',
  prefers_sukuk boolean not null default false,
  source text check (length(source) <= 80),
  created_at timestamptz not null default now()
);

create unique index waitlist_email_unique on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon, authenticated;

create policy "Anyone can join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Investor profiles: one per auth user, created by trigger on sign-up
-- ---------------------------------------------------------------------------
create table public.investor_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (length(full_name) <= 120),
  phone text check (length(phone) <= 30),
  country text not null default 'TN' check (country ~ '^[A-Z]{2}$'),
  residency public.residency,
  city text check (length(city) <= 80),
  birth_date date,
  profession text check (length(profession) <= 120),
  annual_income_range text check (annual_income_range in ('lt_20k', '20k_50k', '50k_100k', 'gt_100k')),
  investable_assets_range text check (investable_assets_range in ('lt_10k', '10k_50k', '50k_200k', 'gt_200k')),
  experience_level text check (experience_level in ('none', 'some', 'experienced')),
  prefers_sukuk boolean not null default false,
  risk_acknowledged_at timestamptz,
  kyc_status public.kyc_status not null default 'incomplete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investor_profiles enable row level security;
revoke all on public.investor_profiles from anon, authenticated;
grant select on public.investor_profiles to authenticated;
-- Investors edit their questionnaire; kyc_status is only moved by the trigger below or by an admin.
grant update (
  full_name, phone, country, residency, city, birth_date, profession,
  annual_income_range, investable_assets_range, experience_level, prefers_sukuk, risk_acknowledged_at
) on public.investor_profiles to authenticated;

create policy "Investors read their own profile"
  on public.investor_profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Investors update their own profile"
  on public.investor_profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create trigger investor_profiles_updated_at
  before update on public.investor_profiles
  for each row execute function public.set_updated_at();

-- Submitting a complete questionnaire puts the profile in the review queue.
create function public.submit_complete_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.kyc_status = 'incomplete'
     and new.full_name <> ''
     and new.phone is not null
     and new.residency is not null
     and new.birth_date is not null
     and new.birth_date <= (current_date - interval '18 years')
     and new.profession is not null
     and new.annual_income_range is not null
     and new.investable_assets_range is not null
     and new.experience_level is not null
     and new.risk_acknowledged_at is not null
  then
    new.kyc_status := 'pending_review';
  end if;
  return new;
end;
$$;

create trigger investor_profiles_submit
  before update on public.investor_profiles
  for each row execute function public.submit_complete_profile();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.investor_profiles (id, full_name, residency)
  values (
    new.id,
    left(coalesce(meta ->> 'full_name', ''), 120),
    case when meta ->> 'residency' in ('resident', 'non_resident')
         then (meta ->> 'residency')::public.residency end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Projects: public once out of draft, managed from the dashboard / service role
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  tagline text,
  city text not null,
  governorate text not null,
  model public.project_model not null,
  instrument public.instrument not null,
  status public.project_status not null default 'draft',
  target_amount numeric(14, 3) not null check (target_amount > 0),
  min_ticket numeric(14, 3) not null check (min_ticket > 0),
  target_return_pct numeric(5, 2) check (target_return_pct >= 0),
  duration_months integer check (duration_months > 0),
  developer_name text,
  description text not null default '',
  highlights text[] not null default '{}',
  risks text[] not null default '{}',
  is_demo boolean not null default false,
  opens_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_ticket <= target_amount)
);

alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;

create policy "Published projects are public"
  on public.projects for select
  to anon, authenticated
  using (status <> 'draft');

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Investment intents: non-binding, one per investor and project
-- ---------------------------------------------------------------------------
create table public.investment_intents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  investor_id uuid not null default auth.uid() references public.investor_profiles (id) on delete cascade,
  amount numeric(14, 3) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, investor_id)
);

create index investment_intents_investor_id on public.investment_intents (investor_id);

alter table public.investment_intents enable row level security;
revoke all on public.investment_intents from anon, authenticated;
grant select, insert, delete on public.investment_intents to authenticated;
grant update (amount) on public.investment_intents to authenticated;

-- An intent needs a submitted questionnaire and a project that is collecting interest.
create function public.can_declare_intent(p_project_id uuid, p_amount numeric)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
           select 1 from public.projects p
           where p.id = p_project_id
             and p.status in ('coming_soon', 'open')
             and p_amount between p.min_ticket and p.target_amount
         )
     and exists (
           select 1 from public.investor_profiles ip
           where ip.id = (select auth.uid())
             and ip.kyc_status in ('pending_review', 'verified')
         );
$$;

create policy "Investors read their own intents"
  on public.investment_intents for select
  to authenticated
  using (investor_id = (select auth.uid()));

create policy "Eligible investors declare intents"
  on public.investment_intents for insert
  to authenticated
  with check (investor_id = (select auth.uid()) and public.can_declare_intent(project_id, amount));

create policy "Investors change their own intents"
  on public.investment_intents for update
  to authenticated
  using (investor_id = (select auth.uid()))
  with check (investor_id = (select auth.uid()) and public.can_declare_intent(project_id, amount));

create policy "Investors withdraw their own intents"
  on public.investment_intents for delete
  to authenticated
  using (investor_id = (select auth.uid()));

create trigger investment_intents_updated_at
  before update on public.investment_intents
  for each row execute function public.set_updated_at();

-- Public social proof: totals per project, never individual intents.
create function public.project_interest()
returns table (project_id uuid, investor_count bigint, total_amount numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select i.project_id, count(*), sum(i.amount)
  from public.investment_intents i
  join public.projects p on p.id = i.project_id
  where p.status <> 'draft'
  group by i.project_id;
$$;

-- ---------------------------------------------------------------------------
-- Function privileges
-- ---------------------------------------------------------------------------
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.submit_complete_profile() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.can_declare_intent(uuid, numeric) from public, anon;
grant execute on function public.can_declare_intent(uuid, numeric) to authenticated;
revoke execute on function public.project_interest() from public;
grant execute on function public.project_interest() to anon, authenticated;
