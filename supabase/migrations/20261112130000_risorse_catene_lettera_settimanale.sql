-- Linfa 0.2, fase 2 (docs/stanze-e-vita.md, sezioni 4 e 12).

-- Le risorse che l'albero raccoglie e consuma (legna, bacche, semi…), 0-9
-- ciascuna: si vedono nella scena come mucchietti. Non si comprano mai.
-- La memoria: catene aperte, tracce nella scena (braci, orto, vasetti),
-- le giornate a fasce recenti (anti-ripetizione) e quella di oggi.
-- Le scrive solo il motore (src/lib/albero/catene.ts), dal server.
alter table public.trees
  add column risorse jsonb not null default '{}'::jsonb,
  add column memoria jsonb not null default '{}'::jsonb;

-- Una lettera ogni 7 giorni vissuti per tutti i piani, nella stessa email
-- della cartolina della settimana (Federico, 12/11/2026). «mensile» e
-- «meta-mese» restano per le lettere già scritte.
alter table public.letters drop constraint if exists letters_kind_check;
alter table public.letters
  add constraint letters_kind_check
  check (kind in ('benvenuto', 'settimanale', 'mensile', 'meta-mese', 'momento', 'regalo'));

alter table public.tree_weeks
  add column letter_id uuid references public.letters (id) on delete set null;
