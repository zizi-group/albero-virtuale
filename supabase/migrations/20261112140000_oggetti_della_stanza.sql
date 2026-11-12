-- Fase 3 della 0.2 (docs/stanze-e-vita.md, sezioni 9.3, 10, 11, 14): il
-- catalogo degli oggetti, il momento dello sblocco e gli oggetti nella stanza.
-- Le regole del catalogo stanno nel codice (src/lib/albero/oggetti.ts).

-- Lo sblocco si vede: il pacco aspetta nella stanza finché la persona non lo
-- apre (opened_at), e nel catalogo l'oggetto è «Nuovo» finché non lo guarda
-- (seen_at). Quelli sbloccati prima di oggi contano come già aperti e visti.
alter table public.unlocks
  add column opened_at timestamptz,
  add column seen_at timestamptz;

update public.unlocks set opened_at = unlocked_at, seen_at = unlocked_at;

-- Gli oggetti nella stanza. room_id resta facoltativo: la tabella rooms arriva
-- con la fase 5, che aggiunge la chiave esterna. place è un posto della stanza
-- (sfondo-1, prato-d1, davanti-2, rami-1…) oppure null: in deposito, nella
-- collezione ma non in vista. Pino sistema da solo le cose nuove; la persona
-- le sposta o le mette via.
create table public.room_items (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees (id) on delete cascade,
  room_id uuid,
  item text not null,
  place text check (place ~ '^(sfondo|prato|davanti|rami)-[a-z0-9]+$'),
  source text not null check (source in ('decisione', 'regalo', 'costruzione')),
  is_new boolean not null default true,
  placed_by text not null default 'albero' check (placed_by in ('albero', 'persona')),
  created_at timestamptz not null default now(),
  moved_at timestamptz not null default now(),
  unique (tree_id, item)
);

create index room_items_tree_idx on public.room_items (tree_id, created_at);
-- Un posto ospita una cosa sola (per albero, finché le stanze non ci sono).
create unique index room_items_posto_idx on public.room_items (tree_id, place) where place is not null;

alter table public.room_items enable row level security;

create policy "Il proprietario legge la sua stanza"
  on public.room_items for select to authenticated
  using (exists (
    select 1 from public.trees t
    where t.id = tree_id and t.owner_id = (select auth.uid())
  ));

revoke insert, update, delete on public.room_items from anon, authenticated;
