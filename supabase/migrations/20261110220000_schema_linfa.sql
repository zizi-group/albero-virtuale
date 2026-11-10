-- Linfa: schema iniziale.
-- Ogni persona pianta un albero; il motore notturno scrive il diario,
-- le lettere e le risposte. Le scritture passano dal server (service role);
-- la persona legge solo le righe del proprio albero.

create table public.trees (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  city text not null,
  latitude double precision not null,
  longitude double precision not null,
  timezone text not null default 'Europe/Rome',
  plan text not null default 'mensile' check (plan in ('mensile', 'annuale', 'regalo')),
  planted_at timestamptz not null default now(),
  day_count integer not null default 0,
  -- Tratti 0-100: casuali alla nascita, cambiano piano piano.
  traits jsonb not null,
  -- Punteggi verso le strade possibili (filosofo, imprenditore, ...).
  path_scores jsonb not null default '{}'::jsonb,
  -- La strada diventa visibile solo quando l'albero l'ha presa davvero.
  path text,
  mood text not null default 'curioso',
  today_action text not null default 'guardare-cielo',
  today_caption text,
  -- I fatti importanti, per dare memoria alle lettere.
  biography jsonb not null default '[]'::jsonb,
  last_weather jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trees_owner_idx on public.trees (owner_id);

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  day_number integer not null,
  lived_on date not null,
  weather jsonb,
  action text not null,
  mood text,
  body text not null,
  milestone boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tree_id, day_number)
);

create index diary_tree_day_idx on public.diary_entries (tree_id, day_number desc);

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  kind text not null check (kind in ('benvenuto', 'mensile', 'momento')),
  day_number integer not null default 0,
  subject text not null,
  body text not null,
  emailed_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index letters_tree_idx on public.letters (tree_id, created_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  author text not null check (author in ('persona', 'albero')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_tree_idx on public.messages (tree_id, created_at);

-- Sicurezza: ognuno vede solo il proprio albero.
alter table public.trees enable row level security;
alter table public.diary_entries enable row level security;
alter table public.letters enable row level security;
alter table public.messages enable row level security;

create policy "Il proprietario legge il suo albero"
  on public.trees for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Il proprietario legge il diario"
  on public.diary_entries for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

create policy "Il proprietario legge le lettere"
  on public.letters for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

create policy "Il proprietario legge i messaggi"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

-- Le scritture le fa solo il server con la service role.
revoke insert, update, delete on public.trees, public.diary_entries, public.letters, public.messages
  from anon, authenticated;
