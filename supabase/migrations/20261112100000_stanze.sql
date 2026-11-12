-- Linfa 0.2, fase 5: più alberi per persona e le stanze (docs/stanze-e-vita.md, sezione 2).
--
-- accounts: quello che vale per la persona e non per il singolo albero:
--   il pacchetto nuovo (Albero, Famiglia, Foresta: quanti alberi e quante
--   stanze di partenza), i rinnovi annuali e gli alberi piantati in tutto.
-- rooms: le stanze sbloccate, da 1 a 10. Una stanza sbloccata resta aperta.
-- trees.room_id: dove abita l'albero.
--
-- Le regole (quante stanze, quanti alberi, capienza) stanno nel codice:
-- src/lib/stanze.ts. Qui solo i limiti che non cambiano mai (da 1 a 10).

create table public.accounts (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  package text not null default 'albero' check (package in ('albero', 'famiglia', 'foresta')),
  renewals integer not null default 0 check (renewals >= 0),
  -- Alberi digitali avuti in tutto: non scende se un albero un giorno va via.
  trees_planted integer not null default 0 check (trees_planted >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  number smallint not null check (number between 1 and 10),
  name text not null check (char_length(name) between 1 and 40),
  unlocked_at timestamptz not null default now(),
  -- Il momento di festa è stato visto: finché è null il giardino lo mostra.
  celebrated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_id, number)
);

create index rooms_owner_idx on public.rooms (owner_id, number);

alter table public.trees
  add column room_id uuid references public.rooms (id) on delete set null;

create index trees_room_idx on public.trees (room_id);

-- Chi c'è già: un conto con gli alberi che ha, la prima stanza (già
-- festeggiata: c'era da sempre) e i suoi alberi dentro.
insert into public.accounts (owner_id, trees_planted)
select owner_id, count(*) from public.trees group by owner_id
on conflict (owner_id) do nothing;

insert into public.rooms (owner_id, number, name, unlocked_at, celebrated_at)
select owner_id, 1, 'Il giardino', min(planted_at), min(planted_at) from public.trees group by owner_id
on conflict (owner_id, number) do nothing;

update public.trees t
set room_id = r.id
from public.rooms r
where r.owner_id = t.owner_id and r.number = 1 and t.room_id is null;

-- Sicurezza come per gli alberi: ognuno legge solo le sue righe, scrive solo il server.
alter table public.accounts enable row level security;
alter table public.rooms enable row level security;

create policy "Il proprietario legge il suo conto"
  on public.accounts for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Il proprietario legge le sue stanze"
  on public.rooms for select to authenticated
  using (owner_id = (select auth.uid()));

revoke insert, update, delete on public.accounts, public.rooms from anon, authenticated;
