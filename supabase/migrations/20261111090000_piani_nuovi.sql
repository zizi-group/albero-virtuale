-- I piani del 10/11/2026 (docs/modello-di-business.md, «I tre pacchetti»):
-- Albero (solo annuale), Premium annuale e Premium mensile.
-- I valori vecchi si convertono: annuale → albero, regalo → premium-annuale,
-- mensile → premium-mensile.

alter table public.trees drop constraint if exists trees_plan_check;

update public.trees
set plan = case plan
  when 'annuale' then 'albero'
  when 'regalo' then 'premium-annuale'
  when 'mensile' then 'premium-mensile'
  else plan
end
where plan in ('annuale', 'regalo', 'mensile');

alter table public.trees
  alter column plan set default 'albero',
  add constraint trees_plan_check check (plan in ('albero', 'premium-annuale', 'premium-mensile'));
