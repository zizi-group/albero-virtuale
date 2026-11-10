-- Gli extra mensili del Premium (docs/modello-di-business.md, «I tre pacchetti»):
-- un regalo all'albero incluso ogni mese, il riepilogo illustrato del mese e la
-- cartolina digitale. Nessun pagamento: il pacchetto si sceglie e basta (demo).

-- I mesi dell'albero. Il mese 1 parte alla semina (giorno 0); un mese nuovo si
-- apre ogni 30 giorni vissuti (motore notturno) o con lo strumento della demo.
-- Il mese contiene le pagine di diario da first_day fino al giorno prima
-- dell'inizio del mese successivo.
create table public.tree_months (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  number integer not null check (number >= 1),
  first_day integer not null default 0,
  started_at timestamptz not null default now(),
  closed_at timestamptz,
  -- Scelto alla chiusura (Premium): titolo del mese, momento più bello, frase migliore.
  recap jsonb,
  unique (tree_id, number)
);

create index tree_months_tree_idx on public.tree_months (tree_id, number desc);

-- I regali all'albero. Uno al mese è incluso nel Premium (included = true);
-- in futuro se ne potranno comprare altri (included = false).
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  month_number integer not null,
  gift text not null,
  included boolean not null default true,
  -- Lo decide l'albero, nella lettera di ringraziamento.
  use text not null check (use in ('lo-usa', 'a-modo-suo', 'lo-conserva', 'lo-presta')),
  how text not null,
  letter_id uuid references public.letters (id) on delete set null,
  created_at timestamptz not null default now()
);

create index gifts_tree_idx on public.gifts (tree_id, created_at);
create unique index gifts_incluso_uno_al_mese on public.gifts (tree_id, month_number) where included;

-- La lettera di ringraziamento per il regalo.
alter table public.letters drop constraint if exists letters_kind_check;
alter table public.letters
  add constraint letters_kind_check check (kind in ('benvenuto', 'mensile', 'momento', 'regalo'));

-- Gli alberi già piantati partono dal mese 1.
insert into public.tree_months (tree_id, number, first_day, started_at)
select id, 1, 0, planted_at from public.trees
on conflict (tree_id, number) do nothing;

-- Sicurezza: ognuno legge solo le righe del proprio albero; scrive solo il server.
alter table public.tree_months enable row level security;
alter table public.gifts enable row level security;

create policy "Il proprietario legge i mesi"
  on public.tree_months for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

create policy "Il proprietario legge i regali"
  on public.gifts for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

revoke insert, update, delete on public.tree_months, public.gifts from anon, authenticated;
