-- Le aggiunte ai piani approvate da Federico l'11/11/2026: il buongiorno e la
-- cartolina della settimana (tutti i piani), la lettera di metà mese (Premium:
-- una lettera ogni 15 giorni), la collezione di trofei, oggetti e stagioni.

-- Il buongiorno: ogni mattina una domanda breve con 2-3 risposte da un tocco.
-- La risposta è un consiglio per la giornata day_number (la prossima da vivere):
-- il motore la passa all'AI, che poi decide da sola.
create table public.morning_questions (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  day_number integer not null,
  question text not null check (char_length(question) between 1 and 200),
  options jsonb not null,
  answer text check (char_length(answer) <= 80),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tree_id, day_number)
);

create index morning_questions_tree_idx on public.morning_questions (tree_id, day_number desc);

-- Le settimane: ogni 7 giorni vissuti una nota breve per email, con la scena
-- del momento migliore della settimana disegnata come la cartolina del mese.
create table public.tree_weeks (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  number integer not null check (number >= 1),
  first_day integer not null,
  last_day integer not null,
  best_day integer not null,
  subject text not null,
  note text not null,
  caption text not null,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tree_id, number)
);

create index tree_weeks_tree_idx on public.tree_weeks (tree_id, number desc);

-- La collezione: trofei, oggetti, vestiti e stagioni, sbloccati vivendo e mai
-- comprando. Le regole sono nel codice (src/lib/albero/collezione.ts), non
-- le decide l'AI. mentioned: l'albero ne ha già parlato nel diario.
create table public.unlocks (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  item text not null,
  day_number integer not null,
  mentioned boolean not null default false,
  unlocked_at timestamptz not null default now(),
  unique (tree_id, item)
);

create index unlocks_tree_idx on public.unlocks (tree_id, unlocked_at);

-- La lettera di metà mese, solo per il Premium.
alter table public.letters drop constraint if exists letters_kind_check;
alter table public.letters
  add constraint letters_kind_check check (kind in ('benvenuto', 'mensile', 'meta-mese', 'momento', 'regalo'));

-- Sicurezza: ognuno legge solo le righe del proprio albero; scrive solo il server.
alter table public.morning_questions enable row level security;
alter table public.tree_weeks enable row level security;
alter table public.unlocks enable row level security;

create policy "Il proprietario legge il buongiorno"
  on public.morning_questions for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

create policy "Il proprietario legge le settimane"
  on public.tree_weeks for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

create policy "Il proprietario legge la collezione"
  on public.unlocks for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

revoke insert, update, delete on public.morning_questions, public.tree_weeks, public.unlocks from anon, authenticated;
