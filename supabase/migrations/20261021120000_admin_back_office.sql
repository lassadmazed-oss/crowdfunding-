-- Back-office: admin accounts, admin-only RLS policies and the KYC review workflow.
-- Admins are rows in public.admins; grant one with `npm run admin -- add <email>`.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- No policies: the table is only read through is_admin() and managed with the service role.
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Projects: admins see drafts and manage the catalogue
-- ---------------------------------------------------------------------------
grant insert, update, delete on public.projects to authenticated;

create policy "Admins read all projects"
  on public.projects for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins create projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Waitlist: admins read it and remove entries (spam, deletion requests)
-- ---------------------------------------------------------------------------
grant select, delete on public.waitlist to authenticated;

create policy "Admins read the waitlist"
  on public.waitlist for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins delete waitlist entries"
  on public.waitlist for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Investors: admins read every profile and intent; KYC changes go through admin_review_kyc()
-- ---------------------------------------------------------------------------
alter table public.investor_profiles
  add column kyc_note text check (length(kyc_note) <= 500),
  add column kyc_reviewed_at timestamptz,
  add column kyc_reviewed_by uuid references auth.users (id) on delete set null;

create policy "Admins read all profiles"
  on public.investor_profiles for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins read all intents"
  on public.investment_intents for select
  to authenticated
  using ((select public.is_admin()));

-- Editing identity after a decision sends the profile back to review.
create or replace function public.submit_complete_profile()
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
  elsif old.kyc_status in ('verified', 'rejected')
     and new.kyc_status = old.kyc_status
     and (new.full_name, new.phone, new.birth_date, new.residency, new.country)
         is distinct from (old.full_name, old.phone, old.birth_date, old.residency, old.country)
  then
    new.kyc_status := 'pending_review';
  end if;
  return new;
end;
$$;

-- Investor list for the back-office, with the e-mail from auth.users. Empty for non-admins.
create function public.admin_investors()
returns table (
  id uuid,
  email text,
  full_name text,
  phone text,
  country text,
  residency public.residency,
  city text,
  birth_date date,
  profession text,
  annual_income_range text,
  investable_assets_range text,
  experience_level text,
  prefers_sukuk boolean,
  risk_acknowledged_at timestamptz,
  kyc_status public.kyc_status,
  kyc_note text,
  kyc_reviewed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  intents_count bigint,
  intents_total numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id, u.email::text, p.full_name, p.phone, p.country, p.residency, p.city, p.birth_date, p.profession,
    p.annual_income_range, p.investable_assets_range, p.experience_level, p.prefers_sukuk,
    p.risk_acknowledged_at, p.kyc_status, p.kyc_note, p.kyc_reviewed_at, p.created_at, p.updated_at,
    coalesce(i.intents_count, 0), coalesce(i.intents_total, 0)
  from public.investor_profiles p
  join auth.users u on u.id = p.id
  left join (
    select investor_id, count(*) as intents_count, sum(amount) as intents_total
    from public.investment_intents
    group by investor_id
  ) i on i.investor_id = p.id
  where (select public.is_admin())
  order by p.created_at desc;
$$;

create or replace function public.admin_review_kyc(p_investor_id uuid, p_status public.kyc_status, p_note text default null)
returns public.kyc_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile public.investor_profiles;
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if p_status = 'incomplete' then
    raise exception 'A review can only set pending_review, verified or rejected' using errcode = '22023';
  end if;

  select * into profile from public.investor_profiles where id = p_investor_id for update;
  if not found then
    raise exception 'Investor not found' using errcode = 'P0002';
  end if;
  -- Only a finished questionnaire can be validated or queued; an unfinished one can still be rejected (spam).
  if p_status <> 'rejected' and (
       profile.full_name = '' or profile.phone is null or profile.residency is null or profile.birth_date is null
       or profile.profession is null or profile.annual_income_range is null
       or profile.investable_assets_range is null or profile.experience_level is null
       or profile.risk_acknowledged_at is null
     ) then
    raise exception 'The questionnaire is not complete' using errcode = '22023';
  end if;

  update public.investor_profiles
  set kyc_status = p_status,
      kyc_note = nullif(left(btrim(coalesce(p_note, '')), 500), ''),
      kyc_reviewed_at = now(),
      kyc_reviewed_by = (select auth.uid())
  where id = p_investor_id;

  return p_status;
end;
$$;

revoke execute on function public.admin_investors() from public, anon;
grant execute on function public.admin_investors() to authenticated;
revoke execute on function public.admin_review_kyc(uuid, public.kyc_status, text) from public, anon;
grant execute on function public.admin_review_kyc(uuid, public.kyc_status, text) to authenticated;
