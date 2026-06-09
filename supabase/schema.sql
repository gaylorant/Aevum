-- Memory Capsules: key insight points only. No chat logs, names, or emails.
create table if not exists public.memory_capsules (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  insight text not null,
  created_at timestamptz not null default now()
);

create index if not exists memory_capsules_session_id_idx
  on public.memory_capsules (session_id);

alter table public.memory_capsules enable row level security;

-- Anonymous inserts only; no reads required for the chat flow yet.
create policy "Allow anonymous insert"
  on public.memory_capsules
  for insert
  to anon
  with check (true);
