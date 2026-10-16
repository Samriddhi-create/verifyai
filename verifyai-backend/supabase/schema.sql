-- VerifyAI database schema.
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- Supabase's built-in `auth.users` table is the source of truth for users;
-- we only store the verification history here.
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  original_text text not null,
  source_url text,
  claims jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists verifications_user_id_created_at_idx
  on public.verifications (user_id, created_at desc);

alter table public.verifications enable row level security;

create policy "Users can read their own verifications"
  on public.verifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own verifications"
  on public.verifications for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own verifications"
  on public.verifications for delete
  using (auth.uid() = user_id);
