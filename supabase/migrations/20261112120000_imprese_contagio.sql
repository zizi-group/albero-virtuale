-- Linfa 0.2, fase 4 (docs/stanze-e-vita.md, sezioni 6, 7 e 14):
-- carisma e influenzabilità degli alberi, imprese e sostenitori.
-- Le regole stanno nel codice (src/lib/albero/imprese.ts e contagio.ts);
-- qui si conserva solo lo stato. Scrive solo il server.

-- Carisma e influenzabilità: fissi alla nascita, 5-95. Gli alberi già nati
-- li ricevono calcolati dai tratti, con la stessa formula di
-- carattereDaiTratti() in src/lib/albero/strade.ts (senza la parte di caso).
alter table public.trees
  add column carisma smallint,
  add column influenzabilita smallint;

update public.trees set
  carisma = least(95, greatest(5, round((
    coalesce((traits ->> 'ambizione')::numeric, 50)
    + coalesce((traits ->> 'socievolezza')::numeric, 50)
    + coalesce((traits ->> 'energia')::numeric, 50)) / 3))),
  influenzabilita = least(95, greatest(5, round((
    coalesce((traits ->> 'socievolezza')::numeric, 50)
    + coalesce((traits ->> 'pigrizia')::numeric, 50)
    + (100 - coalesce((traits ->> 'ambizione')::numeric, 50))
    + (100 - coalesce((traits ->> 'furbizia')::numeric, 50))) / 4)));

-- Il default serve solo a chi inserisce un albero senza passarli:
-- piantaAlbero() li calcola sempre alla nascita.
alter table public.trees
  alter column carisma set default 50,
  alter column carisma set not null,
  alter column influenzabilita set default 50,
  alter column influenzabilita set not null,
  add constraint trees_carisma_check check (carisma between 5 and 95),
  add constraint trees_influenzabilita_check check (influenzabilita between 5 and 95);

-- Le imprese: una per strada nella stanza (la principale, coi livelli dei
-- mestieri) e quelle libere aperte dalle catene. room_id resta senza chiave
-- esterna finché la fase 5 non porta la tabella rooms.
create table public.ventures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  room_id uuid,
  -- Il tipo dell'impresa: «banda-del-bosco», «orto-comunitario»… (TIPI_IMPRESA).
  kind text not null,
  -- La strada dell'impresa principale; null per le imprese libere.
  path text,
  leader_id uuid not null references public.trees (id) on delete cascade,
  -- Passi di cantiere fatti in tutto: il livello si calcola da qui.
  steps integer not null default 0 check (steps >= 0),
  -- Lavoro accumulato verso il prossimo passo (0-1).
  work numeric(4, 2) not null default 0 check (work >= 0 and work < 2),
  founded_day integer not null,
  founded_at timestamptz not null default now(),
  closed_at timestamptz
);

create index ventures_owner_idx on public.ventures (owner_id);
create index ventures_room_idx on public.ventures (room_id) where closed_at is null;
create unique index ventures_leader_kind_idx on public.ventures (leader_id, kind) where closed_at is null;

-- I sostenitori: ogni albero sostiene al massimo un'impresa alla volta.
create table public.venture_members (
  venture_id uuid not null references public.ventures (id) on delete cascade,
  tree_id uuid not null references public.trees (id) on delete cascade,
  -- Il ruolo dalla tabella della sezione 6: «palo», «socio», «allievo»…
  role text not null,
  since_day integer not null,
  joined_at timestamptz not null default now(),
  primary key (venture_id, tree_id),
  unique (tree_id)
);

alter table public.ventures enable row level security;
alter table public.venture_members enable row level security;

create policy "Il proprietario legge le sue imprese"
  on public.ventures for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Il proprietario legge i sostenitori"
  on public.venture_members for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

revoke insert, update, delete on public.ventures, public.venture_members from anon, authenticated;
