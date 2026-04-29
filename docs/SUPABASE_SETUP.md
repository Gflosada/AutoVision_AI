# Supabase Setup

## Environment

Frontend variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=
```

Do not put service role keys in Vite.

## Auth Redirect URLs

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL: `http://localhost:5173`
- Redirect URLs:
  - `http://localhost:5173/auth/callback`
  - your production callback URL, for example `https://your-domain.com/auth/callback`

The app sends signup confirmation emails to `/auth/callback`, where it exchanges the confirmation code for a browser session.

## Storage Buckets

- `vehicle-originals`: private uploads for source vehicle photos
- `vehicle-generations`: private or signed-url outputs for generated renders
- `shop-assets`: shop logos and branding files

## SQL Schema

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  subscription_plan text not null default 'free',
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table public.vehicle_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_year text not null,
  trim text,
  body_type text,
  current_color text,
  original_image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customization_generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.vehicle_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  ai_prompt text not null,
  customization_types text[] not null default '{}',
  style text,
  finish text,
  generated_image_url text,
  original_image_url text,
  is_saved boolean not null default false,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan text not null default 'free',
  monthly_limit int not null default 3,
  monthly_used int not null default 0,
  reset_date timestamptz not null
);

create table public.shop_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  business_name text not null,
  logo_url text,
  website text,
  contact_email text not null,
  phone text,
  location text,
  created_at timestamptz not null default now()
);
```

If your `customization_generations` table already exists, add the saved flag with:

```sql
alter table public.customization_generations
add column if not exists is_saved boolean not null default false;
```

## Auth Profile Trigger

If email confirmation is enabled, the browser may not have an authenticated session immediately after signup. Create profiles from a database trigger so profile rows are created safely when Supabase creates the auth user.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.usage_limits (user_id, plan, monthly_limit, monthly_used, reset_date)
  values (
    new.id,
    'free',
    3,
    0,
    date_trunc('month', now()) + interval '1 month'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

## RLS Policies

```sql
alter table public.profiles enable row level security;
alter table public.vehicle_projects enable row level security;
alter table public.customization_generations enable row level security;
alter table public.usage_limits enable row level security;
alter table public.shop_profiles enable row level security;

create policy "profiles own rows" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "projects own rows" on public.vehicle_projects
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "generations own rows" on public.customization_generations
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usage own rows" on public.usage_limits
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "shops own rows" on public.shop_profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

If you already created policies while testing, use this idempotent version to reset the project policies:

```sql
drop policy if exists "projects own rows" on public.vehicle_projects;
drop policy if exists "projects read own rows" on public.vehicle_projects;
drop policy if exists "projects insert own rows" on public.vehicle_projects;
drop policy if exists "projects update own rows" on public.vehicle_projects;
drop policy if exists "projects delete own rows" on public.vehicle_projects;

create policy "projects read own rows" on public.vehicle_projects
for select to authenticated
using (auth.uid() = user_id);

create policy "projects insert own rows" on public.vehicle_projects
for insert to authenticated
with check (auth.uid() = user_id);

create policy "projects update own rows" on public.vehicle_projects
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "projects delete own rows" on public.vehicle_projects
for delete to authenticated
using (auth.uid() = user_id);
```

## Storage RLS Policies

If you keep buckets private, add Storage policies too. Without these, uploads can fail with `new row violates row-level security policy`.

```sql
create policy "vehicle originals owner upload" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'vehicle-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "vehicle originals owner read" on storage.objects
for select to authenticated
using (
  bucket_id = 'vehicle-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "vehicle originals owner update" on storage.objects
for update to authenticated
using (
  bucket_id = 'vehicle-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'vehicle-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "vehicle generations owner read" on storage.objects
for select to authenticated
using (
  bucket_id = 'vehicle-generations'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

## Edge Functions

Use Edge Functions for image generation, Stripe Checkout session creation, webhooks, and privileged database updates. The frontend should call only public anon-safe endpoints.

Deploy the included AI generation function:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1.5
supabase functions deploy generate-vehicle-design
```

Then set `VITE_AI_GENERATION_FUNCTION_URL` in `.env.local` to:

```bash
https://YOUR_PROJECT_REF.functions.supabase.co/generate-vehicle-design
```
