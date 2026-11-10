-- Il nome con cui l'albero chiama la persona nelle lettere.
alter table public.trees add column owner_name text check (char_length(owner_name) <= 40);
