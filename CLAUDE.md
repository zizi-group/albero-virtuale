@AGENTS.md

# Linfa (albero-virtuale)

Linfa è un albero digitale in abbonamento: la persona pianta un albero con un
carattere tutto suo, che vive con il meteo vero della sua città, decide da solo
chi diventare (filosofo, imprenditore, artista, sportivo, furfante del bosco,
viaggiatore, poeta pigro), scrive lettere per email e risponde ai messaggi.
Il progetto è spiegato nel PDF «Linfa — il progetto spiegato in due pagine».
Oggi è una **demo locale**: niente pagamenti, email solo nella casella di prova.

Tutto in italiano: codice (nomi), testi, commit, report.

## Stack

- Next.js 16 (App Router, Turbopack, Tailwind 4) in `src/`. Il middleware in
  Next 16 si chiama **proxy** (`src/proxy.ts`). Prima di usare un'API di Next
  leggi `node_modules/next/dist/docs/` (vedi `AGENTS.md`). `cacheComponents`
  è spento: modello di cache classico.
- Supabase **in locale** con la CLI (Docker): Auth con link magico e codice a
  6 cifre, Postgres con RLS, Mailpit per le email.
- Claude tramite `@anthropic-ai/sdk`: modello `claude-opus-5-5` (cambiabile con
  `LINFA_AI_MODEL`), fallback lato server attivi
  (`server-side-fallback-2026-07-01`, `fallbacks: "default"`), output
  strutturati con zod (`client.beta.messages.parse` + `zodOutputFormat`).
- Meteo da Open-Meteo, gratuito e senza chiave.

## Avvio in locale

1. Docker Desktop acceso. Nella Bash di Claude il comando `docker` non è nel
   PATH: `export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"`.
2. `supabase start` (applica le migrazioni di `supabase/migrations`).
3. `.env` con `ANTHROPIC_API_KEY` (già presente, escluso da git). `.env.local`
   con le chiavi di Supabase locale: si rigenera da `supabase status -o env`
   (vedi README). Mai stampare i valori.
4. `npm run dev` → http://localhost:3000. Email di prova: http://127.0.0.1:54324.
   Studio di Supabase: http://127.0.0.1:54323.

## Comandi

| Comando | Che cosa fa |
|---|---|
| `npm run dev` | Sito in sviluppo |
| `npm run build` | Build di produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipi delle route + `tsc` |
| `npm run notte` | Motore notturno: un giorno per ogni albero, lettera ogni 30 giorni |
| `npm run simula -- --giorni 7 [--lettera]` | Albero in memoria, senza database: per provare prompt e motore |
| `supabase gen types typescript --local > src/lib/supabase/database.types.ts` | Tipi dopo una migrazione |

## Dove sta cosa

- `src/lib/albero/`: vocabolario visivo (`tipi.ts`), libreria delle 23 azioni
  con la compatibilità col meteo (`azioni.ts`), tratti e strade (`strade.ts`),
  regole delle abitudini col meteo (`scena.ts`).
- `src/components/albero/`: `Albero.tsx` (l'albero nel suo SVG) e `Scena.tsx`
  (con il cielo) usano il pupazzo animato e interattivo di `vivo/`: scenette,
  strato di vita, clic, trascinamento, fumetti. Motore a fotogrammi senza
  librerie, CSS con prefisso `lv-` in `vivo/vivo.css`. Come si muove, scenetta
  per scenetta: `docs/animazioni-albero.md`. Le classi `l-*` di `globals.css`
  servono solo al cielo della `Scena`.
- `src/lib/motore/`: `personaggio.ts` (prompt di sistema fisso, eventi),
  `vita.ts` (giornate: parte pura, gira anche in memoria), `scritture.ts`
  (lettere e risposte), `servizio.ts` (collegato a database ed email),
  `email.ts` (SMTP di Mailpit), `ai.ts` (unico punto che chiama Claude).
- `src/app/`: `/` landing, `/accedi`, `/auth/conferma`, `/auth/esci`,
  `/pianta`, `/giardino` (con gli strumenti della demo e `?meteo=`),
  `/giardino/lettere/[id]`, `/catalogo`.
- `supabase/`: `config.toml`, migrazioni, template dell'email di accesso.

## Regole

- Le scritture nel database passano solo dal server con la chiave segreta
  (`createAdminClient`), dopo aver verificato che l'albero è della persona
  collegata. La persona legge solo le sue righe (RLS).
- Il personaggio ha regole di tono fisse in `personaggio.ts`: ironico e
  innocuo, nessuna strada delude, niente persone o marchi reali, politica,
  religione o contenuti inadatti. Si cambiano lì, non nei singoli prompt.
- L'AI sceglie solo azioni della libreria: una nuova azione si aggiunge in
  `azioni.ts` (posa) e, se serve, con oggetti o indumenti nuovi in
  `vivo/disegni.tsx` e `vivo/AlberoVivo.tsx`; la sua scenetta in
  `vivo/scenette.ts` (senza scenetta usa la posa viva con gesti a sorpresa).
- Il sistema con «movimento ridotto» ferma pioggia, neve e nuvole; il
  personaggio tiene solo i movimenti lievi (niente salti, scosse né corse).
  Sul PC di sviluppo Windows ha gli effetti di animazione spenti: il browser
  chiede movimento ridotto e l'albero si muove poco.

## Branch e versioni

Regola comune ai repository di ZIZI Group (Federico, 24/10/2026). Il testo
completo è nel file di regia `Progetti lavorativi GitHub/CLAUDE.md`, che esiste
solo sul PC di Federico: questa sezione basta per lavorare anche dalle sessioni
cloud e dalle routine.

- **Versione in corso: non ancora assegnata.** Prima di aprire un branch di
  lavoro Claude chiede a Federico il numero. La copia di `main` di una
  versione è un branch con il solo numero (per esempio `1.0`): non ci si fanno
  commit. Le versioni maggiori e minori le decide solo Federico.
- **Versione di correzione dopo ogni merge** (Federico, 26/10/2026): ogni
  lavoro unito a `main` apre la versione successiva (`1.0` → `1.0.1` →
  `1.0.2`), senza chiedere. Claude scrive qui il numero nuovo (commit diretto
  su `main`), crea da `main` il branch con il solo numero e lo pubblica, poi
  trasforma il branch della versione precedente nel tag `v<numero>` e lo
  cancella. I commit diretti di sola documentazione non aprono una versione.
- **Branch di lavoro**: `<versione>-<descrizione-breve>`, per esempio
  `1.0-fix-login`. Se lo strumento crea il branch con un altro nome
  (`claude/<nome>`), Claude lo rinomina prima del primo push con
  `git branch -m`; se il push con il nome giusto non è permesso, mette la
  versione all'inizio del titolo della pull request (`[1.0] …`).
- **Durata massima: 7 giorni** dall'ultimo commit. Dopo il merge nel branch
  principale il branch si cancella subito, in locale e su GitHub, insieme al
  suo worktree.
- **Pulizia a ogni lavoro**: prima di aprire un branch nuovo, Claude esegue
  `git fetch --prune` e cancella i branch di lavoro con l'ultimo commit di più
  di 7 giorni fa. Un branch non ancora unito al branch principale si conserva
  prima con il tag `archivio/<nome-branch>`.
- **Non si toccano mai** `main`, il branch predefinito, i branch di versione e
  i tag.
- **Push e merge**: Claude chiede prima di fare push e prima di fare merge su
  `main`.
