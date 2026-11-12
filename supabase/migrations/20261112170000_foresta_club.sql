-- La foresta del club (fase 7 di docs/stanze-e-vita.md, sezioni 1.3 e 14).
-- Nel club compare solo chi ha detto sì: consenso esplicito alla semina,
-- revocabile, con le date. Si vede il nome dell'albero e al massimo il nome di
-- battesimo o le iniziali della persona, se li ha scelti.

-- Il consenso: una riga per persona, vale per tutti i suoi alberi.
-- Attivo quando revoked_at è vuoto. Ridarlo azzera revoked_at e rinnova granted_at.
create table public.club_consent (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  -- Che cosa si vede della persona accanto al nome dell'albero.
  owner_label text not null default 'nessuno' check (owner_label in ('nessuno', 'iniziali', 'nome')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Gli alberi d'esempio della demo locale: non sono persone né alberi veri.
-- Li crea e li toglie solo lo strumento della demo in /club (chiave segreta).
-- Nella vista escono con esempio = true e la pagina li dichiara come esempi.
create table public.club_examples (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  day_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.club_consent enable row level security;
alter table public.club_examples enable row level security;

create policy "La persona legge il suo consenso"
  on public.club_consent for select to authenticated
  using (owner_id = (select auth.uid()));

-- Nessuna policy su club_examples: si legge solo dalla vista.
revoke insert, update, delete on public.club_consent, public.club_examples from anon, authenticated;
revoke select on public.club_examples from anon, authenticated;

-- Da un testo a un numero in [0, 1], sempre lo stesso per lo stesso testo.
create function public.club_frazione(testo text) returns double precision
language sql immutable set search_path = ''
as $$
  select (('x' || substr(md5(testo), 1, 8))::bit(32)::bigint)::double precision / 4294967295.0
$$;

-- Moltiplicazione a 32 bit come Math.imul (a, b in [0, 2^32)), senza traboccare.
create function public.club_imul(a bigint, b bigint) returns bigint
language sql immutable set search_path = ''
as $$
  select ((a * (b & 65535)) + (((a * (b >> 16)) & 65535) << 16)) & 4294967295
$$;

-- Lo stesso numero in [0, 1) di modelloDalSeme(id) in src/lib/giardino3d/modelli.js:
-- FNV-1a di 'modello:<id>' (casuale.js, hash) e il primo passo di mulberry32
-- (generatore). La pagina sceglie MODELLI[floor(r × quanti)]: il tuo albero ha
-- la stessa specie nel club e nella tua foresta, senza mostrare l'id.
create function public.club_modello(testo text) returns double precision
language plpgsql immutable set search_path = ''
as $$
declare
  m constant bigint := 4294967295;
  h bigint := 2166136261;
  s bigint;
  t bigint;
  i integer;
begin
  for i in 1 .. length(testo) loop
    h := ((h # ascii(substr(testo, i, 1))) * 16777619) & m;
  end loop;
  s := (h + 1831565813) & m;
  t := public.club_imul(s # (s >> 15), 1 | s);
  t := ((t + public.club_imul(t # (t >> 7), 61 | t)) & m) # t;
  return ((t # (t >> 14)) & m)::double precision / 4294967296.0;
end
$$;

-- La vista pubblica: solo i campi che si possono mostrare agli altri membri.
-- Gira con i diritti del proprietario (non dell'utente) per leggere gli alberi
-- di chi ha dato il consenso; non espone id, proprietario, città né date.
--   seme       hash dell'id: varia grandezza e rotazione, non permette di risalire all'albero
--   modello    numero in [0, 1) che sceglie il modello, come modelloDalSeme(id)
--   nome       nome dell'albero
--   persona    nome di battesimo o iniziali, solo se la persona li ha scelti
--   crescita   0..1 (giorni vissuti fino a 90, arrotondati): quanto è grande
--   x, z       posizione stabile nel cerchio di raggio 1, calcolata dall'id;
--              la pagina la scala con il numero di alberi
--   esempio    true per gli alberi d'esempio della demo
create view public.club_forest with (security_invoker = false) as
select
  md5('linfa-club:' || t.id::text) as seme,
  public.club_modello('modello:' || t.id::text) as modello,
  t.name as nome,
  case c.owner_label
    when 'nome' then nullif(split_part(btrim(coalesce(t.owner_name, '')), ' ', 1), '')
    when 'iniziali' then (
      select string_agg(upper(left(p, 1)) || '.', ' ')
      from regexp_split_to_table(btrim(coalesce(t.owner_name, '')), '\s+') as p
      where p <> ''
    )
  end as persona,
  round(least(t.day_count, 90) / 90.0, 1)::double precision as crescita,
  sqrt(public.club_frazione('r:' || t.id::text)) * cos(2 * pi() * public.club_frazione('a:' || t.id::text)) as x,
  sqrt(public.club_frazione('r:' || t.id::text)) * sin(2 * pi() * public.club_frazione('a:' || t.id::text)) as z,
  false as esempio
from public.trees t
join public.club_consent c on c.owner_id = t.owner_id and c.revoked_at is null
union all
select
  md5('linfa-club:' || e.id::text),
  public.club_modello('modello:' || e.id::text),
  e.name,
  null,
  round(least(e.day_count, 90) / 90.0, 1)::double precision,
  sqrt(public.club_frazione('r:' || e.id::text)) * cos(2 * pi() * public.club_frazione('a:' || e.id::text)),
  sqrt(public.club_frazione('r:' || e.id::text)) * sin(2 * pi() * public.club_frazione('a:' || e.id::text)),
  true
from public.club_examples e;

revoke all on public.club_forest from anon, public;
grant select on public.club_forest to authenticated;

-- I contatori veri: alberi veri piantati nel club (tutti), quelli piantati
-- questo mese (ora italiana), quanti compaiono nella foresta, quanti esempi.
create function public.club_contatori()
returns table (alberi bigint, questo_mese bigint, in_foresta bigint, esempi bigint)
language sql stable security definer set search_path = ''
as $$
  select
    (select count(*) from public.trees),
    (select count(*) from public.trees
      where planted_at >= (date_trunc('month', now() at time zone 'Europe/Rome') at time zone 'Europe/Rome')),
    (select count(*) from public.trees t
      join public.club_consent c on c.owner_id = t.owner_id and c.revoked_at is null),
    (select count(*) from public.club_examples)
$$;

revoke execute on function public.club_contatori() from public, anon;
grant execute on function public.club_contatori() to authenticated;
